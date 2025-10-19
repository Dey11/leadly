import axios from "axios";
import { env } from "../env";
import { cleanText, delay, fetchWithRetry } from "../lib/utils";
import { redditComment, redditPost } from "../types/reddit";

export class Reddit {
  private clientId: string;
  private clientSecret: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private readonly baseUrl: string = "https://oauth.reddit.com";
  private readonly timeout: number = 10000;

  constructor(clientId: string, clientSecret: string, timeout: number = 10000) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.timeout = timeout;
  }

  async getToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && now < this.tokenExpiry) {
      return this.token;
    }

    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        auth: { username: this.clientId, password: this.clientSecret },
        headers: { "User-Agent": `leadly by u/${env.REDDIT_USERNAME}` },
        timeout: 10000,
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiry = now + response.data.expires_in - 60;
    return this.token;
  }

  async fetchPosts(subreddit: string, limit: number = 10) {
    const token = await this.getToken();
    const url = `${this.baseUrl}/r/${subreddit}/top?limit=${limit}`;
    const results: redditPost[] = [];

    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": `leadly by u/${env.REDDIT_USERNAME}`,
      },
      timeout: this.timeout,
    });

    if (response?.status !== 200 || !response) {
      throw new Error(`Failed to fetch: ${response?.status}`);
    }

    const posts = response.data.data.children.map((child: any) => child.data);
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
        const commentsUrl = `${this.baseUrl}/r/${subreddit}/comments/${post.id}`;
        const commentsRes = await fetchWithRetry(commentsUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": `leadly by u/${env.REDDIT_USERNAME}`,
          },
          timeout: this.timeout,
        });

        if (commentsRes?.status !== 200 || !commentsRes)
          throw new Error(
            `Failed to fetch comments for post ${post.id}: ${commentsRes?.status}`
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
        console.error(`Error fetching comments for ${post.id}:`, err);
      }
    }

    return results;
  }
}
