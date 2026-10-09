import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import axios, { AxiosHeaders, type AxiosResponse } from "axios";

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
  NEBIUS_API_KEY: "test-nebius-key",
  GOOGLE_CLIENT_ID: "test-google-client",
  GOOGLE_CLIENT_SECRET: "test-google-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/google/callback",
});

let Reddit: typeof import("./reddit").Reddit;
const get = spyOn(axios, "get");

beforeAll(async () => {
  ({ Reddit } = await import("./reddit"));
});

afterEach(() => {
  get.mockReset();
});

afterAll(() => {
  get.mockRestore();
});

function response(data: unknown, status = 200): AxiosResponse<unknown> {
  return {
    status,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  };
}

function listing(...ids: string[]) {
  return response({
    data: {
      children: ids.map((id) => ({
        data: {
          id,
          subreddit: "forhire",
          title: `Hiring for ${id}`,
          selftext: "Paid development work",
          author: "buyer",
          permalink: `/r/forhire/comments/${id}/hiring/`,
        },
      })),
    },
  });
}

function client() {
  const reddit = new Reddit("test-client", "test-secret");
  spyOn(reddit, "getToken").mockResolvedValue("test-token");
  return reddit;
}

const customFeed = {
  type: "CUSTOM_FEED" as const,
  owner: "buyer",
  name: "jobs_gigs",
};

describe("Reddit scan cursor recovery", () => {
  test("discovers new gigs when a deleted bookmark returns an empty custom feed", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(listing("new-gig"))
      .mockResolvedValue(response([]));

    const posts = await client().fetchPosts(customFeed, 50, "deleted-gig");

    expect(posts.map((post) => post.postId)).toEqual(["new-gig"]);
    expect(get.mock.calls[0][0]).toBe(
      "https://oauth.reddit.com/user/buyer/m/jobs_gigs/new?limit=50&before=t3_deleted-gig",
    );
    expect(get.mock.calls[1][0]).toBe(
      "https://oauth.reddit.com/user/buyer/m/jobs_gigs/new?limit=50",
    );
  });

  test("does not replay old gigs when the bookmark is still the newest post", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(listing("latest", "older"));

    expect(await client().fetchPosts(customFeed, 50, "latest")).toEqual([]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  test("stops at an existing bookmark in the recovery listing", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(listing("new-gig", "bookmark", "older"))
      .mockResolvedValue(response([]));

    const posts = await client().fetchPosts(customFeed, 50, "bookmark");

    expect(posts.map((post) => post.postId)).toEqual(["new-gig"]);
    expect(get).toHaveBeenCalledTimes(3);
  });

  test("also recovers a subreddit monitor", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(listing("new-gig"))
      .mockResolvedValue(response([]));

    const posts = await client().fetchPosts(
      { type: "SUBREDDIT", subreddit: "forhire" },
      50,
      "deleted-gig",
    );

    expect(posts[0].postId).toBe("new-gig");
    expect(get.mock.calls[1][0]).toBe(
      "https://oauth.reddit.com/r/forhire/new?limit=50",
    );
  });

  test("keeps normal incremental scans to one listing request", async () => {
    get
      .mockResolvedValueOnce(listing("new-gig"))
      .mockResolvedValue(response([]));

    const posts = await client().fetchPosts(customFeed, 50, "bookmark");

    expect(posts[0].postId).toBe("new-gig");
    expect(get).toHaveBeenCalledTimes(2);
  });

  test("does not retry an initial empty feed without a bookmark", async () => {
    get.mockResolvedValueOnce(listing());

    expect(await client().fetchPosts(customFeed, 50)).toEqual([]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  test("bounds recovery to one extra listing when the feed is empty", async () => {
    get.mockResolvedValue(listing());

    expect(await client().fetchPosts(customFeed, 50, "bookmark")).toEqual([]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  test("propagates Reddit failures instead of treating them as an empty feed", async () => {
    get.mockRejectedValueOnce(new Error("Reddit unavailable"));

    await expect(
      client().fetchPosts(customFeed, 50, "bookmark"),
    ).rejects.toThrow("Reddit unavailable");
    expect(get).toHaveBeenCalledTimes(1);
  });

  test("fails the scan when the recovery request fails", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockRejectedValueOnce(new Error("Reddit unavailable"));

    await expect(
      client().fetchPosts(customFeed, 50, "bookmark"),
    ).rejects.toThrow("Reddit unavailable");
    expect(get).toHaveBeenCalledTimes(2);
  });

  test("rejects malformed listings instead of completing an empty scan", async () => {
    get.mockResolvedValueOnce(response({ data: { children: null } }));

    await expect(
      client().fetchPosts(customFeed, 50, "bookmark"),
    ).rejects.toThrow();
    expect(get).toHaveBeenCalledTimes(1);
  });

  test("rejects a non-success response from the recovery listing", async () => {
    get
      .mockResolvedValueOnce(listing())
      .mockResolvedValueOnce(response({}, 503));

    await expect(
      client().fetchPosts(customFeed, 50, "bookmark"),
    ).rejects.toThrow("Failed to fetch: 503");
    expect(get).toHaveBeenCalledTimes(2);
  });
});
