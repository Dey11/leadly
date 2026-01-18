import db from "../lib/db";
import {
  processKeywordScrapeJob,
  processKeywordStuckJob,
} from "../processors/keyword.processor";
import {
  MAX_SCRAPE_RETRY_COUNT,
  STUCK_PENDING_THRESHOLD_MS,
} from "../lib/constants";

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

  console.log(
    `[Keyword Scheduler] Found ${jobsToRetry.length} jobs ready for retry`,
  );

  for (const job of jobsToRetry) {
    try {
      console.log(
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

      console.log(`[Keyword Scheduler] Retry completed for job ${job.id}`);
    } catch (error) {
      console.error(
        `[Keyword Scheduler] Failed to retry job ${job.id}:`,
        error,
      );
    }
  }
}

async function processStuckKeywordPendingJobs() {
  const stuckThreshold = new Date(Date.now() - STUCK_PENDING_THRESHOLD_MS);

  const stuckJobs = await db.keywordScrapeJob.findMany({
    where: {
      status: "PENDING",
      createdAt: { lte: stuckThreshold },
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

  console.log(
    `[Keyword Scheduler] Found ${stuckJobs.length} stuck PENDING jobs (>6 hours old)`,
  );

  for (const job of stuckJobs) {
    try {
      console.log(
        JSON.stringify({
          evt: "keyword_scheduler.stuck_job_processing",
          jobId: job.id,
          keywordMonitorId: job.keywordMonitorId,
          createdAt: job.createdAt.toISOString(),
          ageHours: Math.round(
            (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60),
          ),
        }),
      );

      await processKeywordStuckJob(job.keywordMonitorId, job.id);

      console.log(
        JSON.stringify({
          evt: "keyword_scheduler.stuck_job_completed",
          jobId: job.id,
        }),
      );
    } catch (error) {
      console.error(
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
 * Keyword scheduler - runs every 30 minutes
 * Includes stuck job recovery and retry logic (mirroring lead gen scheduler)
 * Only processes monitors for users who have the current hour in their KeywordSchedule
 */
export async function runKeywordScheduler() {
  console.log("[Keyword Scheduler] Running...");

  // Process stuck pending jobs first
  await processStuckKeywordPendingJobs();

  // Pick up retry jobs
  await pickupKeywordRetryJobs();

  const currentHour = new Date().getUTCHours();
  console.log(`[Keyword Scheduler] Current UTC hour: ${currentHour}`);

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

  console.log(
    `[Keyword Scheduler] Found ${usersWithScheduledHour.length} users with current hour in keyword schedule`,
  );

  for (const keywordSchedule of usersWithScheduledHour) {
    const { user } = keywordSchedule;

    if (!user.subscription) {
      continue;
    }

    const monitors = user.keywordMonitors;

    if (monitors.length === 0) {
      console.log(
        `[Keyword Scheduler] User ${user.id} has no active keyword monitors`,
      );
      continue;
    }

    console.log(
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
          console.log(
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

        console.log(`[Keyword Scheduler] Created job for monitor ${monitor.id}`);

        // Process immediately (keyword matching is fast, no need for queue)
        try {
          await processKeywordScrapeJob(monitor.id, scrapeJob.id);
        } catch (err) {
          console.error(
            `[Keyword Scheduler] Failed to process monitor ${monitor.id}:`,
            err,
          );
        }
      } catch (err) {
        console.error(
          `[Keyword Scheduler] Error scheduling monitor ${monitor.id}:`,
          err,
        );
      }
    }
  }

  console.log("[Keyword Scheduler] Complete");
}

