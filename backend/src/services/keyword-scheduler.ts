import db from "../lib/db";
import logger from "../lib/logger";
import {
  processKeywordScrapeJob,
  processKeywordStuckJob,
} from "../processors/keyword.processor";
import {
  MAX_SCRAPE_RETRY_COUNT,
  STUCK_PENDING_THRESHOLD_MS,
} from "../lib/constants";
import { tryConsumeScrapeCredit } from "../lib/usage";
import { env } from "../env";
import { getAutomationStateForUser } from "./automation";

async function pickupKeywordRetryJobs() {
  const now = new Date();

  const jobsToRetry = await db.keywordScrapeJob.findMany({
    where: {
      status: "FAILED",
      retryCount: { lt: MAX_SCRAPE_RETRY_COUNT },
      nextRetryAt: { lte: now },
      keywordMonitor: {
        user: {
          isDeleted: false,
        },
      },
    },
    include: {
      keywordMonitor: { include: { keywordSet: true } },
    },
  });

  logger.info(
    `[Keyword Scheduler] Found ${jobsToRetry.length} jobs ready for retry`,
  );

  for (const job of jobsToRetry) {
    try {
      const automation = await getAutomationStateForUser(
        job.keywordMonitor.userId,
      );
      if (!automation?.enabled) {
        logger.info(
          `[Keyword Scheduler] Skipping retry job ${job.id}: account automation is paused`,
        );
        continue;
      }

      logger.info(
        `[Keyword Scheduler] Retrying job ${job.id} (attempt ${
          job.retryCount + 1
        }/${MAX_SCRAPE_RETRY_COUNT})`,
      );

      await db.keywordScrapeJob.update({
        where: { id: job.id },
        data: { status: "PENDING" },
      });

      // Process immediately (keyword matching is fast)
      await processKeywordScrapeJob(job.keywordMonitorId, job.id);

      logger.info(`[Keyword Scheduler] Retry completed for job ${job.id}`);
    } catch (error) {
      logger.error(`[Keyword Scheduler] Failed to retry job ${job.id}:`, error);
    }
  }
}

