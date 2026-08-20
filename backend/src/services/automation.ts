import db from "../lib/db";
import logger from "../lib/logger";
import type { Prisma } from "@prisma/client";
import {
  FREE_TIER_INACTIVITY_DAYS,
  FREE_TIER_INACTIVITY_MS,
  resolveAutomationPolicy,
  toAutomationState,
  type AutomationPolicyInput,
  type AutomationState,
} from "./automation-policy";

const ACTIVITY_WRITE_INTERVAL_MS = 60 * 60 * 1000;
export const INACTIVITY_CANCELLATION_MESSAGE =
  "Cancelled because free-tier automation paused after 3 days of inactivity.";

type StoredAutomationAccount = AutomationPolicyInput & {
  id: string;
};

/**
 * Database predicate for writes that must only commit while account automation
 * is eligible. Keeping this predicate at the write boundary closes races with
 * the inactivity pause transaction.
 */
export function automationEligibleUserWhere(
  now = new Date(),
): Prisma.UserWhereInput {
  const inactivityCutoff = new Date(now.getTime() - FREE_TIER_INACTIVITY_MS);

  return {
    OR: [
      {
        subscription: {
          is: { tier: { in: ["PRO", "PREMIUM"] } },
        },
      },
      {
        subscription: { is: { tier: "FREE" } },
        freeAutomationPausedAt: null,
        lastActiveAt: { gt: inactivityCutoff },
      },
    ],
  };
}

async function loadAutomationAccount(
  userId: string,
): Promise<StoredAutomationAccount | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lastActiveAt: true,
      freeAutomationPausedAt: true,
      subscription: {
        select: { tier: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    tier: user.subscription?.tier ?? null,
    lastActiveAt: user.lastActiveAt,
    freeAutomationPausedAt: user.freeAutomationPausedAt,
  };
}

async function pauseInactiveFreeAccount(
  account: StoredAutomationAccount,
  now: Date,
): Promise<boolean> {
  const inactivityCutoff = new Date(now.getTime() - FREE_TIER_INACTIVITY_MS);

  return db.$transaction(async (tx) => {
    const pauseResult = await tx.user.updateMany({
      where: {
        id: account.id,
        lastActiveAt: { lte: inactivityCutoff },
        freeAutomationPausedAt: null,
        subscription: { is: { tier: "FREE" } },
      },
      data: { freeAutomationPausedAt: now },
    });

    if (pauseResult.count === 0) return false;

    const [leadJobs, keywordJobs] = await Promise.all([
      tx.scrapeJob.updateMany({
        where: {
          OR: [
            { status: { in: ["PENDING", "RUNNING"] } },
            { status: "FAILED", nextRetryAt: { not: null } },
          ],
          monitor: { userId: account.id },
        },
        data: {
          status: "CANCELLED",
          errorMessage: INACTIVITY_CANCELLATION_MESSAGE,
          nextRetryAt: null,
        },
      }),
      tx.keywordScrapeJob.updateMany({
        where: {
          OR: [
            { status: { in: ["PENDING", "RUNNING"] } },
            { status: "FAILED", nextRetryAt: { not: null } },
          ],
          keywordMonitor: { userId: account.id },
        },
        data: {
          status: "CANCELLED",
          errorMessage: INACTIVITY_CANCELLATION_MESSAGE,
          nextRetryAt: null,
        },
      }),
    ]);

    logger.info(
      JSON.stringify({
        evt: "automation.free_tier_paused",
        userId: account.id,
        cancelledLeadJobs: leadJobs.count,
        cancelledKeywordJobs: keywordJobs.count,
      }),
    );

    return true;
  });
}

async function enforceAutomationPolicy(
  account: StoredAutomationAccount,
  now: Date,
): Promise<AutomationState> {
  const decision = resolveAutomationPolicy(account, now);

  if (decision.transition === "clear-paid-pause") {
    await db.user.update({
      where: { id: account.id },
      data: { freeAutomationPausedAt: null },
    });
    return toAutomationState({ ...decision, transition: null });
  }

  if (decision.transition === "pause") {
    const paused = await pauseInactiveFreeAccount(account, now);
    if (!paused) {
      const refreshedAccount = await loadAutomationAccount(account.id);
      if (!refreshedAccount) return toAutomationState(decision);
      return toAutomationState(resolveAutomationPolicy(refreshedAccount, now));
    }
  }

  return toAutomationState(decision);
}

/**
 * Applies the inactivity policy and returns the effective state used by
 * schedulers, recovery paths, processors, and account presentation.
 */
export async function getAutomationStateForUser(
  userId: string,
  now = new Date(),
): Promise<AutomationState | null> {
  const account = await loadAutomationAccount(userId);
  if (!account) return null;
  return enforceAutomationPolicy(account, now);
}

/**
 * Records authenticated product activity at most once per hour. Policy
 * enforcement happens first so returning after three days still requires the
 * explicit re-enable action.
 */
export async function recordAuthenticatedActivity(
  userId: string,
  now = new Date(),
): Promise<AutomationState | null> {
  const writeCutoff = new Date(now.getTime() - ACTIVITY_WRITE_INTERVAL_MS);
  const inactivityCutoff = new Date(now.getTime() - FREE_TIER_INACTIVITY_MS);

  // Claim recent free activity (or any paid activity) before evaluating the
  // pause. A concurrent scheduler must then re-check the refreshed timestamp.
  await db.user.updateMany({
    where: {
      id: userId,
      lastActiveAt: { lte: writeCutoff },
      OR: [
        {
          subscription: {
            is: { tier: { in: ["PRO", "PREMIUM"] } },
          },
        },
        {
          subscription: { is: { tier: "FREE" } },
          freeAutomationPausedAt: null,
          lastActiveAt: { gt: inactivityCutoff },
        },
      ],
    },
    data: { lastActiveAt: now },
  });

  const state = await getAutomationStateForUser(userId, now);

  // A returning user who was already inactive remains paused, but their visit
  // is still recorded for account history and the subsequent re-enable cycle.
  if (state?.pausedForInactivity) {
    await db.user.updateMany({
      where: {
        id: userId,
        lastActiveAt: { lte: writeCutoff },
      },
      data: { lastActiveAt: now },
    });
  }

  return state;
}

/** Re-enables future automation without modifying saved monitors or schedules. */
export async function enableAutomationForUser(
  userId: string,
  now = new Date(),
): Promise<AutomationState | null> {
  const account = await loadAutomationAccount(userId);
  if (!account) return null;

  await db.user.update({
    where: { id: userId },
    data: {
      lastActiveAt: now,
      freeAutomationPausedAt: null,
    },
  });

  logger.info(
    JSON.stringify({
      evt: "automation.reenabled",
      userId,
      tier: account.tier,
    }),
  );

  return {
    enabled: account.tier !== null,
    pausedForInactivity: false,
    inactivityThresholdDays: FREE_TIER_INACTIVITY_DAYS,
  };
}
