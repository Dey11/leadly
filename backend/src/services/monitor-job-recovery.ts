import { Prisma } from "@prisma/client";
import db from "../lib/db";
import { scrapeJobsQueue } from "../lib/queue";
import { MonitorDuplicateRepairError } from "./monitor-duplicate-repair";

const STALE_JOB_WINDOW_MS = 20 * 60 * 1000;

export type RecoverableMonitorJob = {
  id: string;
  monitorId: string;
  monitorTarget: string;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
};

type ReplacementJob = {
  id: string;
  monitorId: string;
};

export type MonitorJobRecoveryResult = {
  accountId: string;
  applied: boolean;
  recoverableJobs: RecoverableMonitorJob[];
  replacementJobs: ReplacementJob[];
  queueFailures: string[];
};

async function findRecoverableJobs(
  tx: Prisma.TransactionClient,
  accountId: string,
) {
  const cutoff = new Date(Date.now() - STALE_JOB_WINDOW_MS);
  return tx.scrapeJob.findMany({
    where: {
      monitor: { userId: accountId },
      OR: [
        { status: "PENDING", createdAt: { lte: cutoff } },
        { status: "RUNNING", startedAt: { lte: cutoff } },
        { status: "RUNNING", startedAt: null, createdAt: { lte: cutoff } },
      ],
    },
    select: {
      id: true,
      monitorId: true,
      status: true,
      createdAt: true,
      startedAt: true,
      monitor: { select: { target: true } },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export async function recoverStaleMonitorJobs(input: {
  email: string;
  dryRun: boolean;
  confirmAccountId?: string;
  confirmJobIds?: string[];
}): Promise<MonitorJobRecoveryResult> {
  const transactionResult = await db.$transaction(
    async (tx) => {
      if (input.dryRun) {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      }

      const account = await tx.user.findUnique({
        where: { email: input.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (!account) {
        throw new MonitorDuplicateRepairError("Account not found", 404);
      }

      const jobs = await findRecoverableJobs(tx, account.id);
      const recoverableJobs = jobs.map((job) => ({
        id: job.id,
        monitorId: job.monitorId,
        monitorTarget: job.monitor.target,
        status: job.status,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
      }));

      if (input.dryRun) {
        return {
          accountId: account.id,
          applied: false,
          recoverableJobs,
          replacementJobs: [] as ReplacementJob[],
        };
      }

      if (input.confirmAccountId !== account.id) {
        throw new MonitorDuplicateRepairError(
          "confirmAccountId must exactly match the inspected account",
          400,
        );
      }

      const expectedIds = recoverableJobs.map((job) => job.id).sort();
      const confirmedIds = [...(input.confirmJobIds ?? [])].sort();
      if (JSON.stringify(expectedIds) !== JSON.stringify(confirmedIds)) {
        throw new MonitorDuplicateRepairError(
          "confirmJobIds must exactly match the current recovery preview",
          409,
        );
      }

      if (expectedIds.length === 0) {
        return {
          accountId: account.id,
          applied: true,
          recoverableJobs,
          replacementJobs: [] as ReplacementJob[],
        };
      }

      await tx.scrapeJob.updateMany({
        where: { id: { in: expectedIds } },
        data: {
          status: "FAILED",
          errorMessage:
            "Closed after the worker stopped making progress; replaced with a fresh scrape job.",
          nextRetryAt: null,
        },
      });

      const replacementJobs: ReplacementJob[] = [];
      for (const monitorId of [
        ...new Set(recoverableJobs.map((job) => job.monitorId)),
      ]) {
        const otherActiveJob = await tx.scrapeJob.findFirst({
          where: {
            monitorId,
            status: { in: ["PENDING", "RUNNING"] },
          },
          select: { id: true },
        });
        if (otherActiveJob) continue;

        const replacement = await tx.scrapeJob.create({
          data: { monitorId, status: "PENDING" },
          select: { id: true, monitorId: true },
        });
        replacementJobs.push(replacement);
      }

      return {
        accountId: account.id,
        applied: true,
        recoverableJobs,
        replacementJobs,
      };
    },
    { isolationLevel: "Serializable" },
  );

  const queueFailures: string[] = [];
  for (const replacement of transactionResult.replacementJobs) {
    try {
      await scrapeJobsQueue.add("scrapeJobs", {
        monitorId: replacement.monitorId,
        jobId: replacement.id,
      });
    } catch {
      queueFailures.push(replacement.id);
    }
  }

  return { ...transactionResult, queueFailures };
}
