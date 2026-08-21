import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

const getAutomationStateForUser = mock(async () => ({
  enabled: false,
  pausedForInactivity: false,
  pauseReason: "ADMINISTRATIVE" as const,
  inactivityThresholdDays: 3,
}));
const tryConsumeScrapeCredit = mock(async () => {
  throw new Error("Paused automation must not consume credits");
});
const previewUsage = mock(async () => {
  throw new Error("Paused automation must not preview usage");
});
const enqueueScrapeJob = mock(async () => undefined);
const processStuckJob = mock(async () => undefined);
const processKeywordScrapeJob = mock(async () => undefined);
const processKeywordStuckJob = mock(async () => undefined);
const createScrapeJob = mock(async () => undefined);
const createKeywordScrapeJob = mock(async () => undefined);

const scheduledUser = {
  id: "premium-user",
  isDeleted: false,
  subscription: {
    tier: "PREMIUM",
    currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
  },
  monitors: [{ id: "monitor-1" }],
  keywordMonitors: [{ id: "keyword-monitor-1" }],
};

const db = {
  scrapeJob: {
    findMany: mock(async () => []),
    findFirst: mock(async () => null),
    create: createScrapeJob,
  },
  keywordScrapeJob: {
    findMany: mock(async () => []),
    findFirst: mock(async () => null),
    create: createKeywordScrapeJob,
  },
  userSchedule: {
    findMany: mock(async () => [{ user: scheduledUser }]),
  },
  keywordSchedule: {
    findMany: mock(async () => [{ user: scheduledUser }]),
  },
};

mock.module("../lib/db", () => ({ default: db }));
mock.module("../lib/logger", () => ({
  default: {
    info: mock(() => undefined),
    warn: mock(() => undefined),
    error: mock(() => undefined),
  },
}));
mock.module("../env", () => ({
  env: {
    FEATURE_BILLING_ENFORCEMENT: "on",
    DODO_PRO_PRODUCT_ID: "test-pro",
    DODO_PREMIUM_PRODUCT_ID: "test-premium",
  },
}));
mock.module("../lib/usage", () => ({
  tryConsumeScrapeCredit,
  previewUsage,
}));
mock.module("../lib/queue", () => ({
  scrapeJobsQueue: { add: enqueueScrapeJob },
}));
mock.module("./automation", () => ({ getAutomationStateForUser }));
mock.module("../processors/reddit.processor", () => ({ processStuckJob }));
mock.module("../processors/keyword.processor", () => ({
  processKeywordScrapeJob,
  processKeywordStuckJob,
}));

let runScheduler: typeof import("./scheduler").runScheduler;
let runKeywordScheduler: typeof import("./keyword-scheduler").runKeywordScheduler;

beforeAll(async () => {
  ({ runScheduler } = await import("./scheduler"));
  ({ runKeywordScheduler } = await import("./keyword-scheduler"));
});

beforeEach(() => {
  for (const fn of [
    getAutomationStateForUser,
    tryConsumeScrapeCredit,
    previewUsage,
    enqueueScrapeJob,
    processStuckJob,
    processKeywordScrapeJob,
    processKeywordStuckJob,
    createScrapeJob,
    createKeywordScrapeJob,
  ]) {
    fn.mockClear();
  }
});

describe("scheduler automation gate", () => {
  test("paused ICP accounts consume no credit and create or enqueue no jobs", async () => {
    await runScheduler();

    expect(getAutomationStateForUser).toHaveBeenCalledWith("premium-user");
    expect(previewUsage).not.toHaveBeenCalled();
    expect(tryConsumeScrapeCredit).not.toHaveBeenCalled();
    expect(createScrapeJob).not.toHaveBeenCalled();
    expect(enqueueScrapeJob).not.toHaveBeenCalled();
    expect(processStuckJob).not.toHaveBeenCalled();
  });

  test("paused keyword accounts consume no credit and create or run no jobs", async () => {
    await runKeywordScheduler();

    expect(getAutomationStateForUser).toHaveBeenCalledWith("premium-user");
    expect(tryConsumeScrapeCredit).not.toHaveBeenCalled();
    expect(createKeywordScrapeJob).not.toHaveBeenCalled();
    expect(processKeywordScrapeJob).not.toHaveBeenCalled();
    expect(processKeywordStuckJob).not.toHaveBeenCalled();
  });
});
