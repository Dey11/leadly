import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { processLeads } from "./ai.processor";
import type { Job } from "bullmq";
import type { LeadStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../env";
import {
  MAX_SCRAPE_POSTS_LIMIT,
  MAX_SCRAPE_RETRY_COUNT,
  SCRAPE_RETRY_DELAY_MS,
} from "../lib/constants";

export async function processScrapeJob(job: Job) {
  console.log("Processing job with data:", job.data);

  if (!job.data.monitorId || !job.data.jobId) {
    throw new Error("Missing monitorId or jobId in job data");
  }

  let scrapeJob = await db.scrapeJob.findUnique({
    where: { id: job.data.jobId },
    include: { monitor: { include: { icp: true } } },
  });

  const monitor = await db.monitor.findUnique({
    where: { id: job.data.monitorId },
    include: { user: true, icp: true },
  });

  console.log("Found scrapeJob:", !!scrapeJob, "Found monitor:", !!monitor);

  if (!scrapeJob || !monitor) {
    throw new Error("ScrapeJob or Monitor not found");
  }

  if (monitor.user.isDeleted) {
    console.log(`Skipping job ${job.data.jobId} because user is deleted`);
    return;
  }

  try {
    const redditClient = new Reddit(
      env.REDDIT_CLIENT_ID,
      env.REDDIT_CLIENT_SECRET,
    );
    await db.scrapeJob.update({
      where: { id: job.data.jobId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Process single target (subreddit)
    const target = monitor.target.replace("r/", "");
    const posts = await redditClient.fetchPosts(
      target,
      MAX_SCRAPE_POSTS_LIMIT,
      monitor.cursor,
    );

    if (!monitor.icp) {
      throw new Error("Monitor is missing associated ICP");
    }

    const leads = await processLeads(posts, {
      name: monitor.icp.name,
      summary: monitor.icp.summary,
      targetPersona: monitor.icp.targetPersona,
      pains: monitor.icp.pains,
      valueProposition: monitor.icp.valueProposition,
      qualifyingSignals: monitor.icp.qualifyingSignals,
      disqualifyingSignals: monitor.icp.disqualifyingSignals,
    });
    const lastPostId = posts[0]?.postId;

    const warmLeads = leads.filter((lead) => lead.leadType === "WARM");
    const coldLeads = leads.filter((lead) => lead.leadType === "COLD");
    const neutralLeads = leads.filter((lead) => lead.leadType === "NEUTRAL");

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.lead.createMany({
        data: leads.map((lead) => ({
          scrapeJobId: job.data.jobId,
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
        where: { id: job.data.jobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          warmLeads: warmLeads.length,
          coldLeads: coldLeads.length,
          neutralLeads: neutralLeads.length,
          nextRetryAt: null,
        },
      });

      // Update monitor cursor with last scraped post ID
      await tx.monitor.update({
        where: { id: job.data.monitorId },
        data: {
          cursor: lastPostId,
          lastScrapedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error("Job processing failed:", error);

    const currentRetryCount = (scrapeJob?.retryCount ?? 0) + 1;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.log(
      `Job ${job.data.jobId} failed. Retry count: ${currentRetryCount}/${MAX_SCRAPE_RETRY_COUNT}`,
    );

    try {
      if (currentRetryCount < MAX_SCRAPE_RETRY_COUNT) {
        // Schedule for retry
        const nextRetryAt = new Date(Date.now() + SCRAPE_RETRY_DELAY_MS);
        console.log(
          `Scheduling retry for job ${
            job.data.jobId
          } at ${nextRetryAt.toISOString()}`,
        );

        await db.scrapeJob.update({
          where: { id: job.data.jobId },
          data: {
            status: "FAILED",
            retryCount: currentRetryCount,
            nextRetryAt,
            errorMessage,
          },
        });
      } else {
        // Permanently failed - move to FailedScrapeJob
        console.log(
          `Job ${job.data.jobId} permanently failed after ${MAX_SCRAPE_RETRY_COUNT} retries`,
        );

        await db.$transaction([
          db.failedScrapeJob.create({
            data: {
              monitorId: job.data.monitorId,
              originalJobId: job.data.jobId,
              errorMessage,
              metadata: {
                stack: error instanceof Error ? error.stack : null,
                context: job.data,
                retryCount: currentRetryCount,
              },
            },
          }),
          db.scrapeJob.update({
            where: { id: job.data.jobId },
            data: {
              status: "FAILED",
              retryCount: currentRetryCount,
              nextRetryAt: null,
              errorMessage,
            },
          }),
        ]);
      }
    } catch (updateError) {
      console.error("Failed to update scrapeJob status:", updateError);
    }
  }
}
