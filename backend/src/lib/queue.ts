import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../env';

interface ScrapeJobData {
  monitorId: string;
  jobId: string;
}

const connection = new Redis(env.REDIS_URL);

export const scrapeJobsQueue = new Queue<ScrapeJobData>('scrapeJobs', { connection });
