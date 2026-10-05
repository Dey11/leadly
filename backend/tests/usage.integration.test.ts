import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { PrismaClient } from "@prisma/client";
import type * as UsageService from "../src/lib/usage";

// This suite creates and deletes fixtures only in a dedicated local database.
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (
  databaseUrl.hostname !== "127.0.0.1" ||
  databaseUrl.pathname !== "/leadly_quota_test"
) {
  throw new Error("Usage integration tests require local leadly_quota_test");
}
Object.assign(process.env, {
  NODE_ENV: "development",
  SESSION_SECRET: "integration-test",
  FRONTEND_URL: "http://localhost:3000",
  NITTER_URL: "http://localhost:8080",
  REDDIT_CLIENT_ID: "integration-test",
  REDDIT_CLIENT_SECRET: "integration-test",
  DODO_API_KEY: "integration-test",
  DODO_WEBHOOK_SECRET: "integration-test",
  DODO_PRO_PRODUCT_ID: "integration-pro",
  DODO_PREMIUM_PRODUCT_ID: "integration-premium",
  RESEND_API_KEY: "integration-test",
  GOOGLE_GENERATIVE_AI_API_KEY: "integration-test",
  NEBIUS_API_KEY: "integration-test",
  GOOGLE_OAUTH_ENABLED: "false",
});

let db: PrismaClient;
let usage: typeof UsageService;
const userIds: string[] = [];
const now = new Date();
const monthStart = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
);
const monthEnd = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
);
const oldStart = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1),
);
const accessEnd = new Date(
  Date.UTC(now.getUTCFullYear() + 1, now.getUTCMonth(), 21),
);

beforeAll(async () => {
  ({ default: db } = await import("../src/lib/db"));
  usage = await import("../src/lib/usage");
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

async function fixture(periodStart = oldStart, periodEnd = accessEnd) {
  const user = await db.user.create({
    data: {
      email: `quota-${crypto.randomUUID()}@example.invalid`,
      name: "Quota integration fixture",
      passwordHash: "unused",
    },
  });
  userIds.push(user.id);
  await db.usage.create({
    data: {
      userId: user.id,
      periodStart,
      periodEnd,
      scrapesUsed: 720,
      keywordScrapesUsed: 720,
      dailyDate: monthStart,
      dailyCount: 24,
      keywordDailyCount: 24,
    },
  });
  return user.id;
}

describe("monthly quota persistence", () => {
  test("repairs both exhausted counters and allows both monitoring modes", async () => {
    const userId = await fixture();
    const summary = await usage.previewUsage(userId, "PREMIUM", accessEnd);
    expect(summary.monthlyUsed).toBe(0);
    expect(summary.dailyUsed).toBe(0);
    expect(summary.periodStart).toEqual(monthStart);
    expect(summary.periodEnd).toEqual(monthEnd);

    for (const kind of ["LEAD_GEN", "KEYWORD"] as const) {
      const credit = await usage.tryConsumeScrapeCredit(
        userId,
        "PREMIUM",
        accessEnd,
        "on",
        kind,
      );
      expect(credit.allowed).toBe(true);
      expect(credit.summary.monthlyUsed).toBe(1);
      expect(credit.summary.dailyUsed).toBe(1);
    }
    const stored = await db.usage.findUniqueOrThrow({ where: { userId } });
    expect(stored.scrapesUsed).toBe(1);
    expect(stored.keywordScrapesUsed).toBe(1);
  });

  test("concurrent and repeated previews do not erase consumed credits", async () => {
    const userId = await fixture();
    await Promise.all(
      Array.from({ length: 12 }, () =>
        usage.previewUsage(userId, "PREMIUM", accessEnd),
      ),
    );
    await usage.tryConsumeScrapeCredit(userId, "PREMIUM", accessEnd, "on");
    const summaries = await Promise.all(
      Array.from({ length: 12 }, () =>
        usage.previewUsage(userId, "PREMIUM", accessEnd),
      ),
    );
    expect(summaries.every((summary) => summary.monthlyUsed === 1)).toBe(true);
    expect(
      (await db.usage.findUniqueOrThrow({ where: { userId } })).scrapesUsed,
    ).toBe(1);
  });

  test("shortening a current-month legacy window preserves both quotas", async () => {
    const userId = await fixture(monthStart);
    await usage.previewUsage(userId, "PREMIUM", accessEnd);
    const stored = await db.usage.findUniqueOrThrow({ where: { userId } });
    expect(stored.periodEnd).toEqual(monthEnd);
    expect(stored.scrapesUsed).toBe(720);
    expect(stored.keywordScrapesUsed).toBe(720);
    expect(
      (await usage.tryConsumeScrapeCredit(userId, "PREMIUM", accessEnd, "on"))
        .reason,
    ).toBe("monthly_limit_exceeded");
  });

  test("ordinary exhausted monthly billing remains blocked", async () => {
    const userId = await fixture(monthStart, monthEnd);
    const result = await usage.tryConsumeScrapeCredit(
      userId,
      "PREMIUM",
      monthEnd,
      "on",
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("monthly_limit_exceeded");
    expect(result.summary.monthlyUsed).toBe(720);
  });

  test("expired paid access does not receive fresh quota", async () => {
    const expired = new Date(now.getTime() - 86400000);
    const userId = await fixture(oldStart, expired);
    const result = await usage.tryConsumeScrapeCredit(
      userId,
      "PREMIUM",
      expired,
      "on",
    );
    expect(result.allowed).toBe(false);
    expect(result.summary.monthlyUsed).toBe(720);
    expect(
      (await db.usage.findUniqueOrThrow({ where: { userId } })).periodEnd,
    ).toEqual(expired);
  });

  test("expired paid access cannot spend leftover or newly initialized quota", async () => {
    const expired = new Date(now.getTime() - 86400000);
    const userId = await fixture(oldStart, expired);
    await db.usage.update({
      where: { userId },
      data: { scrapesUsed: 0, dailyCount: 0 },
    });
    const leftover = await usage.tryConsumeScrapeCredit(
      userId,
      "PREMIUM",
      expired,
      "on",
    );
    expect(leftover.allowed).toBe(false);
    expect(leftover.reason).toBe("subscription_period_expired");
    await db.usage.delete({ where: { userId } });
    const initialized = await usage.tryConsumeScrapeCredit(
      userId,
      "PREMIUM",
      expired,
      "on",
    );
    expect(initialized.allowed).toBe(false);
    expect(initialized.summary.monthlyUsed).toBe(0);
  });

  test("billing initialization bounds extended access and resets both counters", async () => {
    const userId = await fixture();
    await usage.initializeOrResetUsagePeriod(
      db,
      userId,
      "PREMIUM",
      oldStart,
      accessEnd,
    );
    const stored = await db.usage.findUniqueOrThrow({ where: { userId } });
    expect(stored.periodStart).toEqual(monthStart);
    expect(stored.periodEnd).toEqual(monthEnd);
    expect(stored.scrapesUsed).toBe(0);
    expect(stored.keywordScrapesUsed).toBe(0);
  });

  test("initializes a missing usage row within the current month", async () => {
    const userId = await fixture();
    await db.usage.delete({ where: { userId } });
    const summary = await usage.previewUsage(userId, "PREMIUM", accessEnd);
    expect(summary.periodStart.getTime()).toBeLessThanOrEqual(Date.now());
    expect(summary.periodEnd).toEqual(monthEnd);
    expect(summary.monthlyUsed).toBe(0);
  });
});
