import { scrapeJobsQueue } from "../lib/queue";
import db from "../lib/db";
import { env } from "../env";
import { TIER_LIMITS, MAX_SCRAPE_RETRY_COUNT } from "../lib/constants";
import { tryConsumeScrapeCredit, previewUsage } from "../lib/usage";

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

  console.log(`Found ${jobsToRetry.length} jobs ready for retry`);

  for (const job of jobsToRetry) {
    try {
      console.log(
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

      console.log(`Scheduled retry for job ${job.id}`);
    } catch (error) {
      console.error(`Failed to schedule retry for job ${job.id}:`, error);
    }
  }
}

export async function runScheduler() {
  console.log("Running scheduler");

  // Pick up retry jobs first
  await pickupRetryJobs();

  const currentHour = new Date().getUTCHours();
  console.log("Current UTC hour:", currentHour);

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

  console.log("Users with scheduled hour:", usersWithScheduledHour.length);

  for (const userSchedule of usersWithScheduledHour) {
    const { user } = userSchedule;

    if (user.isDeleted || !user.subscription) {
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
    console.log(
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
      console.warn(
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
          console.log(
            `Skipping monitor ${monitor.id} because a job is already ${existingJob.status}`,
          );
          continue;
        }

        console.log("Creating scrape job for monitor:", monitor.id);
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
        console.log("Scrape job created for monitor:", monitor.id);
      } catch (error) {
        console.error(
          `Failed to schedule scrape job for monitor ${monitor.id}:`,
          error,
        );
      }
    }
  }
}
