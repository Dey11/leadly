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

type MonitorWithIcpAndUser = Monitor & {
  icp: Icp;
  user: User;
};

type FailureContext = {
  monitorId: string;
  jobId: string;
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

  await db.scrapeJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

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

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
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

    await tx.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        warmLeads: warmLeads.length,
        coldLeads: coldLeads.length,
        neutralLeads: neutralLeads.length,
        nextRetryAt: null,
      },
    });

    await tx.monitor.update({
      where: { id: monitorId },
      data: {
        cursor: lastPostId,
        lastScrapedAt: new Date(),
      },
    });
  });

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

  if (!skipRetry && currentRetryCount < MAX_SCRAPE_RETRY_COUNT) {
    const nextRetryAt = new Date(Date.now() + SCRAPE_RETRY_DELAY_MS);
    logger.info(
      `[Reddit Processor] Scheduling retry for job ${jobId} at ${nextRetryAt.toISOString()}`,
    );

    await db.scrapeJob.update({
      where: { id: jobId },
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
      await tx.failedScrapeJob.create({
        data: {
          monitorId: context.monitorId,
          originalJobId: jobId,
          errorMessage,
        },
      });

      await tx.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage,
          retryCount: currentRetryCount,
          nextRetryAt: null,
        },
      });
    });
  }
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
      { monitorId, jobId, source: "bullmq" },
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
      { monitorId, jobId, source: "stuck_job_fallback" },
      error,
      scrapeJob.retryCount + 1,
      true,
    );
  }
}
