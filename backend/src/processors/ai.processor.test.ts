import { beforeAll, describe, expect, test } from "bun:test";
import type { LeadClassifier } from "./ai.processor";

Object.assign(process.env, {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  SESSION_SECRET: "test-session-secret",
  FRONTEND_URL: "http://localhost:3000",
  NODE_ENV: "development",
  NITTER_URL: "http://localhost:8080",
  REDDIT_CLIENT_ID: "test-client",
  REDDIT_CLIENT_SECRET: "test-secret",
  DODO_API_KEY: "test-dodo-key",
  DODO_WEBHOOK_SECRET: "test-webhook-secret",
  DODO_PRO_PRODUCT_ID: "test-pro-product",
  DODO_PREMIUM_PRODUCT_ID: "test-premium-product",
  RESEND_API_KEY: "test-resend-key",
  GOOGLE_GENERATIVE_AI_API_KEY: "test-google-ai-key",
  GOOGLE_CLIENT_ID: "test-google-client",
  GOOGLE_CLIENT_SECRET: "test-google-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/google/callback",
});

let processor: typeof import("./ai.processor");
let constants: typeof import("../lib/constants");

beforeAll(async () => {
  processor = await import("./ai.processor");
  constants = await import("../lib/constants");
});

const icp = {
  name: "Software clients",
  summary: "Teams seeking developers",
  targetPersona: "Founder",
  pains: "Delivery capacity",
  valueProposition: "Development help",
  qualifyingSignals: "Hiring",
  disqualifyingSignals: "Vendor offers",
};

const posts = ["one", "two", "three"].map((postId) => ({
  subreddit: "forhire",
  title: `Post ${postId}`,
  post: "Looking for development support",
  postId,
  posterId: `author-${postId}`,
  urlToPost: `https://reddit.com/${postId}`,
  comments: [],
}));

describe("processLeads resilience", () => {
  test("uses Gemini 3.5 Flash for lead classification", () => {
    const gemini = constants.AI_PROVIDERS.find(
      (provider) => provider.name === "gemini",
    );

    expect(gemini?.model).toBe("gemini-3.5-flash");
    expect(gemini?.liteModel).toBe("gemini-3.5-flash-lite");
  });

  test("bounds every classification and skips an isolated provider failure", async () => {
    const timeouts: number[] = [];
    let calls = 0;
    const classifier: LeadClassifier = async (options) => {
      calls += 1;
      timeouts.push(options.timeoutMs);
      if (calls === 1) throw new Error("provider stalled");
      return { array: [], providerName: "test" };
    };

    await expect(
      processor.processLeads(posts, icp, classifier),
    ).resolves.toEqual([]);
    expect(timeouts).toEqual([
      processor.AI_POST_CLASSIFICATION_TIMEOUT_MS,
      processor.AI_POST_CLASSIFICATION_TIMEOUT_MS,
      processor.AI_POST_CLASSIFICATION_TIMEOUT_MS,
    ]);
  });

  test("fails the job after three consecutive provider failures", async () => {
    let calls = 0;
    const classifier: LeadClassifier = async () => {
      calls += 1;
      throw new Error("provider stalled");
    };

    await expect(
      processor.processLeads(posts, icp, classifier),
    ).rejects.toThrow("provider stalled");
    expect(calls).toBe(3);
  });

  test("classifies at most two posts concurrently", async () => {
    let active = 0;
    let maxActive = 0;
    const classifier: LeadClassifier = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return { array: [], providerName: "test" };
    };

    await processor.processLeads(posts, icp, classifier);
    expect(maxActive).toBe(processor.AI_POST_CLASSIFICATION_CONCURRENCY);
  });
});
