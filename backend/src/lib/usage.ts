import db from "../lib/db";
import { TIER_LIMITS } from "./constants";
import { SubscriptionTier } from "@prisma/client";

type Enforcement = "off" | "log" | "on";

function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}

function monthlyWindowForFree(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

/**
 * Initialize or reset monthly usage window for a user.
 * If periodStart/periodEnd are not provided:
 *  - for FREE: use current UTC month window
 *  - for paid tiers: fallback to 30-day window from "now"
 *
 * @param dbClient - Either a Prisma transaction client or the global db client
 */
export async function initializeOrResetUsagePeriod(
  dbClient: any, // Prisma.TransactionClient | typeof db
  userId: string,
  tier: SubscriptionTier,
  periodStart?: Date,
  periodEnd?: Date
) {
  let start = periodStart;
  let end = periodEnd;
  if (!start || !end) {
    if (tier === "FREE") {
      const win = monthlyWindowForFree();
      start = win.start;
      end = win.end;
    } else {
      const now = new Date();
      end = end ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      start = start ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  const today = startOfUtcDay();
  await dbClient.usage.upsert({
    where: { userId },
    create: {
      userId,
      periodStart: start!,
      periodEnd: end!,
      scrapesUsed: 0,
      dailyDate: today,
      dailyCount: 0,
    },
    update: {
      periodStart: start!,
      periodEnd: end!,
      scrapesUsed: 0,
      dailyDate: today,
      dailyCount: 0,
    },
  });
}

/**
 * Ensure usage row exists. If missing, create a default based on tier.
 * For paid tiers, if no boundary passed, fallback to a 30-day rolling window from now.
 */
async function getOrCreateUsage(
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null
) {
  let usage = await db.usage.findUnique({ where: { userId } });
  if (!usage) {
    if (tier === "FREE") {
      const win = monthlyWindowForFree();
      usage = await db.usage.create({
        data: {
          userId,
          periodStart: win.start,
          periodEnd: win.end,
          scrapesUsed: 0,
          dailyDate: startOfUtcDay(),
          dailyCount: 0,
        },
      });
    } else {
      const end =
        currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      usage = await db.usage.create({
        data: {
          userId,
          periodStart: start,
          periodEnd: end,
          scrapesUsed: 0,
          dailyDate: startOfUtcDay(),
          dailyCount: 0,
        },
      });
    }
  }
  return usage;
}

function computeLimits(tier: SubscriptionTier) {
  const limits = TIER_LIMITS[tier];
  return {
    dailyLimit: limits.scrapesPerDay,
    monthlyLimit: limits.monthlyScrapeLimit,
  };
}

/**
 * Preview current usage counters and limits.
 */
export async function previewUsage(
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null
): Promise<{
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  periodStart: Date;
  periodEnd: Date;
}> {
  let usage = await getOrCreateUsage(userId, tier, currentPeriodEnd);

  // if we've crossed month window end for FREE plan, roll to new month
  const now = new Date();
  if (now > usage.periodEnd) {
    if (tier === "FREE") {
      const win = monthlyWindowForFree(now);
      usage = await db.usage.update({
        where: { userId },
        data: {
          periodStart: win.start,
          periodEnd: win.end,
          scrapesUsed: 0,
          dailyDate: startOfUtcDay(now),
          dailyCount: 0,
        },
      });
    }
  }

  const { dailyLimit, monthlyLimit } = computeLimits(tier);
  const today = startOfUtcDay();

  const dailyUsed =
    usage.dailyDate.toISOString() === today.toISOString()
      ? usage.dailyCount
      : 0;
  const monthlyUsed = usage.scrapesUsed;

  return {
    dailyUsed,
    dailyLimit,
    monthlyUsed,
    monthlyLimit,
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
  };
}

/**
 * Try to consume one scrape credit. Returns whether it is allowed based on enforcement, and a summary.
 * - enforcement = "on": hard block if exceeding limit (no increment).
 * - enforcement = "log": allow but log if over limit (still increments).
 * - enforcement = "off": allow and increment.
 */
export async function tryConsumeScrapeCredit(
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null,
  enforcement: Enforcement = "off"
): Promise<{
  allowed: boolean;
  reason?: string;
  summary: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
  };
}> {
  let usage = await getOrCreateUsage(userId, tier, currentPeriodEnd);
  const now = new Date();

  // Roll monthly window if ended (FREE only; for paid we expect webhook to set correct boundaries)
  if (now > usage.periodEnd && tier === "FREE") {
    const win = monthlyWindowForFree(now);
    usage = await db.usage.update({
      where: { userId },
      data: {
        periodStart: win.start,
        periodEnd: win.end,
        scrapesUsed: 0,
        dailyDate: startOfUtcDay(now),
        dailyCount: 0,
      },
    });
  }

  // Reset daily if date changed
  const today = startOfUtcDay(now);
  if (usage.dailyDate.toISOString() !== today.toISOString()) {
    usage = await db.usage.update({
      where: { userId },
      data: {
        dailyDate: today,
        dailyCount: 0,
      },
    });
  }

  const { dailyLimit, monthlyLimit } = computeLimits(tier);

  const currentDaily = usage.dailyCount;
  const currentMonthly = usage.scrapesUsed;

  const wouldExceedDaily = currentDaily + 1 > dailyLimit;
  const wouldExceedMonthly = currentMonthly + 1 > monthlyLimit;

  if (enforcement === "on" && (wouldExceedDaily || wouldExceedMonthly)) {
    return {
      allowed: false,
      reason: wouldExceedMonthly
        ? "monthly_limit_exceeded"
        : "daily_limit_exceeded",
      summary: {
        dailyUsed: currentDaily,
        dailyLimit,
        monthlyUsed: currentMonthly,
        monthlyLimit,
      },
    };
  }

  // increment counters (even if logging mode)
  const updated = await db.usage.update({
    where: { userId },
    data: {
      scrapesUsed: { increment: 1 },
      dailyCount: { increment: 1 },
    },
  });

  return {
    allowed: true,
    reason:
      enforcement === "log" && (wouldExceedDaily || wouldExceedMonthly)
        ? wouldExceedMonthly
          ? "monthly_limit_exceeded_logged"
          : "daily_limit_exceeded_logged"
        : undefined,
    summary: {
      dailyUsed: updated.dailyCount,
      dailyLimit,
      monthlyUsed: updated.scrapesUsed,
      monthlyLimit,
    },
  };
}
