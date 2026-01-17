import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { processLeads, LeadData } from "./ai.processor";
import type { Job } from "bullmq";
import type { LeadStatus, Monitor, Icp, User, KeywordSet } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../env";
import {
  MAX_SCRAPE_POSTS_LIMIT,
  MAX_SCRAPE_RETRY_COUNT,
  SCRAPE_RETRY_DELAY_MS,
} from "../lib/constants";
import { filterPostsByKeywords } from "../lib/keywords";
import { RedditPost } from "../types/reddit";

type MonitorWithIcpAndUser = Monitor & {
  icp: Icp | null;
  keywordSet: KeywordSet | null;
  user: User;
};

type FailureContext = {
  monitorId: string;
  jobId: string;
  source: "bullmq" | "stuck_job_fallback";
};

/**
 * Create basic leads from keyword-matched posts (no ICP scoring)
 * Used when KEYWORD mode has no ICP attached
 */
function createBasicLeadsFromPosts(posts: RedditPost[]): LeadData[] {
  return posts.map((post) => ({
    platform: "REDDIT" as const,
    leadType: "NEUTRAL" as const, // Default to NEUTRAL without ICP scoring
    content: post.title,
    url: post.urlToPost,
    author: post.posterId,
    reasoning: "Matched keyword filter",
  }));
}

async function executeCoreScrapeLogic(
  monitorId: string,
  jobId: string,
  monitor: MonitorWithIcpAndUser,
) {
  const redditClient = new Reddit(
    env.REDDIT_CLIENT_ID,
    env.REDDIT_CLIENT_SECRET,
  );

  await db.scrapeJob.update({
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

  let leads: LeadData[] = [];
  let postsToProcess = posts;

  if (monitor.mode === "KEYWORD") {
    // KEYWORD mode: filter by keywords first
    if (!monitor.keywordSet) {
      throw new Error("KEYWORD mode monitor is missing KeywordSet");
    }

    postsToProcess = filterPostsByKeywords(posts, monitor.keywordSet.keywords);
    console.log(
      `[KEYWORD mode] Fetched ${posts.length} posts, ${postsToProcess.length} matched keywords`
    );

    if (postsToProcess.length === 0) {
      // No matches, still complete the job
      console.log(`[KEYWORD mode] No keyword matches found`);
    } else if (monitor.icp) {
      // Has ICP: do full scoring on filtered posts
      leads = await processLeads(postsToProcess, {
        name: monitor.icp.name,
        summary: monitor.icp.summary,
        targetPersona: monitor.icp.targetPersona,
        pains: monitor.icp.pains,
        valueProposition: monitor.icp.valueProposition,
        qualifyingSignals: monitor.icp.qualifyingSignals,
        disqualifyingSignals: monitor.icp.disqualifyingSignals,
      });
    } else {
      // No ICP: create basic leads from keyword matches
      leads = createBasicLeadsFromPosts(postsToProcess);
    }
  } else {
    // LEAD_GEN mode: require ICP, process all posts
    if (!monitor.icp) {
      throw new Error("LEAD_GEN mode monitor is missing associated ICP");
    }

    leads = await processLeads(posts, {
      name: monitor.icp.name,
      summary: monitor.icp.summary,
      targetPersona: monitor.icp.targetPersona,
      pains: monitor.icp.pains,
      valueProposition: monitor.icp.valueProposition,
      qualifyingSignals: monitor.icp.qualifyingSignals,
      disqualifyingSignals: monitor.icp.disqualifyingSignals,
    });
  }

  const lastPostId = posts[0]?.postId;

  const warmLeads = leads.filter((lead) => lead.leadType === "WARM");
  const coldLeads = leads.filter((lead) => lead.leadType === "COLD");
  const neutralLeads = leads.filter((lead) => lead.leadType === "NEUTRAL");

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.lead.createMany({
      data: leads.map((lead) => ({
        scrapeJobId: jobId,
        platform: lead.platform,
        leadType: lead.leadType,
        content: lead.content,
        url: lead.url,
        author: lead.author,
        reasoning: lead.reasoning,
        status: "NEW" as LeadStatus,
      })),
      skipDuplicates: true,
    });

    await tx.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        warmLeads: warmLeads.length,
        coldLeads: coldLeads.length,
        neutralLeads: neutralLeads.length,
        nextRetryAt: null,
      },
    });

    await tx.monitor.update({
      where: { id: monitorId },
      data: {
        cursor: lastPostId,
        lastScrapedAt: new Date(),
      },
    });
  });

  return leads.length;
}


