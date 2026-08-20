import { scrapeJobsQueue } from "../lib/queue";
import logger from "../lib/logger";
import db from "../lib/db";
import { env } from "../env";
import {
  TIER_LIMITS,
  MAX_SCRAPE_RETRY_COUNT,
  STUCK_PENDING_THRESHOLD_MS,
} from "../lib/constants";
import { tryConsumeScrapeCredit, previewUsage } from "../lib/usage";
import { processStuckJob } from "../processors/reddit.processor";
import { getAutomationStateForUser } from "./automation";

async function pickupRetryJobs() {
  const now = new Date();

  const jobsToRetry = await db.scrapeJob.findMany({
    where: {
      status: "FAILED",
      retryCount: { lt: MAX_SCRAPE_RETRY_COUNT },
      nextRetryAt: { lte: now },
      monitor: {
        user: {
          isDeleted: false,
        },
      },
    },
    include: {
      monitor: { include: { icp: true } },
    },
  });

  logger.info(`Found ${jobsToRetry.length} jobs ready for retry`);

  for (const job of jobsToRetry) {
    try {
      const automation = await getAutomationStateForUser(job.monitor.userId);
      if (!automation?.enabled) {
        logger.info(
          `Skipping retry job ${job.id}: account automation is paused`,
        );
        continue;
      }

      logger.info(
        `Retrying job ${job.id} (attempt ${
          job.retryCount + 1
        }/${MAX_SCRAPE_RETRY_COUNT})`,
      );

      await db.scrapeJob.update({
        where: { id: job.id },
        data: { status: "PENDING" },
      });

      await scrapeJobsQueue.add("scrapeJobs", {
        monitorId: job.monitorId,
        jobId: job.id,
      });

      logger.info(`Scheduled retry for job ${job.id}`);
    } catch (error) {
      logger.error(`Failed to schedule retry for job ${job.id}:`, error);
    }
  }
}

async function processStuckJobs() {
  const stuckThreshold = new Date(Date.now() - STUCK_PENDING_THRESHOLD_MS);

  const stuckJobs = await db.scrapeJob.findMany({
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
      monitor: {
        user: {
          isDeleted: false,
        },
      },
    },
    include: {
      monitor: { include: { icp: true, user: true } },
    },
  });

  logger.info(
    `Found ${stuckJobs.length} stuck PENDING/RUNNING jobs (>6 hours old)`,
  );

  for (const job of stuckJobs) {
    try {
      const automation = await getAutomationStateForUser(job.monitor.userId);
      if (!automation?.enabled) {
        logger.info(
          `Skipping stuck job ${job.id}: account automation is paused`,
        );
        continue;
      }

      logger.info(
        JSON.stringify({
          evt: "scheduler.stuck_job_processing",
          jobId: job.id,
          monitorId: job.monitorId,
          status: job.status,
          createdAt: job.createdAt.toISOString(),
          ageHours: Math.round(
            (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60),
          ),
        }),
      );

      await processStuckJob(job.monitorId, job.id);

      logger.info(
        JSON.stringify({
          evt: "scheduler.stuck_job_completed",
          jobId: job.id,
        }),
      );
    } catch (error) {
      logger.error(
        JSON.stringify({
          evt: "scheduler.stuck_job_failed",
          jobId: job.id,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );
    }
  }
}

export async function runScheduler() {
  logger.info("Running scheduler");

  // Recover jobs orphaned before or during worker execution.
  await processStuckJobs();

  // Pick up retry jobs
  await pickupRetryJobs();

  const currentHour = new Date().getUTCHours();
  logger.info(`Current UTC hour: ${currentHour}`);

  // Find all users who have the current hour in their schedule
  const usersWithScheduledHour = await db.userSchedule.findMany({
    where: {
      scheduledHours: {
        has: currentHour,
      },
    },
    include: {
      user: {
        include: {
          subscription: true,
          monitors: {
            where: {
              status: "ACTIVE",
            },
            include: {
              icp: true,
            },
          },
        },
      },
    },
  });

  logger.info(`Users with scheduled hour: ${usersWithScheduledHour.length}`);

  for (const userSchedule of usersWithScheduledHour) {
    const { user } = userSchedule;

    if (user.isDeleted || !user.subscription) {
      continue;
    }

    const automation = await getAutomationStateForUser(user.id);
    if (!automation?.enabled) {
      logger.info(
        JSON.stringify({
          evt: "scheduler.automation_paused",
          userId: user.id,
          pausedForInactivity: automation?.pausedForInactivity ?? false,
        }),
      );
      continue;
    }

    const tier = user.subscription.tier;
    const limits = TIER_LIMITS[tier];

    // Preview current usage for logs
    const usagePreview = await previewUsage(
      user.id,
      tier,
      user.subscription.currentPeriodEnd,
    );
    logger.info(
      JSON.stringify({
        evt: "scheduler.usage_preview",
        userId: user.id,
        tier,
        dailyUsed: usagePreview.dailyUsed,
        dailyLimit: usagePreview.dailyLimit,
        monthlyUsed: usagePreview.monthlyUsed,
        monthlyLimit: usagePreview.monthlyLimit,
      }),
    );

    if (user.monitors.length === 0) {
      continue;
    }

    const { allowed, reason, summary } = await tryConsumeScrapeCredit(
      user.id,
      tier,
      user.subscription.currentPeriodEnd,
      env.FEATURE_BILLING_ENFORCEMENT, // "off" | "log" | "on"
    );

    if (!allowed) {
      // Block when enforcement is "on"
      logger.warn(
        JSON.stringify({
          evt: "scheduler.blocked",
          userId: user.id,
          reason,
          monitorCount: user.monitors.length,
          dailyUsed: summary.dailyUsed,
          dailyLimit: summary.dailyLimit,
          monthlyUsed: summary.monthlyUsed,
          monthlyLimit: summary.monthlyLimit,
        }),
      );
      continue;
    }

    for (const monitor of user.monitors) {
      try {
        const existingJob = await db.scrapeJob.findFirst({
          where: {
            monitorId: monitor.id,
            status: {
              in: ["PENDING", "RUNNING"],
            },
          },
        });

        if (existingJob) {
          logger.info(
            `Skipping monitor ${monitor.id} because a job is already ${existingJob.status}`,
          );
          continue;
        }

        logger.info(`Creating scrape job for monitor: ${monitor.id}`);
        const scrapeJob = await db.scrapeJob.create({
          data: {
            monitorId: monitor.id,
            status: "PENDING",
          },
        });

        await scrapeJobsQueue.add("scrapeJobs", {
          monitorId: monitor.id,
          jobId: scrapeJob.id,
        });
        logger.info(`Scrape job created for monitor: ${monitor.id}`);
      } catch (error) {
        logger.error(
          `Failed to schedule scrape job for monitor ${monitor.id}:`,
          error,
        );
      }
    }
  }
}
