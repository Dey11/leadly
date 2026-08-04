import { Prisma } from "@prisma/client";
import db from "../lib/db";

export type IcpIdentity = {
  id: string;
  name: string;
  summary: string;
  targetPersona: string;
  pains: string;
  valueProposition: string;
  qualifyingSignals: string;
  disqualifyingSignals: string;
  platform: string;
  createdAt: Date;
};

export type MonitorIdentity = {
  id: string;
  icpId: string;
  platform: string;
  targetType: string;
  target: string;
  createdAt: Date;
};

export type DuplicateIcpGroup = {
  fingerprint: string;
  icpName: string;
  icpCount: number;
  icpIds: string[];
  createdAt: Date[];
};

export type DuplicateMonitorGroup = {
  icpFingerprint: string;
  icpName: string;
  platform: string;
  targetType: string;
  normalizedTarget: string;
  monitorCount: number;
  monitorIds: string[];
  icpIds: string[];
  createdAt: Date[];
};

export type ExactDuplicateMonitorGroup = {
  icpId: string;
  icpName: string;
  platform: string;
  targetType: string;
  normalizedTarget: string;
  monitorCount: number;
  monitorIds: string[];
  createdAt: Date[];
};

export type MonitorDiagnosticRow = {
  id: string;
  icpId: string;
  icpName: string;
  platform: string;
  targetType: string;
  target: string;
  normalizedTarget: string;
  status: string;
  createdAt: Date;
  lastScrapedAt: Date | null;
  scrapeJobCount: number;
  pendingJobCount: number;
  runningJobCount: number;
  failedJobCount: number;
  completedJobCount: number;
  failedScrapeJobCount: number;
  newestJobAt: Date | null;
};

export type MonitorDuplicateDiagnostics = {
  accountId: string;
  icpCount: number;
  monitorCount: number;
  duplicateIcpGroupCount: number;
  duplicateGroupCount: number;
  duplicateMonitorCount: number;
  exactDuplicateGroupCount: number;
  duplicateIcpGroups: DuplicateIcpGroup[];
  duplicateGroups: DuplicateMonitorGroup[];
  exactDuplicateGroups: ExactDuplicateMonitorGroup[];
  monitors: MonitorDiagnosticRow[];
};

function normalizeIdentityValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeMonitorTarget(target: string): string {
  return normalizeIdentityValue(target);
}

export function getIcpFingerprint(icp: IcpIdentity): string {
  return JSON.stringify([
    normalizeIdentityValue(icp.name),
    normalizeIdentityValue(icp.summary),
    normalizeIdentityValue(icp.targetPersona),
    normalizeIdentityValue(icp.pains),
    normalizeIdentityValue(icp.valueProposition),
    normalizeIdentityValue(icp.qualifyingSignals),
    normalizeIdentityValue(icp.disqualifyingSignals),
    icp.platform,
  ]);
}

export function findDuplicateIcpGroups(
  icps: IcpIdentity[],
): DuplicateIcpGroup[] {
  const groups = new Map<string, IcpIdentity[]>();

  for (const icp of icps) {
    const fingerprint = getIcpFingerprint(icp);
    groups.set(fingerprint, [...(groups.get(fingerprint) ?? []), icp]);
  }

  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([fingerprint, group]) => ({
      fingerprint,
      icpName: group[0].name,
      icpCount: group.length,
      icpIds: group.map((icp) => icp.id),
      createdAt: group.map((icp) => icp.createdAt),
    }))
    .sort((left, right) => left.icpName.localeCompare(right.icpName));
}

