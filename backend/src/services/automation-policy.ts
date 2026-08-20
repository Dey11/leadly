import type { SubscriptionTier } from "@prisma/client";

export const FREE_TIER_INACTIVITY_DAYS = 3;
export const FREE_TIER_INACTIVITY_MS =
  FREE_TIER_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

export type AutomationPolicyInput = {
  tier: SubscriptionTier | null;
  lastActiveAt: Date;
  freeAutomationPausedAt: Date | null;
};

export type AutomationPolicyDecision = {
  enabled: boolean;
  pausedForInactivity: boolean;
  transition: "pause" | "clear-paid-pause" | null;
};

export type AutomationState = {
  enabled: boolean;
  pausedForInactivity: boolean;
  inactivityThresholdDays: number;
};

/**
 * Resolves effective automation eligibility without performing persistence.
 * Free-tier pauses remain sticky until the user explicitly re-enables them.
 */
export function resolveAutomationPolicy(
  account: AutomationPolicyInput,
  now = new Date(),
): AutomationPolicyDecision {
  if (account.tier === null) {
    return {
      enabled: false,
      pausedForInactivity: false,
      transition: null,
    };
  }

  if (account.tier !== "FREE") {
    return {
      enabled: true,
      pausedForInactivity: false,
      transition: account.freeAutomationPausedAt ? "clear-paid-pause" : null,
    };
  }

  if (account.freeAutomationPausedAt) {
    return {
      enabled: false,
      pausedForInactivity: true,
      transition: null,
    };
  }

  if (
    now.getTime() - account.lastActiveAt.getTime() >=
    FREE_TIER_INACTIVITY_MS
  ) {
    return {
      enabled: false,
      pausedForInactivity: true,
      transition: "pause",
    };
  }

  return {
    enabled: true,
    pausedForInactivity: false,
    transition: null,
  };
}

export function toAutomationState(
  decision: AutomationPolicyDecision,
): AutomationState {
  return {
    enabled: decision.enabled,
    pausedForInactivity: decision.pausedForInactivity,
    inactivityThresholdDays: FREE_TIER_INACTIVITY_DAYS,
  };
}
