import db from "../lib/db";
import logger from "../lib/logger";
import { Reddit } from "../services/reddit";
import { processLeads } from "./ai.processor";
import type { Job } from "bullmq";
import type { LeadStatus, Monitor, Icp, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../env";
import {
  MAX_SCRAPE_POSTS_LIMIT,
  MAX_SCRAPE_RETRY_COUNT,
  SCRAPE_RETRY_DELAY_MS,
} from "../lib/constants";
import { buildRedditFetchTarget } from "../lib/reddit-target";
import { notifyNewLeads } from "../services/notification.service";
import {
  automationEligibleUserWhere,
  getAutomationStateForUser,
  INACTIVITY_CANCELLATION_MESSAGE,
} from "../services/automation";

type MonitorWithIcpAndUser = Monitor & {
  icp: Icp;
  user: User;
};

type FailureContext = {
  monitorId: string;
  jobId: string;
  userId: string;
  source: "bullmq" | "stuck_job_fallback";
};

async function executeCoreScrapeLogic(
  monitorId: string,
  jobId: string,
  monitor: MonitorWithIcpAndUser,
) {
  const redditClient = new Reddit(
    env.REDDIT_CLIENT_ID,
    env.REDDIT_CLIENT_SECRET,
  );

  const startResult = await db.scrapeJob.updateMany({
    where: {
      id: jobId,
      status: { in: ["PENDING", "RUNNING"] },
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  if (startResult.count === 0) {
    logger.info(
      `[Reddit Processor] Skipping job ${jobId}: it is no longer runnable`,
    );
    return 0;
  }

  const target = buildRedditFetchTarget(monitor.targetType, monitor.target);
  const posts = await redditClient.fetchPosts(
    target,
    MAX_SCRAPE_POSTS_LIMIT,
    monitor.cursor,
  );

  if (!monitor.icp) {
    throw new Error("Monitor is missing associated ICP");
  }

  const leads = await processLeads(posts, {
    name: monitor.icp.name,
    summary: monitor.icp.summary,
    targetPersona: monitor.icp.targetPersona,
    pains: monitor.icp.pains,
    valueProposition: monitor.icp.valueProposition,
    qualifyingSignals: monitor.icp.qualifyingSignals,
    disqualifyingSignals: monitor.icp.disqualifyingSignals,
  });

  const lastPostId = posts[0]?.postId;

  const warmLeads = leads.filter((lead) => lead.leadType === "WARM");
  const coldLeads = leads.filter((lead) => lead.leadType === "COLD");
  const neutralLeads = leads.filter((lead) => lead.leadType === "NEUTRAL");

  const didCommit = await db.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const completion = await tx.scrapeJob.updateMany({
        where: {
          id: jobId,
          status: "RUNNING",
          monitor: { user: automationEligibleUserWhere() },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          warmLeads: warmLeads.length,
          coldLeads: coldLeads.length,
          neutralLeads: neutralLeads.length,
          nextRetryAt: null,
        },
      });

      if (completion.count === 0) return false;

      await tx.lead.createMany({
        data: leads.map((lead) => ({
          scrapeJobId: jobId,
          platform: lead.platform,
          leadType: lead.leadType,
          content: lead.content,
          url: lead.url,
          author: lead.author,
          reasoning: lead.reasoning,
          aiProvider: lead.aiProvider,
          status: "NEW" as LeadStatus,
        })),
        skipDuplicates: true,
      });

      await tx.monitor.update({
        where: { id: monitorId },
        data: {
          cursor: lastPostId,
          lastScrapedAt: new Date(),
        },
      });

      return true;
    },
  );

  if (!didCommit) {
    await getAutomationStateForUser(monitor.userId);
    logger.info(
      `[Reddit Processor] Discarded results for cancelled job ${jobId}`,
    );
    return 0;
  }

  // Fire the per-user Discord notification (if configured) after the leads
  // have committed. Best-effort: notifyNewLeads never throws, but we still
  // wrap it so a bug here can never fail or roll back a completed scrape job.
  try {
    const createdLeads = await db.lead.findMany({
      where: { scrapeJobId: jobId },
    });

    await notifyNewLeads({
      kind: "icp",
      userId: monitor.userId,
      monitorTarget: monitor.target,
      monitorTargetType: monitor.targetType,
      leads: createdLeads.map((lead) => ({
        content: lead.content,
        url: lead.url,
        leadType: lead.leadType,
      })),
    });
  } catch (error) {
    logger.error(
      "[Reddit Processor] Failed to send lead notifications:",
      error,
    );
  }

  return leads.length;
}

async function handleJobFailure(
  jobId: string,
  context: FailureContext,
  error: unknown,
  currentRetryCount: number,
  skipRetry: boolean,
) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const userWhere = automationEligibleUserWhere();

  if (!skipRetry && currentRetryCount < MAX_SCRAPE_RETRY_COUNT) {
    const nextRetryAt = new Date(Date.now() + SCRAPE_RETRY_DELAY_MS);
    logger.info(
      `[Reddit Processor] Scheduling retry for job ${jobId} at ${nextRetryAt.toISOString()}`,
    );

    await db.scrapeJob.updateMany({
      where: {
        id: jobId,
        status: { not: "CANCELLED" },
        monitor: { user: userWhere },
      },
      data: {
        status: "FAILED",
        retryCount: currentRetryCount,
        nextRetryAt,
        errorMessage,
      },
    });
  } else {
    logger.error(
      `[Reddit Processor] Job ${jobId} failed permanently after ${MAX_SCRAPE_RETRY_COUNT} retries: ${errorMessage}`,
    );

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const failure = await tx.scrapeJob.updateMany({
        where: {
          id: jobId,
          status: { not: "CANCELLED" },
          monitor: { user: userWhere },
        },
        data: {
          status: "FAILED",
          errorMessage,
          retryCount: currentRetryCount,
          nextRetryAt: null,
        },
      });

      if (failure.count === 0) return;

      await tx.failedScrapeJob.create({
        data: {
          monitorId: context.monitorId,
          originalJobId: jobId,
          errorMessage,
        },
      });
    });
  }

  await getAutomationStateForUser(context.userId);
}