export function findBusinessDuplicateMonitorGroups(
  icps: IcpIdentity[],
  monitors: MonitorIdentity[],
): DuplicateMonitorGroup[] {
  const duplicateIcpGroups = findDuplicateIcpGroups(icps);
  const duplicateIcpById = new Map<
    string,
    { fingerprint: string; icpName: string }
  >();

  for (const group of duplicateIcpGroups) {
    for (const icpId of group.icpIds) {
      duplicateIcpById.set(icpId, {
        fingerprint: group.fingerprint,
        icpName: group.icpName,
      });
    }
  }

  const groups = new Map<
    string,
    { icpFingerprint: string; icpName: string; monitors: MonitorIdentity[] }
  >();

  for (const monitor of monitors) {
    const duplicateIcp = duplicateIcpById.get(monitor.icpId);
    if (!duplicateIcp) continue;

    const key = JSON.stringify([
      duplicateIcp.fingerprint,
      monitor.platform,
      monitor.targetType,
      normalizeMonitorTarget(monitor.target),
    ]);
    const current = groups.get(key);
    groups.set(key, {
      icpFingerprint: duplicateIcp.fingerprint,
      icpName: duplicateIcp.icpName,
      monitors: [...(current?.monitors ?? []), monitor],
    });
  }

  return [...groups.values()]
    .filter(
      (group) =>
        group.monitors.length > 1 &&
        new Set(group.monitors.map((monitor) => monitor.icpId)).size > 1,
    )
    .map((group) => ({
      icpFingerprint: group.icpFingerprint,
      icpName: group.icpName,
      platform: group.monitors[0].platform,
      targetType: group.monitors[0].targetType,
      normalizedTarget: normalizeMonitorTarget(group.monitors[0].target),
      monitorCount: group.monitors.length,
      monitorIds: group.monitors.map((monitor) => monitor.id),
      icpIds: group.monitors.map((monitor) => monitor.icpId),
      createdAt: group.monitors.map((monitor) => monitor.createdAt),
    }))
    .sort((left, right) =>
      left.normalizedTarget.localeCompare(right.normalizedTarget),
    );
}

export async function getMonitorDuplicateDiagnostics(
  email: string,
): Promise<MonitorDuplicateDiagnostics | null> {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;

    const account = await tx.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    if (!account) {
      return null;
    }

    const icps = await tx.icp.findMany({
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
    });

    const exactDuplicateGroups = await tx.$queryRaw<
      ExactDuplicateMonitorGroup[]
    >(
      Prisma.sql`
        SELECT
          m."icpId" AS "icpId",
          i.name AS "icpName",
          m.platform::text AS platform,
          m."targetType"::text AS "targetType",
          lower(trim(m.target)) AS "normalizedTarget",
          count(*)::int AS "monitorCount",
          array_agg(m.id ORDER BY m."createdAt", m.id) AS "monitorIds",
          array_agg(m."createdAt" ORDER BY m."createdAt", m.id) AS "createdAt"
        FROM monitors m
        INNER JOIN icps i ON i.id = m."icpId"
        WHERE m."userId" = ${account.id}
        GROUP BY
          m."icpId",
          i.name,
          m.platform,
          m."targetType",
          lower(trim(m.target))
        HAVING count(*) > 1
        ORDER BY count(*) DESC, lower(trim(m.target)), i.name
      `,
    );

    const monitors = await tx.$queryRaw<MonitorDiagnosticRow[]>(Prisma.sql`
      SELECT
        m.id,
        m."icpId" AS "icpId",
        i.name AS "icpName",
        m.platform::text AS platform,
        m."targetType"::text AS "targetType",
        m.target,
        lower(trim(m.target)) AS "normalizedTarget",
        m.status::text AS status,
        m."createdAt" AS "createdAt",
        m."lastScrapedAt" AS "lastScrapedAt",
        count(DISTINCT j.id)::int AS "scrapeJobCount",
        count(DISTINCT j.id) FILTER (WHERE j.status = 'PENDING')::int AS "pendingJobCount",
        count(DISTINCT j.id) FILTER (WHERE j.status = 'RUNNING')::int AS "runningJobCount",
        count(DISTINCT j.id) FILTER (WHERE j.status = 'FAILED')::int AS "failedJobCount",
        count(DISTINCT j.id) FILTER (WHERE j.status = 'COMPLETED')::int AS "completedJobCount",
        count(DISTINCT fj.id)::int AS "failedScrapeJobCount",
        max(j."createdAt") AS "newestJobAt"
      FROM monitors m
      INNER JOIN icps i ON i.id = m."icpId"
      LEFT JOIN scrape_jobs j ON j."monitorId" = m.id
      LEFT JOIN failed_scrape_jobs fj ON fj."monitorId" = m.id
      WHERE m."userId" = ${account.id}
      GROUP BY m.id, i.name
      ORDER BY lower(trim(m.target)), i.name, m."createdAt", m.id
    `);

    const duplicateIcpGroups = findDuplicateIcpGroups(icps);
    const duplicateGroups = findBusinessDuplicateMonitorGroups(icps, monitors);

    return {
      accountId: account.id,
      icpCount: icps.length,
      monitorCount: monitors.length,
      duplicateIcpGroupCount: duplicateIcpGroups.length,
      duplicateGroupCount: duplicateGroups.length,
      duplicateMonitorCount: duplicateGroups.reduce(
        (total, group) => total + group.monitorCount,
        0,
      ),
      exactDuplicateGroupCount: exactDuplicateGroups.length,
      duplicateIcpGroups,
      duplicateGroups,
      exactDuplicateGroups,
      monitors,
    };
  });
}
