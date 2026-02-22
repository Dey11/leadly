import cron from "node-cron";
import logger from "../lib/logger";
import { generateDailyBlog } from "../seo/blog.processor";

// Separate queue for blog jobs if needed, or reuse a 'system' queue.
// For simplicity, we can use a "blogQueue" or just execute directly via Cron in this process
// since it's only once a day and low load.
// However, to keep it robust, we'll use a simple cron trigger here that calls the processor directly
// or adds to a queue. Given the plan, let's keep it simple:
// The "Worker" process in this repo is currently dedicated to Reddit scraping.
// We can attach this cron to the same process or a new one.
// Let's add it to the existing `backend/src/workers/reddit.worker.ts` or make this a new entry point.
// Since the user wants a "Plan" and "Infrastructure", a dedicated file is cleaner.

// We will export a function to start this worker's cron.
export function startBlogWorker() {
  logger.info("Initializing Blog Worker Cron...");

  // Schedule for Midnight UTC every day
  cron.schedule(
    "0 0 * * *",
    async () => {
      logger.info("Triggering Daily Blog Generation...");
      try {
        await generateDailyBlog();
        logger.info("Daily Blog Generation Completed.");
      } catch (err) {
        logger.error("Daily Blog Generation Failed:", err);
      }
    },
    {
      timezone: "UTC",
    },
  );

  logger.info("Blog Worker Cron scheduled for 00:00 UTC");
}

// If this file is run directly (e.g. via package.json script)
if (require.main === module) {
  startBlogWorker();

  // Keep process alive
  process.on("SIGINT", () => {
    logger.info("Blog Worker shutting down");
    process.exit(0);
  });
}
