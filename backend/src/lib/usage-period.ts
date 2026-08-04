export type UsageTier = "FREE" | "PRO" | "PREMIUM";

type UsagePeriodRolloverInput = {
  tier: UsageTier;
  usagePeriodEnd: Date;
  currentPeriodEnd?: Date | null;
  now?: Date;
};

type UsagePeriod = {
  periodStart: Date;
  periodEnd: Date;
};

function freeCalendarMonth(now: Date): UsagePeriod {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return {
    periodStart: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    periodEnd: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)),
  };
}

/**
 * Resolve a replacement usage window after the stored window expires.
 *
 * Paid renewals normally reset usage from the billing webhook. This fallback
 * repairs accounts where the subscription period advanced but that reset was
 * missed (for example after an interrupted webhook). It deliberately refuses
 * to grant paid quota when the subscription period itself is stale.
 */
export function resolveUsagePeriodRollover({
  tier,
  usagePeriodEnd,
  currentPeriodEnd,
  now = new Date(),
}: UsagePeriodRolloverInput): UsagePeriod | null {
  if (now <= usagePeriodEnd) {
    return null;
  }

  if (tier === "FREE") {
    return freeCalendarMonth(now);
  }

  if (!currentPeriodEnd || currentPeriodEnd <= now) {
    return null;
  }

  return {
    periodStart: now,
    periodEnd: currentPeriodEnd,
  };
}
