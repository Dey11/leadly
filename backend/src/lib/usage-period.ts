export type UsageTier = "FREE" | "PRO" | "PREMIUM";

type UsagePeriodRolloverInput = {
  tier: UsageTier;
  usagePeriodStart: Date;
  usagePeriodEnd: Date;
  currentPeriodEnd?: Date | null;
  now?: Date;
};

type UsagePeriod = {
  periodStart: Date;
  periodEnd: Date;
};

type UsagePeriodInput = {
  tier: UsageTier;
  periodStart?: Date;
  periodEnd?: Date | null;
  now?: Date;
};

function nextUtcMonth(start: Date): Date {
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 2, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth() + 1,
      Math.min(start.getUTCDate(), lastDay),
      start.getUTCHours(),
      start.getUTCMinutes(),
      start.getUTCSeconds(),
      start.getUTCMilliseconds(),
    ),
  );
}

function freeCalendarMonth(now: Date): UsagePeriod {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return {
    periodStart: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    periodEnd: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)),
  };
}

/**
 * Preserve ordinary monthly billing windows. Longer paid access uses UTC
 * calendar-month allowances capped by the access expiry, without changing
 * the subscription itself.
 */
export function resolveInitialUsagePeriod({
  tier,
  periodStart,
  periodEnd,
  now = new Date(),
}: UsagePeriodInput): UsagePeriod {
  if (tier === "FREE") return freeCalendarMonth(now);

  const start = periodStart ?? now;
  const end = periodEnd ?? nextUtcMonth(start);
  // Billing anniversaries can move from February 28 back to March 31.
  if (end.getTime() - start.getTime() <= 31 * 24 * 60 * 60 * 1000) {
    return { periodStart: start, periodEnd: end };
  }

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return {
    periodStart: new Date(Math.max(start.getTime(), monthStart.getTime())),
    periodEnd: new Date(Math.min(end.getTime(), monthEnd.getTime())),
  };
}

/** Reconcile legacy multi-month windows and renew expired allowances. */
export function resolveUsagePeriodRollover({
  tier,
  usagePeriodStart,
  usagePeriodEnd,
  currentPeriodEnd,
  now = new Date(),
}: UsagePeriodRolloverInput): (UsagePeriod & { resetUsage: boolean }) | null {
  if (tier === "FREE") {
    return now > usagePeriodEnd
      ? { ...freeCalendarMonth(now), resetUsage: true }
      : null;
  }

  if (!currentPeriodEnd || currentPeriodEnd <= now) return null;

  if (usagePeriodStart > now) {
    return {
      ...resolveInitialUsagePeriod({ tier, periodEnd: currentPeriodEnd, now }),
      resetUsage: true,
    };
  }

  const normalized = resolveInitialUsagePeriod({
    tier,
    periodStart: usagePeriodStart,
    periodEnd: new Date(
      Math.min(usagePeriodEnd.getTime(), currentPeriodEnd.getTime()),
    ),
    now,
  });

  if (now >= normalized.periodEnd) {
    return {
      ...resolveInitialUsagePeriod({ tier, periodEnd: currentPeriodEnd, now }),
      resetUsage: true,
    };
  }

  if (
    normalized.periodStart.getTime() === usagePeriodStart.getTime() &&
    normalized.periodEnd.getTime() === usagePeriodEnd.getTime()
  ) {
    return null;
  }

  return {
    ...normalized,
    resetUsage: normalized.periodStart > usagePeriodStart,
  };
}
