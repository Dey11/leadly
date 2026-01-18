import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { env } from "../env";
import {
  MAX_SCRAPE_POSTS_LIMIT,
  MAX_SCRAPE_RETRY_COUNT,
  SCRAPE_RETRY_DELAY_MS,
} from "../lib/constants";
import { filterPostsByKeywords, getMatchedKeywords } from "../lib/keywords";
import type { KeywordMonitor, KeywordSet, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type KeywordMonitorWithSetAndUser = KeywordMonitor & {
  keywordSet: KeywordSet;
  user: User;
};

type FailureContext = {
  keywordMonitorId: string;
  jobId: string;
  source: "scheduler" | "stuck_job_fallback";
};

async function executeKeywordCoreScrapeLogic(
  keywordMonitorId: string,
  jobId: string,
  monitor: KeywordMonitorWithSetAndUser,
) {
  const redditClient = new Reddit(
    env.REDDIT_CLIENT_ID,
    env.REDDIT_CLIENT_SECRET,
  );

  await db.keywordScrapeJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  const target = monitor.target.replace("r/", "");
  const posts = await redditClient.fetchPosts(
    target,
    MAX_SCRAPE_POSTS_LIMIT,
    monitor.cursor,
  );

  console.log(
    `[Keyword Processor] Fetched ${posts.length} posts from r/${target}`,
  );

  // Filter posts by keywords
  const matchedPosts = filterPostsByKeywords(posts, monitor.keywordSet.keywords);

  console.log(
    `[Keyword Processor] ${matchedPosts.length}/${posts.length} posts matched keywords`,
  );

  // Create leads for matched posts
  const leads = matchedPosts.map((post) => ({
    scrapeJobId: jobId,
    platform: "REDDIT" as const,
    content: post.title,
    url: post.urlToPost,
    author: post.posterId || null,
    matchedKeywords: getMatchedKeywords(post, monitor.keywordSet.keywords),
    status: "NEW" as const,
  }));

  // Insert leads (skip duplicates by URL)
  let createdCount = 0;
  for (const lead of leads) {
    try {
      await db.keywordLead.create({ data: lead });
      createdCount++;
    } catch (err: any) {
      if (err.code === "P2002") {
        console.log(`[Keyword Processor] Skipping duplicate URL: ${lead.url}`);
      } else {
        throw err;
      }
    }
  }

  // Update cursor for pagination
  const newCursor =
    posts.length > 0 ? posts[posts.length - 1].postId : monitor.cursor;

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.keywordMonitor.update({
      where: { id: keywordMonitorId },
      data: {
        cursor: newCursor,
        lastScrapedAt: new Date(),
      },
    });

    await tx.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        matchCount: createdCount,
        nextRetryAt: null,
      },
    });
  });

  console.log(
    `[Keyword Processor] Job ${jobId} completed. Created ${createdCount} leads from ${matchedPosts.length} matches.`,
  );

  return createdCount;
}

async function handleKeywordJobFailure(
  jobId: string,
  context: FailureContext,
  error: unknown,
  currentRetryCount: number,
  skipRetry: boolean,
) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  if (!skipRetry && currentRetryCount < MAX_SCRAPE_RETRY_COUNT) {
    const nextRetryAt = new Date(Date.now() + SCRAPE_RETRY_DELAY_MS);
    console.log(
      `[Keyword Processor] Scheduling retry for job ${jobId} at ${nextRetryAt.toISOString()}`,
    );

    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        retryCount: currentRetryCount,
        nextRetryAt,
        errorMessage,
      },
    });
  } else {
    console.log(
      `[Keyword Processor] Job ${jobId} failed permanently after ${MAX_SCRAPE_RETRY_COUNT} retries: ${errorMessage}`,
    );

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.failedKeywordScrapeJob.create({
        data: {
          keywordMonitorId: context.keywordMonitorId,
          originalJobId: jobId,
          errorMessage,
        },
      });

      await tx.keywordScrapeJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage,
          retryCount: currentRetryCount,
          nextRetryAt: null,
        },
      });
    });
  }
}

export async function processKeywordScrapeJob(
  keywordMonitorId: string,
  jobId: string,
) {
  console.log(
    `[Keyword Processor] Starting job ${jobId} for monitor ${keywordMonitorId}`,
  );

  const scrapeJob = await db.keywordScrapeJob.findUnique({
    where: { id: jobId },
  });

  if (!scrapeJob) {
    console.log("[Keyword Processor] Scrape job not found:", jobId);
    return;
  }

  const monitor = await db.keywordMonitor.findUnique({
    where: { id: keywordMonitorId },
    include: {
      keywordSet: true,
      user: true,
    },
  });

  if (!monitor) {
    console.log("[Keyword Processor] Monitor not found:", keywordMonitorId);
    return;
  }

  if (!monitor.keywordSet) {
    console.log("[Keyword Processor] Monitor has no KeywordSet:", keywordMonitorId);
    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: "Monitor has no associated KeywordSet",
      },
    });
    return;
  }

  try {
    const leadsCreated = await executeKeywordCoreScrapeLogic(
      keywordMonitorId,
      jobId,
      monitor as KeywordMonitorWithSetAndUser,
    );

    console.log(
      JSON.stringify({
        evt: "keyword_scrape.completed",
        jobId,
        keywordMonitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    console.error("[Keyword Processor] Scrape failed:", error);

    await handleKeywordJobFailure(
      jobId,
      { keywordMonitorId, jobId, source: "scheduler" },
      error,
      scrapeJob.retryCount + 1,
      false,
    );
  }
}

export async function processKeywordStuckJob(
  keywordMonitorId: string,
  jobId: string,
) {
  console.log(
    `[Keyword Processor] Processing stuck job: ${jobId} for monitor: ${keywordMonitorId}`,
  );

  const monitor = await db.keywordMonitor.findUnique({
    where: { id: keywordMonitorId },
    include: { keywordSet: true, user: true },
  });

  if (!monitor || !monitor.keywordSet) {
    console.log("[Keyword Processor] Invalid monitor for stuck job:", keywordMonitorId);
    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: "Monitor or KeywordSet not found",
      },
    });
    return;
  }

  const scrapeJob = await db.keywordScrapeJob.findUnique({
    where: { id: jobId },
  });

  if (!scrapeJob) {
    console.log("[Keyword Processor] Stuck job not found:", jobId);
    return;
  }

  try {
    const leadsCreated = await executeKeywordCoreScrapeLogic(
      keywordMonitorId,
      jobId,
      monitor as KeywordMonitorWithSetAndUser,
    );

    console.log(
      JSON.stringify({
        evt: "keyword_stuck_scrape.completed",
        jobId,
        keywordMonitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    console.error("[Keyword Processor] Stuck job processing failed:", error);

    await handleKeywordJobFailure(
      jobId,
      { keywordMonitorId, jobId, source: "stuck_job_fallback" },
      error,
      scrapeJob.retryCount + 1,
      true,
    );
  }
}
