import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { SubscriptionStatus, type Subscription } from "@prisma/client";
import type { AutomationState } from "./automation-policy";

// Module mocks must not replace automation exports in another test suite.
if (process.env.LEADLY_SCHEDULER_TEST_CHILD === "1") {
  const getAutomationStateForUser = mock(
    async (): Promise<AutomationState> => ({
      enabled: false,
      pausedForInactivity: false,
      pauseReason: "ADMINISTRATIVE" as const,
      inactivityThresholdDays: 3,
    }),
  );
  const tryConsumeScrapeCredit = mock(
    async (): Promise<
      Awaited<ReturnType<typeof import("../lib/usage").tryConsumeScrapeCredit>>
    > => {
      throw new Error("Paused automation must not consume credits");
    },
  );
  const previewUsage = mock(
    async (): Promise<
      Awaited<ReturnType<typeof import("../lib/usage").previewUsage>>
    > => {
      throw new Error("Paused automation must not preview usage");
    },
  );
  const enqueueScrapeJob = mock(async () => undefined);
  const processStuckJob = mock(async () => undefined);
  const processKeywordScrapeJob = mock(async () => undefined);
  const processKeywordStuckJob = mock(async () => undefined);
  const createScrapeJob = mock(async () => undefined);
  const createKeywordScrapeJob = mock(async () => undefined);

  const subscription: Pick<
    Subscription,
    "tier" | "status" | "cancelledAtPeriodEnd" | "currentPeriodEnd"
  > = {
    tier: "PREMIUM",
    status: SubscriptionStatus.ACTIVE,
    cancelledAtPeriodEnd: false,
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
  };
  const scheduledUser = {
    id: "premium-user",
    isDeleted: false,
    subscription,
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
    scheduledUser.subscription.status = SubscriptionStatus.ACTIVE;
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
    for (const status of [
      SubscriptionStatus.ON_HOLD,
      SubscriptionStatus.EXPIRED,
    ]) {
      test(`both scheduler modes use Free limits for ${status} paid accounts`, async () => {
        scheduledUser.subscription.status = status;
        const enabled: AutomationState = {
          enabled: true,
          pausedForInactivity: false,
          pauseReason: null,
          inactivityThresholdDays: 3,
        };
        const summary = {
          dailyUsed: 0,
          dailyLimit: 1,
          monthlyUsed: 0,
          monthlyLimit: 30,
        };
        getAutomationStateForUser.mockResolvedValueOnce(enabled);
        previewUsage.mockResolvedValueOnce({
          ...summary,
          periodStart: new Date(),
          periodEnd: new Date(),
        });
        tryConsumeScrapeCredit.mockResolvedValueOnce({
          allowed: false,
          summary,
        });
        await runScheduler();
        expect(previewUsage).toHaveBeenCalledWith(
          "premium-user",
          "FREE",
          scheduledUser.subscription.currentPeriodEnd,
        );
        expect(tryConsumeScrapeCredit).toHaveBeenLastCalledWith(
          "premium-user",
          "FREE",
          scheduledUser.subscription.currentPeriodEnd,
          "on",
        );
        getAutomationStateForUser.mockResolvedValueOnce(enabled);
        tryConsumeScrapeCredit.mockResolvedValueOnce({
          allowed: false,
          summary,
        });
        await runKeywordScheduler();
        expect(tryConsumeScrapeCredit).toHaveBeenLastCalledWith(
          "premium-user",
          "FREE",
          scheduledUser.subscription.currentPeriodEnd,
          "on",
          "KEYWORD",
        );
        expect(createScrapeJob).not.toHaveBeenCalled();
        expect(createKeywordScrapeJob).not.toHaveBeenCalled();
      });
    }
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
} else {
  test("scheduler automation gates in an isolated process", async () => {
    const child = Bun.spawn([process.execPath, "test", __filename], {
      cwd: process.cwd(),
      env: { ...process.env, LEADLY_SCHEDULER_TEST_CHILD: "1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [output, errors] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(await child.exited, output + errors).toBe(0);
  });
}
