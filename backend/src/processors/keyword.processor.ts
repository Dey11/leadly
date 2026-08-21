import db from "../lib/db";
import logger from "../lib/logger";
import { Reddit } from "../services/reddit";
import { env } from "../env";
import {
  MAX_SCRAPE_POSTS_LIMIT,
  MAX_SCRAPE_RETRY_COUNT,
  SCRAPE_RETRY_DELAY_MS,
} from "../lib/constants";
import { buildRedditFetchTarget } from "../lib/reddit-target";
import {
  filterPostsByKeywords,
  getMatchedKeywords,
  getMatchingSnippet,
} from "../lib/keywords";
import { notifyNewLeads } from "../services/notification.service";
import type { KeywordMonitor, KeywordSet, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import {
  automationCancellationMessage,
  automationEligibleUserWhere,
  getAutomationStateForUser,
} from "../services/automation";

type KeywordMonitorWithSetAndUser = KeywordMonitor & {
  keywordSet: KeywordSet;
  user: User;
};

type FailureContext = {
  keywordMonitorId: string;
  jobId: string;
  userId: string;
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

  const startResult = await db.keywordScrapeJob.updateMany({
    where: {
      id: jobId,
      status: { in: ["PENDING", "RUNNING"] },
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  if (startResult.count === 0) {
    logger.info(
      `[Keyword Processor] Skipping job ${jobId}: it is no longer runnable`,
    );
    return 0;
  }

  const target = buildRedditFetchTarget(monitor.targetType, monitor.target);
  const posts = await redditClient.fetchPosts(
    target,
    MAX_SCRAPE_POSTS_LIMIT,
    monitor.cursor,
  );

  logger.info(
    `[Keyword Processor] Fetched ${posts.length} posts from ${monitor.target}`,
  );

  // Filter posts by keywords
  const strict = !monitor.keywordSet.isFuzzyMatch;
  const matchedPosts = filterPostsByKeywords(
    posts,
    monitor.keywordSet.keywords,
    strict,
  );

  logger.info(
    `[Keyword Processor] ${matchedPosts.length}/${posts.length} posts matched keywords`,
  );

  // Create leads for matched posts
  const leads = matchedPosts.map((post) => {
    const keywords = monitor.keywordSet.keywords;
    const matchSnippet = getMatchingSnippet(post, keywords, strict);

    // Construct content: Title + (Context if applicable)
    let content = post.title;
    if (matchSnippet && matchSnippet.type !== "title") {
      content = `${post.title}\n\n[Match in ${matchSnippet.type}]: ${matchSnippet.text}`;
    }

    return {
      scrapeJobId: jobId,
      platform: "REDDIT" as const,
      content, // Now contains Title + Context
      url: post.urlToPost,
      author: post.posterId || null,
      matchedKeywords: getMatchedKeywords(post, keywords, strict),
      status: "NEW" as const,
    };
  });

  // Update cursor for pagination
  const newCursor =
    posts.length > 0 ? posts[posts.length - 1].postId : monitor.cursor;

  const commitResult = await db.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const completion = await tx.keywordScrapeJob.updateMany({
        where: {
          id: jobId,
          status: "RUNNING",
          keywordMonitor: { user: automationEligibleUserWhere() },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          matchCount: 0,
          nextRetryAt: null,
        },
      });

      if (completion.count === 0) return null;

      const created = await tx.keywordLead.createMany({
        data: leads,
        skipDuplicates: true,
      });

      await tx.keywordMonitor.update({
        where: { id: keywordMonitorId },
        data: {
          cursor: newCursor,
          lastScrapedAt: new Date(),
        },
      });

      await tx.keywordScrapeJob.update({
        where: { id: jobId },
        data: { matchCount: created.count },
      });

      return { createdCount: created.count };
    },
  );

  if (!commitResult) {
    await getAutomationStateForUser(monitor.userId);
    logger.info(
      `[Keyword Processor] Discarded results for cancelled job ${jobId}`,
    );
    return 0;
  }

  const { createdCount } = commitResult;
  const createdLeads = await db.keywordLead.findMany({
    where: { scrapeJobId: jobId },
  });

  logger.info(
    `[Keyword Processor] Job ${jobId} completed. Created ${createdCount} leads from ${matchedPosts.length} matches.`,
  );

  // Fire the per-user Discord notification (if configured) after the leads
  // have committed. Best-effort: notifyNewLeads never throws, but we still
  // wrap it so a bug here can never fail or roll back a completed scrape job.
  try {
    await notifyNewLeads({
      kind: "keyword",
      userId: monitor.userId,
      monitorTarget: monitor.target,
      monitorTargetType: monitor.targetType,
      leads: createdLeads.map((lead) => ({
        content: lead.content,
        url: lead.url,
        matchedKeywords: lead.matchedKeywords,
      })),
    });
  } catch (error) {
    logger.error(
      "[Keyword Processor] Failed to send lead notifications:",
      error,
    );
  }

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
  const userWhere = automationEligibleUserWhere();

  if (!skipRetry && currentRetryCount < MAX_SCRAPE_RETRY_COUNT) {
    const nextRetryAt = new Date(Date.now() + SCRAPE_RETRY_DELAY_MS);
    logger.info(
      `[Keyword Processor] Scheduling retry for job ${jobId} at ${nextRetryAt.toISOString()}`,
    );

    await db.keywordScrapeJob.updateMany({
      where: {
        id: jobId,
        status: { not: "CANCELLED" },
        keywordMonitor: { user: userWhere },
      },
      data: {
        status: "FAILED",
        retryCount: currentRetryCount,
        nextRetryAt,
        errorMessage,
      },
    });
  } else {
    logger.error(
      `[Keyword Processor] Job ${jobId} failed permanently after ${MAX_SCRAPE_RETRY_COUNT} retries: ${errorMessage}`,
    );

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const failure = await tx.keywordScrapeJob.updateMany({
        where: {
          id: jobId,
          status: { not: "CANCELLED" },
          keywordMonitor: { user: userWhere },
        },
        data: {
          status: "FAILED",
          errorMessage,
          retryCount: currentRetryCount,
          nextRetryAt: null,
        },
      });

      if (failure.count === 0) return;

      await tx.failedKeywordScrapeJob.create({
        data: {
          keywordMonitorId: context.keywordMonitorId,
          originalJobId: jobId,
          errorMessage,
        },
      });
    });
  }

  await getAutomationStateForUser(context.userId);
}

