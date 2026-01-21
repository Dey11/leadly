import { Worker } from "bullmq";
import { env } from "../env";
import { processRedditScrape } from "../processors/reddit.processor";
import logger from "../lib/logger";

const worker = new Worker(
  "scrapeJobs",
  async (job) => {
    logger.info("Processing job:", job.data);
    await processRedditScrape(job);
  },
  {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
    },
  },
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  if (job) {
    logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing worker...");
  await worker.close();
  process.exit(0);
});

logger.info("Worker started");
