import { describe, expect, test } from "bun:test";
import { effectiveSubscriptionTier } from "./subscription-access";

const now = new Date("2026-10-11T12:00:00Z");
const future = new Date("2026-11-11T12:00:00Z");

describe("subscription access", () => {
  test("preserves active paid grants without requiring a provider subscription ID", () => {
    expect(
      effectiveSubscriptionTier(
        {
          tier: "PREMIUM",
          status: "ACTIVE",
          currentPeriodEnd: future,
          cancelledAtPeriodEnd: false,
        },
        now,
      ),
    ).toBe("PREMIUM");
  });
  test("revokes paid features for inactive states and at exact expiry", () => {
    for (const status of [
      "ON_HOLD",
      "FAILED",
      "EXPIRED",
      "PENDING",
      "CANCELLED",
    ] as const) {
      expect(
        effectiveSubscriptionTier(
          {
            tier: "PREMIUM",
            status,
            currentPeriodEnd: future,
            cancelledAtPeriodEnd: false,
          },
          now,
        ),
      ).toBe("FREE");
    }
    expect(
      effectiveSubscriptionTier(
        {
          tier: "PRO",
          status: "ACTIVE",
          currentPeriodEnd: now,
          cancelledAtPeriodEnd: false,
        },
        now,
      ),
    ).toBe("FREE");
  });
  test("honors paid time during scheduled cancellation", () => {
    expect(
      effectiveSubscriptionTier(
        {
          tier: "PRO",
          status: "CANCELLED",
          currentPeriodEnd: future,
          cancelledAtPeriodEnd: true,
        },
        now,
      ),
    ).toBe("PRO");
    expect(effectiveSubscriptionTier(null, now)).toBe("FREE");
  });
});
