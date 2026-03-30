import cron from "node-cron";
import logger from "../lib/logger";
import { generateDailyBlog } from "../seo/blog.processor";

export function startBlogWorker() {
  logger.info("Initializing Blog Worker Cron...");

  cron.schedule(
    "0 0 * * *",
    async () => {
      logger.info("Running curated blog backlog maintenance...");
      try {
        await generateDailyBlog();
        logger.info("Curated blog backlog maintenance complete.");
      } catch (err) {
        logger.error("Curated blog backlog maintenance failed:", err);
      }
    },
    {
      timezone: "UTC",
    },
  );

  logger.info("Blog worker cron scheduled for 00:00 UTC");
}

if (require.main === module) {
  startBlogWorker();

  process.on("SIGINT", () => {
    logger.info("Blog Worker shutting down");
    process.exit(0);
  });
}