async function handleJobFailure(
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
      `Scheduling retry for job ${jobId} at ${nextRetryAt.toISOString()}`,
    );

    await db.scrapeJob.update({
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
      `Job ${jobId} permanently failed (retryCount: ${currentRetryCount}, source: ${context.source})`,
    );

    await db.$transaction([
      db.failedScrapeJob.create({
        data: {
          monitorId: context.monitorId,
          originalJobId: jobId,
          errorMessage,
          metadata: {
            stack: error instanceof Error ? error.stack : null,
            context,
            retryCount: currentRetryCount,
          },
        },
      }),
      db.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          retryCount: currentRetryCount,
          nextRetryAt: null,
          errorMessage,
        },
      }),
    ]);
  }
}

export async function processScrapeJob(job: Job) {
  console.log("Processing job with data:", job.data);

  if (!job.data.monitorId || !job.data.jobId) {
    throw new Error("Missing monitorId or jobId in job data");
  }

  const { monitorId, jobId } = job.data;

  let scrapeJob = await db.scrapeJob.findUnique({
    where: { id: jobId },
    include: { monitor: { include: { icp: true } } },
  });

  const monitor = await db.monitor.findUnique({
    where: { id: monitorId },
    include: { user: true, icp: true, keywordSet: true },
  });

  console.log("Found scrapeJob:", !!scrapeJob, "Found monitor:", !!monitor);

  if (!scrapeJob || !monitor) {
    throw new Error("ScrapeJob or Monitor not found");
  }

  if (monitor.user.isDeleted) {
    console.log(`Skipping job ${jobId} because user is deleted`);
    return;
  }

  try {
    await executeCoreScrapeLogic(monitorId, jobId, monitor);
  } catch (error) {
    console.error("Job processing failed:", error);

    const currentRetryCount = (scrapeJob?.retryCount ?? 0) + 1;
    console.log(
      `Job ${jobId} failed. Retry count: ${currentRetryCount}/${MAX_SCRAPE_RETRY_COUNT}`,
    );

    try {
      await handleJobFailure(
        jobId,
        { monitorId, jobId, source: "bullmq" },
        error,
        currentRetryCount,
        false,
      );
    } catch (updateError) {
      console.error("Failed to update scrapeJob status:", updateError);
    }
  }
}

export async function processStuckJob(monitorId: string, jobId: string) {
  console.log(
    JSON.stringify({
      evt: "stuck_job.processing",
      monitorId,
      jobId,
    }),
  );

  let scrapeJob = await db.scrapeJob.findUnique({
    where: { id: jobId },
    include: { monitor: { include: { icp: true } } },
  });

  const monitor = await db.monitor.findUnique({
    where: { id: monitorId },
    include: { user: true, icp: true, keywordSet: true },
  });

  if (!scrapeJob || !monitor) {
    throw new Error("ScrapeJob or Monitor not found");
  }

  if (monitor.user.isDeleted) {
    console.log(`Skipping stuck job ${jobId} because user is deleted`);
    return;
  }

  try {
    const leadsCount = await executeCoreScrapeLogic(monitorId, jobId, monitor);

    console.log(
      JSON.stringify({
        evt: "stuck_job.completed",
        jobId,
        leadsCount,
      }),
    );
  } catch (error) {
    console.error("Stuck job processing failed:", error);

    const currentRetryCount = (scrapeJob?.retryCount ?? 0) + 1;

    await handleJobFailure(
      jobId,
      { monitorId, jobId, source: "stuck_job_fallback" },
      error,
      currentRetryCount,
      true,
    );

    throw error;
  }
}
