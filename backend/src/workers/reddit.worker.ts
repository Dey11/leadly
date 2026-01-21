import { Worker } from "bullmq";
import cron from "node-cron";
import { env } from "../env";
import { processRedditScrape } from "../processors/reddit.processor";
import logger from "../lib/logger";
import { sendAllLogsToDiscord } from "../services/logger.service";

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

// Hourly log posting (at xx:30 to offset from backend)
cron.schedule(
  "30 * * * *",
  async () => {
    logger.info("Running hourly log report (worker)");
    await sendAllLogsToDiscord("worker");
  },
  { timezone: "UTC" },
);

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
logger.info("Worker log scheduler started (hourly at xx:30).");