export async function processKeywordScrapeJob(
  keywordMonitorId: string,
  jobId: string,
) {
  logger.info(
    `[Keyword Processor] Starting job ${jobId} for monitor ${keywordMonitorId}`,
  );

  const scrapeJob = await db.keywordScrapeJob.findUnique({
    where: { id: jobId },
  });

  if (!scrapeJob) {
    logger.warn("[Keyword Processor] Scrape job not found:", jobId);
    return;
  }

  if (scrapeJob.status === "CANCELLED") {
    logger.info(`[Keyword Processor] Skipping cancelled job ${jobId}`);
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
    logger.warn("[Keyword Processor] Monitor not found:", keywordMonitorId);
    return;
  }

  if (!monitor.keywordSet) {
    console.log(
      "[Keyword Processor] Monitor has no KeywordSet:",
      keywordMonitorId,
    );
    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: "Monitor has no associated KeywordSet",
      },
    });
    return;
  }

  const automation = await getAutomationStateForUser(monitor.userId);
  if (!automation?.enabled) {
    await db.keywordScrapeJob.updateMany({
      where: {
        id: jobId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: {
        status: "CANCELLED",
        errorMessage: automationCancellationMessage(automation),
        nextRetryAt: null,
      },
    });
    logger.info(
      `[Keyword Processor] Cancelled job ${jobId}: automation paused`,
    );
    return;
  }

  try {
    const leadsCreated = await executeKeywordCoreScrapeLogic(
      keywordMonitorId,
      jobId,
      monitor as KeywordMonitorWithSetAndUser,
    );

    logger.info(
      JSON.stringify({
        evt: "keyword_scrape.completed",
        jobId,
        keywordMonitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    logger.error("[Keyword Processor] Scrape failed:", error);

    await handleKeywordJobFailure(
      jobId,
      {
        keywordMonitorId,
        jobId,
        userId: monitor.userId,
        source: "scheduler",
      },
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
  logger.info(
    `[Keyword Processor] Processing stuck job: ${jobId} for monitor: ${keywordMonitorId}`,
  );

  const monitor = await db.keywordMonitor.findUnique({
    where: { id: keywordMonitorId },
    include: { keywordSet: true, user: true },
  });

  if (!monitor || !monitor.keywordSet) {
    console.log(
      "[Keyword Processor] Invalid monitor for stuck job:",
      keywordMonitorId,
    );
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
    logger.warn("[Keyword Processor] Stuck job not found:", jobId);
    return;
  }

  if (scrapeJob.status === "CANCELLED") {
    logger.info(`[Keyword Processor] Skipping cancelled stuck job ${jobId}`);
    return;
  }

  const automation = await getAutomationStateForUser(monitor.userId);
  if (!automation?.enabled) {
    await db.keywordScrapeJob.updateMany({
      where: {
        id: jobId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: {
        status: "CANCELLED",
        errorMessage: automationCancellationMessage(automation),
        nextRetryAt: null,
      },
    });
    logger.info(
      `[Keyword Processor] Cancelled stuck job ${jobId}: automation paused`,
    );
    return;
  }

  try {
    const leadsCreated = await executeKeywordCoreScrapeLogic(
      keywordMonitorId,
      jobId,
      monitor as KeywordMonitorWithSetAndUser,
    );

    logger.info(
      JSON.stringify({
        evt: "keyword_stuck_scrape.completed",
        jobId,
        keywordMonitorId,
        leadsCreated,
      }),
    );
  } catch (error) {
    logger.error("[Keyword Processor] Stuck job processing failed:", error);

    await handleKeywordJobFailure(
      jobId,
      {
        keywordMonitorId,
        jobId,
        userId: monitor.userId,
        source: "stuck_job_fallback",
      },
      error,
      scrapeJob.retryCount + 1,
      true,
    );
  }
}
