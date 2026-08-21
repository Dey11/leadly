import { beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";

const now = new Date("2026-08-21T07:00:00.000Z");
const findUnique = mock(async () => ({
  id: "premium-user",
  lastActiveAt: new Date("2026-08-20T22:43:13.969Z"),
  freeAutomationPausedAt: null,
  administrativeAutomationPausedAt: new Date("2026-08-21T06:48:44.209Z"),
  subscription: { tier: "PREMIUM" as const },
}));
const update = mock(async () => ({ id: "premium-user" }));
const updateMany = mock(async () => ({ count: 1 }));
const userCount = mock(async () => 40);
const scrapeJobUpdateMany = mock(async () => ({ count: 0 }));
const scrapeJobCount = mock(async () => 12);
const keywordJobUpdateMany = mock(async () => ({ count: 0 }));
const keywordJobCount = mock(async () => 3);

const transactionDb = {
  user: {
    findUnique,
    update,
    updateMany,
    count: userCount,
  },
  scrapeJob: { updateMany: scrapeJobUpdateMany, count: scrapeJobCount },
  keywordScrapeJob: {
    updateMany: keywordJobUpdateMany,
    count: keywordJobCount,
  },
};
const transaction = mock(
  async <T>(callback: (tx: typeof transactionDb) => Promise<T>) =>
    callback(transactionDb),
);

mock.module("../lib/db", () => ({
  default: {
    ...transactionDb,
    $transaction: transaction,
  },
}));
mock.module("../lib/logger", () => ({
  default: {
    info: mock(() => undefined),
    warn: mock(() => undefined),
    error: mock(() => undefined),
  },
}));

let enableAutomationForUser: typeof import("./automation").enableAutomationForUser;
let automationEligibleUserWhere: typeof import("./automation").automationEligibleUserWhere;
let recordAuthenticatedActivity: typeof import("./automation").recordAuthenticatedActivity;
let pauseAllAutomationAdministratively: typeof import("./automation").pauseAllAutomationAdministratively;
let previewAdministrativeAutomationPause: typeof import("./automation").previewAdministrativeAutomationPause;
let automationCancellationMessage: typeof import("./automation").automationCancellationMessage;

beforeAll(async () => {
  ({
    enableAutomationForUser,
    automationEligibleUserWhere,
    recordAuthenticatedActivity,
    pauseAllAutomationAdministratively,
    previewAdministrativeAutomationPause,
    automationCancellationMessage,
  } = await import("./automation"));
});

beforeEach(() => {
  findUnique.mockClear();
  update.mockClear();
  updateMany.mockClear();
  userCount.mockClear();
  scrapeJobUpdateMany.mockClear();
  scrapeJobCount.mockClear();
  keywordJobUpdateMany.mockClear();
  keywordJobCount.mockClear();
  transaction.mockClear();
});

describe("account automation", () => {
  test("explicit re-enable clears every pause source and refreshes activity", async () => {
    const state = await enableAutomationForUser("premium-user", now);

    expect(update).toHaveBeenCalledWith({
      where: { id: "premium-user" },
      data: {
        lastActiveAt: now,
        freeAutomationPausedAt: null,
        administrativeAutomationPausedAt: null,
      },
    });
    expect(state).toEqual({
      enabled: true,
      pausedForInactivity: false,
      pauseReason: null,
      inactivityThresholdDays: 3,
    });
  });

  test("write-boundary eligibility excludes administratively paused accounts", () => {
    expect(automationEligibleUserWhere(now)).toMatchObject({
      administrativeAutomationPausedAt: null,
    });
  });

  test("authenticated use records activity without clearing an administrative pause", async () => {
    const state = await recordAuthenticatedActivity("premium-user", now);

    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          administrativeAutomationPausedAt: null,
        }),
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: "premium-user",
        lastActiveAt: {
          lte: new Date("2026-08-21T06:00:00.000Z"),
        },
      },
      data: { lastActiveAt: now },
    });
    expect(state).toEqual({
      enabled: false,
      pausedForInactivity: false,
      pauseReason: "ADMINISTRATIVE",
      inactivityThresholdDays: 3,
    });
  });

  test("administrative pause atomically stops every account without changing definitions", async () => {
    updateMany.mockResolvedValueOnce({ count: 40 });
    scrapeJobUpdateMany.mockResolvedValueOnce({ count: 12 });
    keywordJobUpdateMany.mockResolvedValueOnce({ count: 3 });

    const result = await pauseAllAutomationAdministratively(now);

    expect(updateMany).toHaveBeenCalledWith({
      where: { isDeleted: false },
      data: { administrativeAutomationPausedAt: now },
    });
    expect(scrapeJobUpdateMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { status: { in: ["PENDING", "RUNNING"] } },
          { status: "FAILED", nextRetryAt: { not: null } },
        ],
        monitor: { user: { isDeleted: false } },
      },
      data: {
        status: "CANCELLED",
        errorMessage:
          "Cancelled because automation was paused administratively.",
        nextRetryAt: null,
      },
    });
    expect(keywordJobUpdateMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { status: { in: ["PENDING", "RUNNING"] } },
          { status: "FAILED", nextRetryAt: { not: null } },
        ],
        keywordMonitor: { user: { isDeleted: false } },
      },
      data: {
        status: "CANCELLED",
        errorMessage:
          "Cancelled because automation was paused administratively.",
        nextRetryAt: null,
      },
    });
    expect(result).toEqual({
      pausedAt: now,
      pausedAccounts: 40,
      cancelledIcpJobs: 12,
      cancelledKeywordJobs: 3,
    });
  });

  test("administrative pause preview reports scope without mutating state", async () => {
    const result = await previewAdministrativeAutomationPause();

    expect(result).toEqual({
      affectedAccounts: 40,
      cancellableIcpJobs: 12,
      cancellableKeywordJobs: 3,
    });
    expect(updateMany).not.toHaveBeenCalled();
    expect(scrapeJobUpdateMany).not.toHaveBeenCalled();
    expect(keywordJobUpdateMany).not.toHaveBeenCalled();
  });

  test("worker cancellation messages reflect the effective pause reason", () => {
    expect(
      automationCancellationMessage({
        enabled: false,
        pausedForInactivity: false,
        pauseReason: "ADMINISTRATIVE",
        inactivityThresholdDays: 3,
      }),
    ).toBe("Cancelled because automation was paused administratively.");
  });
});
