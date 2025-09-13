import fetch from "node-fetch";
import { cleanText } from "../lib/utils.js";

async function scrapeReddit(subreddit: string, postsCount: number = 100) {
  try {
    const postsUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=${postsCount}`;
    const postsRes = await fetch(postsUrl);
    if (!postsRes.ok)
      throw new Error(`Failed to fetch posts: ${postsRes.status}`);
    const postsJson: any = await postsRes.json();
    const posts = postsJson.data.children.map((c: any) => c.data);

    const results = [];

    const extractComments = (children: any[]): any[] => {
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
        const commentsRes = await fetch(commentsUrl);
        if (!commentsRes.ok)
          throw new Error(
            `Failed to fetch comments for post ${post.id}: ${commentsRes.status}`
          );
        const commentsJson: any = await commentsRes.json();
        const comments = extractComments(commentsJson[1].data.children);

        results.push({
          post: cleanText(post.selftext),
          postId: post.id,
          posterId: post.author,
          urlToPost: `https://reddit.com${post.permalink}`,
          comments,
        });
      } catch (err) {
        console.error(err);
      }
    }

    return { posts: results };
  } catch (err) {
    return { error: err instanceof Error ? err.message : err };
  }
}
