import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { processLeads } from "./ai.processor";
import type { Job } from "bullmq";
import type { LeadStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../env";
import { MAX_SCRAPE_POSTS_LIMIT } from "../lib/constants";

export async function processScrapeJob(job: Job) {
  console.log("Processing job with data:", job.data);

  if (!job.data.monitorId || !job.data.jobId) {
    throw new Error("Missing monitorId or jobId in job data");
  }

  const [scrapeJob, monitor] = await Promise.all([
    db.scrapeJob.findUnique({
      where: { id: job.data.jobId },
      include: { monitor: { include: { service: true } } },
    }),
    db.monitor.findUnique({
      where: { id: job.data.monitorId },
      include: { user: true, service: true },
    }),
  ]);

  console.log("Found scrapeJob:", !!scrapeJob, "Found monitor:", !!monitor);

  if (!scrapeJob || !monitor) {
    throw new Error("ScrapeJob or Monitor not found");
  }

  try {
    const redditClient = new Reddit(
      env.REDDIT_CLIENT_ID,
      env.REDDIT_CLIENT_SECRET
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
      monitor.cursor
    );

    const leads = await processLeads(posts, monitor.service.leadDescription);
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
    try {
      await db.scrapeJob.update({
        where: { id: job.data.jobId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (updateError) {
      console.error("Failed to update scrapeJob status:", updateError);
    }
  }
}
