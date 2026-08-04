import { Prisma } from "@prisma/client";
import db from "../lib/db";
import {
  findDuplicateIcpGroups,
  getIcpFingerprint,
  normalizeMonitorTarget,
  type IcpIdentity,
  type MonitorIdentity,
} from "./monitor-diagnostics";

const MERGED_ID_PREFIX = "merged_";
const RECENT_ACTIVE_JOB_WINDOW_MS = 20 * 60 * 1000;

type RepairMonitor = MonitorIdentity & {
  cursor: string | null;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  lastScrapedAt: Date | null;
};

export type MonitorMerge = {
  keeperMonitorId: string;
  redundantMonitorId: string;
  normalizedTarget: string;
};

export type MonitorMove = {
  monitorId: string;
  fromIcpId: string;
  toIcpId: string;
  normalizedTarget: string;
};

export type IcpRepairGroup = {
  icpName: string;
  canonicalIcpId: string;
  redundantIcpIds: string[];
  monitorMerges: MonitorMerge[];
  monitorMoves: MonitorMove[];
};

export type MonitorDuplicateRepairPlan = {
  accountId: string;
  duplicateIcpCount: number;
  duplicateMonitorCount: number;
  movedMonitorCount: number;
  groups: IcpRepairGroup[];
};

export type ActiveRepairJob = {
  id: string;
  monitorId: string;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
};

export type MonitorDuplicateRepairResult = {
  applied: boolean;
  plan: MonitorDuplicateRepairPlan;
  recentActiveJobs: ActiveRepairJob[];
  staleJobsClosed: number;
  scrapeJobsRemoved: number;
  scrapeJobsPreserved: number;
  leadsPreserved: number;
};

export class MonitorDuplicateRepairError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

function monitorKey(monitor: MonitorIdentity): string {
  return JSON.stringify([
    monitor.platform,
    monitor.targetType,
    normalizeMonitorTarget(monitor.target),
  ]);
}

export function buildMonitorDuplicateRepairPlan(
  accountId: string,
  icps: IcpIdentity[],
  monitors: RepairMonitor[],
): MonitorDuplicateRepairPlan {
  const duplicateIcpGroups = findDuplicateIcpGroups(icps);
  const groups: IcpRepairGroup[] = [];

  for (const duplicateGroup of duplicateIcpGroups) {
    const groupIcps = icps.filter(
      (icp) => getIcpFingerprint(icp) === duplicateGroup.fingerprint,
    );
    const canonicalIcps = groupIcps.filter(
      (icp) => !icp.id.startsWith(MERGED_ID_PREFIX),
    );
    const redundantIcps = groupIcps.filter((icp) =>
      icp.id.startsWith(MERGED_ID_PREFIX),
    );

    if (
      canonicalIcps.length !== 1 ||
      redundantIcps.length !== groupIcps.length - 1
    ) {
      throw new MonitorDuplicateRepairError(
        `Cannot safely choose a canonical ICP for ${duplicateGroup.icpName}`,
        409,
      );
    }

    const canonicalIcp = canonicalIcps[0];
    const canonicalMonitors = new Map<string, RepairMonitor[]>();

    for (const monitor of monitors.filter(
      (item) => item.icpId === canonicalIcp.id,
    )) {
      const key = monitorKey(monitor);
      canonicalMonitors.set(key, [
        ...(canonicalMonitors.get(key) ?? []),
        monitor,
      ]);
    }

    const monitorMerges: MonitorMerge[] = [];
    const monitorMoves: MonitorMove[] = [];

    for (const redundantIcp of redundantIcps) {
      for (const monitor of monitors.filter(
        (item) => item.icpId === redundantIcp.id,
      )) {
        const key = monitorKey(monitor);
        const matches = canonicalMonitors.get(key) ?? [];

        if (matches.length > 1) {
          throw new MonitorDuplicateRepairError(
            `Canonical ICP has multiple monitors for ${monitor.target}`,
            409,
          );
        }

        if (matches.length === 1) {
          monitorMerges.push({
            keeperMonitorId: matches[0].id,
            redundantMonitorId: monitor.id,
            normalizedTarget: normalizeMonitorTarget(monitor.target),
          });
        } else {
          monitorMoves.push({
            monitorId: monitor.id,
            fromIcpId: redundantIcp.id,
            toIcpId: canonicalIcp.id,
            normalizedTarget: normalizeMonitorTarget(monitor.target),
          });
          canonicalMonitors.set(key, [monitor]);
        }
      }
    }

    groups.push({
      icpName: duplicateGroup.icpName,
      canonicalIcpId: canonicalIcp.id,
      redundantIcpIds: redundantIcps.map((icp) => icp.id),
      monitorMerges,
      monitorMoves,
    });
  }

  return {
    accountId,
    duplicateIcpCount: groups.reduce(
      (count, group) => count + group.redundantIcpIds.length,
      0,
    ),
    duplicateMonitorCount: groups.reduce(
      (count, group) => count + group.monitorMerges.length,
      0,
    ),
    movedMonitorCount: groups.reduce(
      (count, group) => count + group.monitorMoves.length,
      0,
    ),
    groups,
  };
}

