import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env';
import { processScrapeJob } from './services/jobProcessor';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker('scrapeJobs', async (job) => {
  await processScrapeJob(job);
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  if (job) {
    console.log(`Job ${job.id} failed with error: ${err.message}`);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

console.log('Worker started');
