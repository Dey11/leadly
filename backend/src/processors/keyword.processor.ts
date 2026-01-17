import db from "../lib/db";
import { Reddit } from "../services/reddit";
import { env } from "../env";
import { MAX_SCRAPE_POSTS_LIMIT } from "../lib/constants";
import { filterPostsByKeywords, getMatchedKeywords } from "../lib/keywords";

export async function processKeywordScrapeJob(
  keywordMonitorId: string,
  jobId: string
) {
  console.log(`[Keyword Processor] Starting job ${jobId} for monitor ${keywordMonitorId}`);

  const monitor = await db.keywordMonitor.findUnique({
    where: { id: keywordMonitorId },
    include: {
      keywordSet: true,
      user: true,
    },
  });

  if (!monitor) {
    throw new Error(`KeywordMonitor ${keywordMonitorId} not found`);
  }

  if (!monitor.keywordSet) {
    throw new Error(`KeywordMonitor ${keywordMonitorId} has no KeywordSet`);
  }

  // Mark job as running
  await db.keywordScrapeJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const redditClient = new Reddit(
      env.REDDIT_CLIENT_ID,
      env.REDDIT_CLIENT_SECRET
    );

    const target = monitor.target.replace("r/", "");
    const posts = await redditClient.fetchPosts(
      target,
      MAX_SCRAPE_POSTS_LIMIT,
      monitor.cursor
    );

    console.log(`[Keyword Processor] Fetched ${posts.length} posts from r/${target}`);

    // Filter posts by keywords
    const matchedPosts = filterPostsByKeywords(posts, monitor.keywordSet.keywords);

    console.log(`[Keyword Processor] ${matchedPosts.length}/${posts.length} posts matched keywords`);

    // Create leads for matched posts
    const leads = matchedPosts.map((post) => ({
      scrapeJobId: jobId,
      platform: "REDDIT" as const,
      content: post.title,
      url: post.urlToPost,
      author: post.posterId || null,
      matchedKeywords: getMatchedKeywords(post, monitor.keywordSet!.keywords),
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
          // Unique constraint violation - URL already exists
          console.log(`[Keyword Processor] Skipping duplicate URL: ${lead.url}`);
        } else {
          throw err;
        }
      }
    }

    // Update cursor for pagination
    const newCursor = posts.length > 0 ? posts[posts.length - 1].postId : monitor.cursor;

    await db.keywordMonitor.update({
      where: { id: keywordMonitorId },
      data: {
        cursor: newCursor,
        lastScrapedAt: new Date(),
      },
    });

    // Mark job as completed
    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        matchCount: createdCount,
      },
    });

    console.log(
      `[Keyword Processor] Job ${jobId} completed. Created ${createdCount} leads from ${matchedPosts.length} matches.`
    );

    return { matchCount: createdCount, postsScraped: posts.length };
  } catch (err) {
    console.error(`[Keyword Processor] Job ${jobId} failed:`, err);

    await db.keywordScrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      },
    });

    throw err;
  }
}
