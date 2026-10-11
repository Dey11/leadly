import type { Prisma, Subscription } from "@prisma/client";

type AccessSubscription = Pick<
  Subscription,
  "tier" | "status" | "currentPeriodEnd" | "cancelledAtPeriodEnd"
>;

/** Stored billing tier is retained for recovery; only current access grants features. */
export function effectiveSubscriptionTier(
  subscription: AccessSubscription | null | undefined,
  now = new Date(),
) {
  if (!subscription || subscription.tier === "FREE") return "FREE";
  const hasAccess =
    subscription.status === "ACTIVE" ||
    (subscription.status === "CANCELLED" && subscription.cancelledAtPeriodEnd);
  return hasAccess && subscription.currentPeriodEnd > now
    ? subscription.tier
    : "FREE";
}

export function paidSubscriptionWhere(
  now: Date,
): Prisma.SubscriptionWhereInput {
  return {
    tier: { in: ["PRO", "PREMIUM"] },
    currentPeriodEnd: { gt: now },
    OR: [
      { status: "ACTIVE" },
      { status: "CANCELLED", cancelledAtPeriodEnd: true },
    ],
  };
}
