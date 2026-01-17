import db from "../lib/db";
import { processKeywordScrapeJob } from "../processors/keyword.processor";

/**
 * Keyword scheduler - runs every 30 minutes
 * Simpler than lead gen scheduler because:
 * - No user schedule check (all active monitors run)
 * - No usage/billing enforcement (can add later if needed)
 */
export async function runKeywordScheduler() {
  console.log("[Keyword Scheduler] Running...");

  // Find all active keyword monitors with active users
  const keywordMonitors = await db.keywordMonitor.findMany({
    where: {
      status: "ACTIVE",
      user: {
        isDeleted: false,
        subscription: {
          isNot: null,
        },
      },
    },
    include: {
      keywordSet: true,
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  console.log(`[Keyword Scheduler] Found ${keywordMonitors.length} active keyword monitors`);

  for (const monitor of keywordMonitors) {
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
          `[Keyword Scheduler] Skipping monitor ${monitor.id} - job already ${existingJob.status}`
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
          err
        );
      }
    } catch (err) {
      console.error(
        `[Keyword Scheduler] Error scheduling monitor ${monitor.id}:`,
        err
      );
    }
  }

  console.log("[Keyword Scheduler] Complete");
}
