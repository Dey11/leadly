import { describe, expect, test } from "bun:test";
import { resolveUsagePeriodRollover } from "./usage-period";

describe("resolveUsagePeriodRollover", () => {
  test("repairs an expired paid usage window when billing has renewed", () => {
    const rollover = resolveUsagePeriodRollover({
      tier: "PRO",
      usagePeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-09-01T00:00:00.000Z"),
      now: new Date("2026-08-04T00:00:00.000Z"),
    });

    expect(rollover).toEqual({
      periodStart: new Date("2026-08-04T00:00:00.000Z"),
      periodEnd: new Date("2026-09-01T00:00:00.000Z"),
    });
  });

  test("does not grant paid quota when the subscription period is stale", () => {
    const rollover = resolveUsagePeriodRollover({
      tier: "PRO",
      usagePeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
      now: new Date("2026-08-04T00:00:00.000Z"),
    });

    expect(rollover).toBeNull();
  });

  test("rolls free usage into the current UTC calendar month", () => {
    const rollover = resolveUsagePeriodRollover({
      tier: "FREE",
      usagePeriodEnd: new Date("2026-02-28T23:59:59.999Z"),
      currentPeriodEnd: null,
      now: new Date("2026-08-04T00:00:00.000Z"),
    });

    expect(rollover).toEqual({
      periodStart: new Date("2026-08-01T00:00:00.000Z"),
      periodEnd: new Date("2026-08-31T23:59:59.999Z"),
    });
  });
});