async function loadRepairState(tx: Prisma.TransactionClient, email: string) {
  const account = await tx.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });

  if (!account) {
    throw new MonitorDuplicateRepairError("Account not found", 404);
  }

  const [icps, monitors] = await Promise.all([
    tx.icp.findMany({
      where: { userId: account.id },
      select: {
        id: true,
        name: true,
        summary: true,
        targetPersona: true,
        pains: true,
        valueProposition: true,
        qualifyingSignals: true,
        disqualifyingSignals: true,
        platform: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    tx.monitor.findMany({
      where: { userId: account.id },
      select: {
        id: true,
        icpId: true,
        platform: true,
        targetType: true,
        target: true,
        cursor: true,
        status: true,
        lastScrapedAt: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
  ]);

  return {
    account,
    icps,
    monitors,
    plan: buildMonitorDuplicateRepairPlan(account.id, icps, monitors),
  };
}

function affectedMonitorIds(plan: MonitorDuplicateRepairPlan): string[] {
  return [
    ...new Set(
      plan.groups.flatMap((group) => [
        ...group.monitorMerges.flatMap((merge) => [
          merge.keeperMonitorId,
          merge.redundantMonitorId,
        ]),
        ...group.monitorMoves.map((move) => move.monitorId),
      ]),
    ),
  ];
}

async function findRecentActiveJobs(
  tx: Prisma.TransactionClient,
  monitorIds: string[],
): Promise<ActiveRepairJob[]> {
  if (monitorIds.length === 0) return [];

  const cutoff = new Date(Date.now() - RECENT_ACTIVE_JOB_WINDOW_MS);
  return tx.scrapeJob.findMany({
    where: {
      monitorId: { in: monitorIds },
      status: { in: ["PENDING", "RUNNING"] },
      OR: [{ createdAt: { gte: cutoff } }, { startedAt: { gte: cutoff } }],
    },
    select: {
      id: true,
      monitorId: true,
      status: true,
      createdAt: true,
      startedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function mergeMonitorHistory(
  tx: Prisma.TransactionClient,
  keeperMonitorId: string,
  redundantMonitorId: string,
) {
  const leadsPreserved = await tx.$executeRaw(Prisma.sql`
    UPDATE leads l
    SET "scrapeJobId" = keeper_job.id
    FROM scrape_jobs redundant_job
    INNER JOIN scrape_jobs keeper_job
      ON keeper_job."monitorId" = ${keeperMonitorId}
      AND keeper_job."createdAt" = redundant_job."createdAt"
    WHERE l."scrapeJobId" = redundant_job.id
      AND redundant_job."monitorId" = ${redundantMonitorId}
  `);

  const scrapeJobsRemoved = await tx.$executeRaw(Prisma.sql`
    DELETE FROM scrape_jobs redundant_job
    WHERE redundant_job."monitorId" = ${redundantMonitorId}
      AND (
        EXISTS (
          SELECT 1
          FROM scrape_jobs keeper_job
          WHERE keeper_job."monitorId" = ${keeperMonitorId}
            AND keeper_job."createdAt" = redundant_job."createdAt"
        )
        OR NOT EXISTS (
          SELECT 1
          FROM leads l
          WHERE l."scrapeJobId" = redundant_job.id
        )
      )
  `);

  const scrapeJobsPreserved = await tx.scrapeJob.updateMany({
    where: { monitorId: redundantMonitorId },
    data: { monitorId: keeperMonitorId },
  });

  await tx.failedScrapeJob.updateMany({
    where: { monitorId: redundantMonitorId },
    data: { monitorId: keeperMonitorId },
  });

  return {
    leadsPreserved,
    scrapeJobsRemoved,
    scrapeJobsPreserved: scrapeJobsPreserved.count,
  };
}

export async function repairMonitorDuplicates(input: {
  email: string;
  dryRun: boolean;
  confirmAccountId?: string;
}): Promise<MonitorDuplicateRepairResult> {
  return db.$transaction(
    async (tx) => {
      if (input.dryRun) {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      }

      const { account, monitors, plan } = await loadRepairState(
        tx,
        input.email,
      );
      const monitorIds = affectedMonitorIds(plan);
      const recentActiveJobs = await findRecentActiveJobs(tx, monitorIds);
      const emptyResult = {
        plan,
        recentActiveJobs,
        staleJobsClosed: 0,
        scrapeJobsRemoved: 0,
        scrapeJobsPreserved: 0,
        leadsPreserved: 0,
      };

      if (input.dryRun) {
        return { ...emptyResult, applied: false };
      }

      if (input.confirmAccountId !== account.id) {
        throw new MonitorDuplicateRepairError(
          "confirmAccountId must exactly match the inspected account",
          400,
        );
      }

      if (recentActiveJobs.length > 0) {
        throw new MonitorDuplicateRepairError(
          `Repair blocked while ${recentActiveJobs.length} recent scrape jobs may still be active`,
          409,
        );
      }

      const staleJobsClosed = await tx.scrapeJob.updateMany({
        where: {
          monitorId: { in: monitorIds },
          status: { in: ["PENDING", "RUNNING"] },
        },
        data: {
          status: "FAILED",
          errorMessage:
            "Closed as stale during duplicate-monitor repair; a fresh scrape will be scheduled.",
          nextRetryAt: null,
        },
      });

      let scrapeJobsRemoved = 0;
      let scrapeJobsPreserved = 0;
      let leadsPreserved = 0;

      for (const group of plan.groups) {
        for (const merge of group.monitorMerges) {
          const keeper = monitors.find(
            (monitor) => monitor.id === merge.keeperMonitorId,
          );
          const redundant = monitors.find(
            (monitor) => monitor.id === merge.redundantMonitorId,
          );

          if (!keeper || !redundant) {
            throw new MonitorDuplicateRepairError(
              "Monitor changed while the repair was being prepared",
              409,
            );
          }

          const history = await mergeMonitorHistory(
            tx,
            merge.keeperMonitorId,
            merge.redundantMonitorId,
          );
          scrapeJobsRemoved += history.scrapeJobsRemoved;
          scrapeJobsPreserved += history.scrapeJobsPreserved;
          leadsPreserved += history.leadsPreserved;

          const latest = [keeper, redundant]
            .filter((monitor) => monitor.lastScrapedAt)
            .sort(
              (left, right) =>
                right.lastScrapedAt!.getTime() - left.lastScrapedAt!.getTime(),
            )[0];

          if (latest) {
            await tx.monitor.update({
              where: { id: merge.keeperMonitorId },
              data: {
                lastScrapedAt: latest.lastScrapedAt,
                cursor: latest.cursor,
              },
            });
          }
          await tx.monitor.delete({
            where: { id: merge.redundantMonitorId },
          });
        }

        for (const move of group.monitorMoves) {
          await tx.monitor.update({
            where: { id: move.monitorId },
            data: { icpId: move.toIcpId },
          });
        }

        await tx.icp.deleteMany({
          where: { id: { in: group.redundantIcpIds } },
        });
      }

      return {
        applied: true,
        plan,
        recentActiveJobs: [],
        staleJobsClosed: staleJobsClosed.count,
        scrapeJobsRemoved,
        scrapeJobsPreserved,
        leadsPreserved,
      };
    },
    { isolationLevel: "Serializable", timeout: 120_000 },
  );
}
