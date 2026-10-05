import db from "../lib/db";
import { TIER_LIMITS } from "./constants";
import { SubscriptionTier, type Prisma, type Usage } from "@prisma/client";
import {
  resolveInitialUsagePeriod,
  resolveUsagePeriodRollover,
} from "./usage-period";

type Enforcement = "off" | "log" | "on";

function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

async function reconcileUsagePeriod(
  usage: Usage,
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null,
  now: Date = new Date(),
) {
  const rollover = resolveUsagePeriodRollover({
    tier,
    usagePeriodStart: usage.periodStart,
    usagePeriodEnd: usage.periodEnd,
    currentPeriodEnd,
    now,
  });

  if (!rollover) {
    return usage;
  }

  // Only one request may reset this stored window. Concurrent previews must
  // not erase credits consumed after another request already reset it.
  await db.usage.updateMany({
    where: {
      userId,
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
    },
    data: {
      periodStart: rollover.periodStart,
      periodEnd: rollover.periodEnd,
      ...(rollover.resetUsage
        ? {
            scrapesUsed: 0,
            dailyDate: startOfUtcDay(now),
            dailyCount: 0,
            keywordScrapesUsed: 0,
            keywordDailyCount: 0,
          }
        : {}),
    },
  });

  return db.usage.findUniqueOrThrow({ where: { userId } });
}

export type ScrapeType = "LEAD_GEN" | "KEYWORD";

/**
 * Initialize or reset monthly usage window for a user.
 */
export async function initializeOrResetUsagePeriod(
  dbClient: Pick<Prisma.TransactionClient, "usage">,
  userId: string,
  tier: SubscriptionTier,
  periodStart?: Date,
  periodEnd?: Date,
) {
  const period = resolveInitialUsagePeriod({ tier, periodStart, periodEnd });

  const today = startOfUtcDay();
  await dbClient.usage.upsert({
    where: { userId },
    create: {
      userId,
      ...period,
      scrapesUsed: 0,
      dailyDate: today,
      dailyCount: 0,
      keywordScrapesUsed: 0,
      keywordDailyCount: 0,
    },
    update: {
      ...period,
      scrapesUsed: 0,
      dailyDate: today,
      dailyCount: 0,
      keywordScrapesUsed: 0,
      keywordDailyCount: 0,
    },
  });
}

/**
 * Ensure usage row exists.
 */
async function getOrCreateUsage(
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null,
) {
  let usage = await db.usage.findUnique({ where: { userId } });
  if (!usage) {
    const commonData = {
      userId,
      scrapesUsed: 0,
      dailyDate: startOfUtcDay(),
      dailyCount: 0,
      keywordScrapesUsed: 0,
      keywordDailyCount: 0,
    };

    usage = await db.usage.create({
      data: {
        ...commonData,
        ...resolveInitialUsagePeriod({ tier, periodEnd: currentPeriodEnd }),
      },
    });
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
  currentPeriodEnd?: Date | null,
  type: ScrapeType = "LEAD_GEN",
): Promise<{
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  periodStart: Date;
  periodEnd: Date;
}> {
  let usage = await getOrCreateUsage(userId, tier, currentPeriodEnd);

  const now = new Date();
  usage = await reconcileUsagePeriod(
    usage,
    userId,
    tier,
    currentPeriodEnd,
    now,
  );

  const { dailyLimit, monthlyLimit } = computeLimits(tier);
  const today = startOfUtcDay();

  // Determine which counter to look at
  const currentDailyCount =
    type === "KEYWORD" ? usage.keywordDailyCount : usage.dailyCount;
  const currentMonthlyCount =
    type === "KEYWORD" ? usage.keywordScrapesUsed : usage.scrapesUsed;

  const dailyUsed =
    usage.dailyDate.toISOString() === today.toISOString()
      ? currentDailyCount
      : 0;

  return {
    dailyUsed,
    dailyLimit,
    monthlyUsed: currentMonthlyCount,
    monthlyLimit,
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
  };
}

/**
 * Try to consume one scrape credit. Returns whether it is allowed based on enforcement, and a summary.
 */
export async function tryConsumeScrapeCredit(
  userId: string,
  tier: SubscriptionTier,
  currentPeriodEnd?: Date | null,
  enforcement: Enforcement = "off",
  type: ScrapeType = "LEAD_GEN",
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

  usage = await reconcileUsagePeriod(
    usage,
    userId,
    tier,
    currentPeriodEnd,
    now,
  );

  // Reset daily if date changed
  const today = startOfUtcDay(now);
  if (usage.dailyDate.toISOString() !== today.toISOString()) {
    usage = await db.usage.update({
      where: { userId },
      data: {
        dailyDate: today,
        dailyCount: 0,
        keywordDailyCount: 0,
      },
    });
  }

  // TODO: problem here, need to fix this later. Does not matter right now since requests come every hour
  const { dailyLimit, monthlyLimit } = computeLimits(tier);

  // Determine current counters
  const currentDaily =
    type === "KEYWORD" ? usage.keywordDailyCount : usage.dailyCount;
  const currentMonthly =
    type === "KEYWORD" ? usage.keywordScrapesUsed : usage.scrapesUsed;

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
  // Construct partial update object based on type
  const updateData: any = {};
  if (type === "KEYWORD") {
    updateData.keywordScrapesUsed = { increment: 1 };
    updateData.keywordDailyCount = { increment: 1 };
  } else {
    updateData.scrapesUsed = { increment: 1 };
    updateData.dailyCount = { increment: 1 };
  }

  const updated = await db.usage.update({
    where: { userId },
    data: updateData,
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
      dailyUsed:
        type === "KEYWORD" ? updated.keywordDailyCount : updated.dailyCount,
      dailyLimit,
      monthlyUsed:
        type === "KEYWORD" ? updated.keywordScrapesUsed : updated.scrapesUsed,
      monthlyLimit,
    },
  };
}
