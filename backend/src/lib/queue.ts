import { Queue } from "bullmq";
import { env } from "../env";

interface ScrapeJobData {
  monitorId: string;
  jobId: string;
}

export const scrapeJobsQueue = new Queue<ScrapeJobData, void, "scrapeJobs">(
  "scrapeJobs",
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);
