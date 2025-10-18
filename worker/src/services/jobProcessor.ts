import db from '../lib/db';
import { scrapeReddit } from './redditScrape';
import { getProcessedIds, addProcessedIds } from '../lib/redisDeduplication';
import { processLeads } from './aiProcessor';
import { createLeads } from './leadService';
import type { Job } from 'bullmq';
import type { User } from '@prisma/client';
import type { Prisma } from '@prisma/client';

interface ScrapedItem {
  id: string;
  content: string;
  url: string;
  author?: string;
}

export async function processScrapeJob(job: Job) {
  console.log('Processing job with data:', job.data);
  
  if (!job.data.monitorId || !job.data.jobId) {
    throw new Error('Missing monitorId or jobId in job data');
  }

  const [scrapeJob, monitor] = await Promise.all([
    db.scrapeJob.findUnique({
      where: { id: job.data.jobId },
      include: { monitor: true },
    }),
    db.monitor.findUnique({
      where: { id: job.data.monitorId },
      include: { user: true },
    }),
  ]);

  console.log('Found scrapeJob:', !!scrapeJob, 'Found monitor:', !!monitor);

  if (!scrapeJob || !monitor) {
    throw new Error('ScrapeJob or Monitor not found');
  }

  const user = monitor.user as User;
  if (user.credits <= 0) {
    throw new Error('User has insufficient credits');
  }

  try {
    await db.scrapeJob.update({
      where: { id: job.data.jobId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Scrape
    const scrapeResult = await scrapeReddit({
      subreddit: monitor.target.replace('r/', ''),
      postsCount: 50,
    });

    const allItems: ScrapedItem[] = [];
    for (const post of scrapeResult.posts) {
      allItems.push({
        id: post.postId,
        content: post.post,
        url: post.urlToPost,
        author: post.posterId,
      });
      for (const comment of post.comments) {
        allItems.push({
          id: comment.commenterId,
          content: comment.commentText,
          url: comment.urlToComment,
          author: comment.commenterName,
        });
      }
    }

    // Deduplication
    const processedIds = await getProcessedIds(monitor.id);
    const newItems = allItems.filter(item => !processedIds.has(item.id));
    await addProcessedIds(monitor.id, newItems.map(item => item.id));

    // AI Processing
    const leads = await processLeads(newItems, monitor.leadDescription);

    // Create Leads
    await createLeads(job.data.jobId, leads);

    // Calculate credits
    const creditsConsumed = Math.max(10, leads.length * 5);

    // Update job and decrement credits
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.scrapeJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'COMPLETED',
          creditsConsumed,
          completedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: Math.max(0, user.credits - creditsConsumed),
        },
      });
    });

  } catch (error) {
    console.error('Job processing failed:', error);
    
    // Only try to update if the scrapeJob exists
    try {
      await db.scrapeJob.update({
        where: { id: job.data.jobId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (updateError) {
      console.error('Failed to update scrapeJob status:', updateError);
    }
    
    throw error;
  }
}
