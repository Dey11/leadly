import { PrismaClient } from '@prisma/client';
import { scrapeJobsQueue } from '../lib/queue';
import db from '../lib/db';

export async function runScheduler() {
  const dueMonitors = await db.monitor.findMany({
    where: {
      status: 'ACTIVE',
      nextScrapeAt: {
        lte: new Date(),
      },
    },
  });

  for (const monitor of dueMonitors) {
    try {
      const scrapeJob = await db.$transaction(async (tx) => {
        const scrapeJob = await tx.scrapeJob.create({
          data: {
            monitorId: monitor.id,
            status: 'PENDING',
          },
        });

        const nextScrapeAt = new Date(Date.now() + monitor.scrapeIntervalMinutes * 60 * 1000);
        await tx.monitor.update({
          where: { id: monitor.id },
          data: { nextScrapeAt },
        });

        return scrapeJob;
      });

      await scrapeJobsQueue.add('scrape', { monitorId: monitor.id, jobId: scrapeJob.id });
    } catch (error) {
      console.error(`Failed to schedule scrape job for monitor ${monitor.id}:`, error);
    }
  }
}