async function processStuckKeywordJobs() {
  const stuckThreshold = new Date(Date.now() - STUCK_PENDING_THRESHOLD_MS);

  const stuckJobs = await db.keywordScrapeJob.findMany({
    where: {
      OR: [
        { status: "PENDING", createdAt: { lte: stuckThreshold } },
        { status: "RUNNING", startedAt: { lte: stuckThreshold } },
        {
          status: "RUNNING",
          startedAt: null,
          createdAt: { lte: stuckThreshold },
        },
      ],
      keywordMonitor: {
        user: {
          isDeleted: false,
        },
      },
    },
    include: {
      keywordMonitor: { include: { keywordSet: true, user: true } },
    },
  });

  logger.info(
    `[Keyword Scheduler] Found ${stuckJobs.length} stuck PENDING/RUNNING jobs (>6 hours old)`,
  );

  for (const job of stuckJobs) {
    try {
      const automation = await getAutomationStateForUser(
        job.keywordMonitor.userId,
      );
      if (!automation?.enabled) {
        logger.info(
          `[Keyword Scheduler] Skipping stuck job ${job.id}: account automation is paused`,
        );
        continue;
      }

      logger.info(
        JSON.stringify({
          evt: "keyword_scheduler.stuck_job_processing",
          jobId: job.id,
          keywordMonitorId: job.keywordMonitorId,
          status: job.status,
          createdAt: job.createdAt.toISOString(),
          ageHours: Math.round(
            (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60),
          ),
        }),
      );

      await processKeywordStuckJob(job.keywordMonitorId, job.id);

      logger.info(
        JSON.stringify({
          evt: "keyword_scheduler.stuck_job_completed",
          jobId: job.id,
        }),
      );
    } catch (error) {
      logger.error(
        JSON.stringify({
          evt: "keyword_scheduler.stuck_job_failed",
          jobId: job.id,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );
    }
  }
}

/**
 * Keyword scheduler - runs hourly at minute 30
 * Includes stuck job recovery and retry logic (mirroring lead gen scheduler)
 * Only processes monitors for users who have the current hour in their KeywordSchedule
 */
export async function runKeywordScheduler() {
  logger.info("[Keyword Scheduler] Running...");

  // Recover jobs orphaned before or during worker execution.
  await processStuckKeywordJobs();

  // Pick up retry jobs
  await pickupKeywordRetryJobs();

  const currentHour = new Date().getUTCHours();
  logger.info(`[Keyword Scheduler] Current UTC hour: ${currentHour}`);

  // Find all users who have the current hour in their keyword schedule
  const usersWithScheduledHour = await db.keywordSchedule.findMany({
    where: {
      scheduledHours: {
        has: currentHour,
      },
      user: {
        isDeleted: false,
        subscription: {
          isNot: null,
        },
      },
    },
    include: {
      user: {
        include: {
          subscription: true,
          keywordMonitors: {
            where: {
              status: "ACTIVE",
            },
            include: {
              keywordSet: true,
            },
          },
        },
      },
    },
  });

  logger.info(
    `[Keyword Scheduler] Found ${usersWithScheduledHour.length} users with current hour in keyword schedule`,
  );

  for (const keywordSchedule of usersWithScheduledHour) {
    const { user } = keywordSchedule;

    if (!user.subscription) {
      continue;
    }

    const automation = await getAutomationStateForUser(user.id);
    if (!automation?.enabled) {
      logger.info(
        JSON.stringify({
          evt: "keyword_scheduler.automation_paused",
          userId: user.id,
          pauseReason: automation?.pauseReason ?? null,
        }),
      );
      continue;
    }

    const monitors = user.keywordMonitors;

    if (monitors.length === 0) {
      logger.info(
        `[Keyword Scheduler] User ${user.id} has no active keyword monitors`,
      );
      continue;
    }

    // Enforce daily scrape limits
    const tier = user.subscription.tier;
    const { allowed, reason, summary } = await tryConsumeScrapeCredit(
      user.id,
      tier,
      user.subscription.currentPeriodEnd,
      env.FEATURE_BILLING_ENFORCEMENT,
      "KEYWORD",
    );

    if (!allowed) {
      logger.warn(
        JSON.stringify({
          evt: "keyword_scheduler.blocked",
          userId: user.id,
          reason,
          monitorCount: monitors.length,
          dailyUsed: summary.dailyUsed,
          dailyLimit: summary.dailyLimit,
        }),
      );
      continue;
    }

    logger.info(
      `[Keyword Scheduler] Processing ${monitors.length} monitors for user ${user.id}`,
    );

    for (const monitor of monitors) {
      try {
        // Check if there's already a pending/running job
        const existingJob = await db.keywordScrapeJob.findFirst({
          where: {
            keywordMonitorId: monitor.id,
            status: { in: ["PENDING", "RUNNING"] },
          },
        });

        if (existingJob) {
          logger.info(
            `[Keyword Scheduler] Skipping monitor ${monitor.id} - job already ${existingJob.status}`,
          );
          continue;
        }

        // Create new scrape job
        const scrapeJob = await db.keywordScrapeJob.create({
          data: {
            keywordMonitorId: monitor.id,
            status: "PENDING",
          },
        });

        logger.info(
          `[Keyword Scheduler] Created job for monitor ${monitor.id}`,
        );

        // Process immediately (keyword matching is fast, no need for queue)
        try {
          await processKeywordScrapeJob(monitor.id, scrapeJob.id);
        } catch (err) {
          logger.error(
            `[Keyword Scheduler] Failed to process monitor ${monitor.id}:`,
            err,
          );
        }
      } catch (err) {
        logger.error(
          `[Keyword Scheduler] Error scheduling monitor ${monitor.id}:`,
          err,
        );
      }
    }
  }

  logger.info("[Keyword Scheduler] Complete");
}
