import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { LeadData, processLeads } from "./ai.processor";
import type { Job } from "bullmq";
import type { LeadStatus, User } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { env } from "../env";
import { CREDITS_COST } from "../lib/constants";

interface Target {
  subreddit: string;
  cursor: string | null;
}

export async function processScrapeJob(job: Job) {
  console.log("Processing job with data:", job.data);

  if (!job.data.monitorId || !job.data.jobId) {
    throw new Error("Missing monitorId or jobId in job data");
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

  console.log("Found scrapeJob:", !!scrapeJob, "Found monitor:", !!monitor);

  if (!scrapeJob || !monitor) {
    throw new Error("ScrapeJob or Monitor not found");
  }

  // todo: find a better way to handle this
  const user = monitor.user as User;
  if (user.credits <= 0) {
    throw new Error("User has insufficient credits");
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

    const targets = monitor?.targets as unknown as Target[];
    const allCursors: { [key: string]: string } = {};
    const allLeads: LeadData[] = [];

    for (const target of targets) {
      const posts = await redditClient.fetchPosts(
        target.subreddit.replace("r/", ""),
        50,
        target.cursor
      );
      allCursors[target.subreddit] = posts[posts.length - 1].postId;

      const leads = await processLeads(posts, monitor.leadDescription);
      allLeads.push(...leads);
    }

    const warmLeads = allLeads.filter((lead) => lead.leadType === "WARM");
    const coldLeads = allLeads.filter((lead) => lead.leadType === "COLD");
    const neutralLeads = allLeads.filter((lead) => lead.leadType === "NEUTRAL");
    const creditsConsumed = Math.max(
      warmLeads.length * CREDITS_COST.WARM,
      coldLeads.length * CREDITS_COST.COLD,
      neutralLeads.length * CREDITS_COST.NEUTRAL
    );

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.lead.createMany({
        data: allLeads.map((lead) => ({
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

    throw error;
  }
}
