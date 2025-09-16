import axios from "axios";
import type { AxiosResponse } from "axios";
import { cleanText } from "../lib/utils.js";
import type {
  redditComment,
  redditScrapeOutput,
  redditPost,
} from "../types/reddit.js";
import type { redditScrapeInput } from "../types/reddit.js";

let redditToken: string | null = null;
let tokenExpiry = 0;

async function getReadOnlyToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (redditToken && now < tokenExpiry) {
    return redditToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID || "Jqzj4lodq8xviMNGFgk7aw";
  const clientSecret =
    process.env.REDDIT_CLIENT_SECRET || "NJd7Vm7-WY-gwGkxIxdP5EPORC43MQ";

  const resp = await axios.post(
    "https://www.reddit.com/api/v1/access_token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      auth: { username: clientId, password: clientSecret },
      headers: { "User-Agent": "read-only-scraper/1.0 by MemeBoyFromMars" },
      timeout: 10000,
    }
  );

  redditToken = resp.data.access_token;
  tokenExpiry = now + resp.data.expires_in - 60;
  return redditToken!;
}

async function fetchWithRetry(
  url: string,
  headers: any,
  retries = 3,
  timeout = 10000
): Promise<AxiosResponse<any>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { headers, timeout });
    } catch (err: any) {
      if (err.code === "ETIMEDOUT" && i < retries - 1) {
        console.warn(`⏳ Timeout, retrying... (${i + 1}/${retries})`);
        await delay(2000);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export async function scrapeReddit(
  input: redditScrapeInput
): Promise<redditScrapeOutput> {
  const { subreddit, postsCount } = input;
  try {
    const token = await getReadOnlyToken();
    const postsUrl = `https://oauth.reddit.com/r/${subreddit}/new?limit=${postsCount}`;

    const postsRes = await fetchWithRetry(postsUrl, {
      Authorization: `bearer ${token}`,
      "User-Agent": "read-only-scraper/1.0 by MemeBoyFromMars",
    });

    if (postsRes.status !== 200)
      throw new Error(`Failed to fetch posts: ${postsRes.status}`);

    const postsJson: any = postsRes.data;
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
        await delay(1000);
        const commentsUrl = `https://oauth.reddit.com/r/${subreddit}/comments/${post.id}`;
        const commentsRes = await fetchWithRetry(commentsUrl, {
          Authorization: `bearer ${token}`,
          "User-Agent": "read-only-scraper/1.0 by YOUR_USERNAME",
        });

        if (commentsRes.status !== 200)
          throw new Error(
            `Failed to fetch comments for post ${post.id}: ${commentsRes.status}`
          );

        const commentsJson: any = commentsRes.data;
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
        console.error(`⚠️ Error fetching comments for ${post.id}:`, err);
      }
    }

    return { posts: results };
  } catch (err) {
    console.error(err);
    return { posts: [] };
  }
}

const subarray = [
  "RealEstate",
  "RealEstateInvesting",
  "RealEstateTechnology",
  "RealEstateAdvice",
  "Dubai",
  "DubaiPetrolHeads",
  "DubaiCentral",
  "dubairealestate",
  "dubairealestatehelp",
  "Dubai_Real_Estate",
  "PropertyManagement",
  "realestateinvesting",
  "RealEstateReinvestment",
];

async function main() {
  for (const subreddit of subarray) {
    const res = await scrapeReddit({ subreddit, postsCount: 100 });
    console.dir(res, { depth: null });
    await delay(2000);
  }
}

main();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