export async function processRedditScrape(job: Job) {
  const { monitorId, jobId } = job.data;

  logger.info(
    `[Reddit Processor] Processing scrape job: ${jobId} for monitor: ${monitorId}`,
  );

  const scrapeJob = await db.scrapeJob.findUnique({
    where: { id: jobId },
  });

  if (!scrapeJob) {
    logger.warn("[Reddit Processor] Scrape job not found:", jobId);
    return;
  }

  if (scrapeJob.status === "CANCELLED") {
    logger.info(`[Reddit Processor] Skipping cancelled job ${jobId}`);
    return;
  }

  const monitor = await db.monitor.findUnique({
    where: { id: monitorId },
    include: { icp: true, user: true },
  });

  if (!monitor) {
    logger.warn("[Reddit Processor] Monitor not found:", monitorId);
    return;
  }

  if (!monitor.icp) {
    logger.warn("[Reddit Processor] Monitor has no ICP:", monitorId);
    await db.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: "Monitor has no associated ICP",
      },
    });
    return;
  }

  const automation = await getAutomationStateForUser(monitor.userId);
  if (!automation?.enabled) {
    await db.scrapeJob.updateMany({
      where: {
        id: jobId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: {
        status: "CANCELLED",
        errorMessage: INACTIVITY_CANCELLATION_MESSAGE,
        nextRetryAt: null,
      },
    });
    logger.info(`[Reddit Processor] Cancelled job ${jobId}: automation paused`);
    return;
  }

  try {
    const leadsCreated = await executeCoreScrapeLogic(
      monitorId,
      jobId,
      monitor as MonitorWithIcpAndUser,
    );

    logger.info(
      JSON.stringify({
        evt: "scrape.completed",
        jobId,
        monitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    logger.error("[Reddit Processor] Scrape failed:", error);

    await handleJobFailure(
      jobId,
      { monitorId, jobId, userId: monitor.userId, source: "bullmq" },
      error,
      scrapeJob.retryCount + 1,
      false,
    );
  }
}

export async function processStuckJob(monitorId: string, jobId: string) {
  logger.info(
    `[Reddit Processor] Processing stuck job: ${jobId} for monitor: ${monitorId}`,
  );

  const monitor = await db.monitor.findUnique({
    where: { id: monitorId },
    include: { icp: true, user: true },
  });

  if (!monitor || !monitor.icp) {
    logger.warn("[Reddit Processor] Invalid monitor for stuck job:", monitorId);
    await db.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: "Monitor or ICP not found",
      },
    });
    return;
  }

  const scrapeJob = await db.scrapeJob.findUnique({
    where: { id: jobId },
  });

  if (!scrapeJob) {
    logger.warn("[Reddit Processor] Stuck job not found:", jobId);
    return;
  }

  if (scrapeJob.status === "CANCELLED") {
    logger.info(`[Reddit Processor] Skipping cancelled stuck job ${jobId}`);
    return;
  }

  const automation = await getAutomationStateForUser(monitor.userId);
  if (!automation?.enabled) {
    await db.scrapeJob.updateMany({
      where: {
        id: jobId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: {
        status: "CANCELLED",
        errorMessage: INACTIVITY_CANCELLATION_MESSAGE,
        nextRetryAt: null,
      },
    });
    logger.info(
      `[Reddit Processor] Cancelled stuck job ${jobId}: automation paused`,
    );
    return;
  }

  try {
    const leadsCreated = await executeCoreScrapeLogic(
      monitorId,
      jobId,
      monitor as MonitorWithIcpAndUser,
    );

    logger.info(
      JSON.stringify({
        evt: "stuck_scrape.completed",
        jobId,
        monitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    logger.error("[Reddit Processor] Stuck job processing failed:", error);

    await handleJobFailure(
      jobId,
      {
        monitorId,
        jobId,
        userId: monitor.userId,
        source: "stuck_job_fallback",
      },
      error,
      scrapeJob.retryCount + 1,
      true,
    );
  }
}
