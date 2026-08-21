import type { SubscriptionTier } from "@prisma/client";

export const FREE_TIER_INACTIVITY_DAYS = 3;
export const FREE_TIER_INACTIVITY_MS =
  FREE_TIER_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

export type AutomationPolicyInput = {
  tier: SubscriptionTier | null;
  lastActiveAt: Date;
  freeAutomationPausedAt: Date | null;
  administrativeAutomationPausedAt: Date | null;
};

export type AutomationPauseReason = "ADMINISTRATIVE" | "FREE_TIER_INACTIVITY";

export type AutomationPolicyDecision = {
  enabled: boolean;
  pausedForInactivity: boolean;
  pauseReason: AutomationPauseReason | null;
  transition: "pause" | "clear-paid-pause" | null;
};

export type AutomationState = {
  enabled: boolean;
  pausedForInactivity: boolean;
  pauseReason: AutomationPauseReason | null;
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
  if (account.administrativeAutomationPausedAt) {
    return {
      enabled: false,
      pausedForInactivity: false,
      pauseReason: "ADMINISTRATIVE",
      transition: null,
    };
  }

  if (account.tier === null) {
    return {
      enabled: false,
      pausedForInactivity: false,
      pauseReason: null,
      transition: null,
    };
  }

  if (account.tier !== "FREE") {
    return {
      enabled: true,
      pausedForInactivity: false,
      pauseReason: null,
      transition: account.freeAutomationPausedAt ? "clear-paid-pause" : null,
    };
  }

  if (account.freeAutomationPausedAt) {
    return {
      enabled: false,
      pausedForInactivity: true,
      pauseReason: "FREE_TIER_INACTIVITY",
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
      pauseReason: "FREE_TIER_INACTIVITY",
      transition: "pause",
    };
  }

  return {
    enabled: true,
    pausedForInactivity: false,
    pauseReason: null,
    transition: null,
  };
}

export function toAutomationState(
  decision: AutomationPolicyDecision,
): AutomationState {
  return {
    enabled: decision.enabled,
    pausedForInactivity: decision.pausedForInactivity,
    pauseReason: decision.pauseReason,
    inactivityThresholdDays: FREE_TIER_INACTIVITY_DAYS,
  };
}
