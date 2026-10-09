import { beforeAll, expect, mock, test } from "bun:test";
import type { Prisma } from "@prisma/client";
import type { RedditFetchTarget, RedditPost } from "../src/types/reddit";

// Run separately from src tests, whose scheduler mocks replace this processor.
const monitor = {
  id: "keyword-monitor",
  userId: "buyer",
  targetType: "SUBREDDIT",
  target: "forhire",
  cursor: "deleted-gig",
  keywordSet: { keywords: ["hiring"], isFuzzyMatch: false },
  user: { id: "buyer" },
};

const posts: RedditPost[] = ["newest", "older"].map((postId) => ({
  postId,
  subreddit: "forhire",
  title: `Hiring for ${postId}`,
  post: "Paid development work",
  posterId: "buyer",
  urlToPost: `https://reddit.com/r/forhire/comments/${postId}/hiring/`,
  comments: [],
}));

const fetchPosts = mock(
  async (_target: RedditFetchTarget, _limit: number, cursor: string | null) =>
    cursor === "newest" ? [] : posts,
);
const createLeads = mock(
  async ({ data }: Prisma.KeywordLeadCreateManyArgs) => ({
    count: Array.isArray(data) ? data.length : 1,
  }),
);
const updateMonitor = mock(
  async ({ data }: { data: { cursor: string | null } }) => {
    monitor.cursor = data.cursor ?? monitor.cursor;
    return monitor;
  },
);
const tx = {
  keywordScrapeJob: {
    updateMany: mock(async () => ({ count: 1 })),
    update: mock(async () => ({})),
  },
  keywordLead: { createMany: createLeads },
  keywordMonitor: { update: updateMonitor },
};

mock.module("../src/lib/db", () => ({
  default: {
    keywordScrapeJob: {
      findUnique: mock(async () => ({ status: "PENDING", retryCount: 0 })),
      updateMany: mock(async () => ({ count: 1 })),
    },
    keywordMonitor: { findUnique: mock(async () => ({ ...monitor })) },
    keywordLead: { findMany: mock(async () => []) },
    $transaction: async (
      commit: (transaction: typeof tx) => Promise<unknown>,
    ) => commit(tx),
  },
}));
mock.module("../src/services/reddit", () => ({
  Reddit: class {
    fetchPosts = fetchPosts;
  },
}));
mock.module("../src/env", () => ({ env: {} }));
mock.module("../src/lib/logger", () => ({
  default: { info() {}, warn() {}, error() {} },
}));
mock.module("../src/services/automation", () => ({
  getAutomationStateForUser: async () => ({ enabled: true }),
  automationEligibleUserWhere: () => ({}),
  automationCancellationMessage: () => "Automation paused",
}));
mock.module("../src/services/notification.service", () => ({
  notifyNewLeads: mock(async () => undefined),
}));

let processKeywordScrapeJob: typeof import("../src/processors/keyword.processor").processKeywordScrapeJob;

beforeAll(async () => {
  ({ processKeywordScrapeJob } =
    await import("../src/processors/keyword.processor"));
});

test("a recovered keyword scan saves the newest bookmark and does not replay matches next time", async () => {
  await processKeywordScrapeJob(monitor.id, "recovery-job");
  expect(monitor.cursor).toBe("newest");
  await expect(createLeads.mock.results[0].value).resolves.toEqual({
    count: 2,
  });

  await processKeywordScrapeJob(monitor.id, "next-job");
  expect(fetchPosts.mock.calls[1][2]).toBe("newest");
  await expect(createLeads.mock.results[1].value).resolves.toEqual({
    count: 0,
  });
  expect(monitor.cursor).toBe("newest");
});
