import axios from "axios";
import { cleanText } from "../lib/utils.js";
import type {
  redditComment,
  redditScrapeOutput,
  redditPost,
} from "../types/reddit.js";
import type { redditScrapeInput } from "../types/reddit.js";

export async function scrapeReddit(
  input: redditScrapeInput
): Promise<redditScrapeOutput> {
  const { subreddit, postsCount = 50 } = input;
  try {
    const postsUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=${postsCount}`;
    const postsRes = await axios.get(postsUrl);
    if (postsRes.status !== 200)
      throw new Error(`Failed to fetch posts: ${postsRes.status}`);
    const postsJson: any = await postsRes.data;
    const posts = postsJson.data.children.map((c: any) => c.data);

    const results: redditPost[] = [];

    const extractComments = (children: any[]): redditComment[] => {
      if (!children) return [];
      return children
        .filter((c) => c.kind === "t1")
        .map((c) => {
          const nested =
            c.data.replies && c.data.replies.data
              ? extractComments(c.data.replies.data.children)
              : [];
          return {
            commenterId: c.data.id,
            commentText: cleanText(c.data.body),
            commenterName: c.data.author,
            urlToComment: `https://reddit.com${c.data.permalink}`,
            children: nested,
          };
        });
    };

    for (const post of posts) {
      try {
        const commentsUrl = `https://www.reddit.com/r/${subreddit}/comments/${post.id}.json`;
        const commentsRes = await axios.get(commentsUrl);
        if (commentsRes.status !== 200)
          throw new Error(
            `Failed to fetch comments for post ${post.id}: ${commentsRes.status}`
          );
        const commentsJson: any = await commentsRes.data;
        const comments = extractComments(commentsJson[1].data.children);

        const redditPostVar: redditPost = {
          post: cleanText(post.selftext),
          postId: post.id,
          posterId: post.author,
          urlToPost: `https://reddit.com${post.permalink}`,
          comments,
        };

        results.push(redditPostVar);
      } catch (err) {
        console.error(err);
      }
    }

    return { posts: results };
  } catch (err) {
    console.error(err);
    return { posts: [] };
  }
}
