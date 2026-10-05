import { describe, expect, test } from "bun:test";
import {
  resolveInitialUsagePeriod,
  resolveUsagePeriodRollover,
} from "./usage-period";

const accessEnd = new Date("2027-01-21T15:58:09.997Z");
const now = new Date("2026-10-05T07:00:00.000Z");
const octoberStart = new Date("2026-10-01T00:00:00.000Z");
const novemberStart = new Date("2026-11-01T00:00:00.000Z");

describe("resolveInitialUsagePeriod", () => {
  test("preserves ordinary monthly billing, including end-of-month anniversaries", () => {
    for (const [start, end] of [
      ["2026-09-21T15:58:09.997Z", "2026-10-21T15:58:09.997Z"],
      ["2028-01-31T12:00:00.000Z", "2028-02-29T12:00:00.000Z"],
      ["2027-01-31T12:00:00.000Z", "2027-02-28T12:00:00.000Z"],
      ["2027-02-28T12:00:00.000Z", "2027-03-31T12:00:00.000Z"],
    ]) {
      const periodStart = new Date(start);
      const periodEnd = new Date(end);
      expect(
        resolveInitialUsagePeriod({ tier: "PRO", periodStart, periodEnd, now }),
      ).toEqual({ periodStart, periodEnd });
    }
  });

  test("initializes annual billing into the current month", () => {
    expect(
      resolveInitialUsagePeriod({
        tier: "PREMIUM",
        periodStart: new Date("2026-01-21T15:58:09.997Z"),
        periodEnd: accessEnd,
        now,
      }),
    ).toEqual({ periodStart: octoberStart, periodEnd: novemberStart });
  });

  test("does not put a missing paid usage row in the future", () => {
    expect(
      resolveInitialUsagePeriod({ tier: "PREMIUM", periodEnd: accessEnd, now }),
    ).toEqual({ periodStart: now, periodEnd: novemberStart });
  });

  test("defaults paid usage to a calendar month with a clamped month-end", () => {
    expect(
      resolveInitialUsagePeriod({
        tier: "PRO",
        now: new Date("2027-01-31T12:00:00.000Z"),
      }),
    ).toEqual({
      periodStart: new Date("2027-01-31T12:00:00.000Z"),
      periodEnd: new Date("2027-02-28T12:00:00.000Z"),
    });
  });
});

describe("resolveUsagePeriodRollover", () => {
  test("repairs the exhausted August-to-January Premium window", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart: new Date("2026-08-04T06:00:00.307Z"),
        usagePeriodEnd: accessEnd,
        currentPeriodEnd: accessEnd,
        now,
      }),
    ).toEqual({
      periodStart: octoberStart,
      periodEnd: novemberStart,
      resetUsage: true,
    });
  });

  test("shortens a current-month long window without forgiving used credits", () => {
    const usagePeriodStart = new Date("2026-10-04T06:00:00.307Z");
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart,
        usagePeriodEnd: accessEnd,
        currentPeriodEnd: accessEnd,
        now,
      }),
    ).toEqual({
      periodStart: usagePeriodStart,
      periodEnd: novemberStart,
      resetUsage: false,
    });
  });

  test("repairs a legacy paid window accidentally initialized in the future", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart: new Date("2026-12-22T15:58:09.997Z"),
        usagePeriodEnd: accessEnd,
        currentPeriodEnd: accessEnd,
        now,
      }),
    ).toEqual({ periodStart: now, periodEnd: novemberStart, resetUsage: true });
  });

  test("does not reset a repaired month again", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart: octoberStart,
        usagePeriodEnd: novemberStart,
        currentPeriodEnd: accessEnd,
        now,
      }),
    ).toBeNull();
  });

  test("rolls extended access at the exact paid month boundary", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart: octoberStart,
        usagePeriodEnd: novemberStart,
        currentPeriodEnd: accessEnd,
        now: novemberStart,
      }),
    ).toEqual({
      periodStart: novemberStart,
      periodEnd: new Date("2026-12-01T00:00:00.000Z"),
      resetUsage: true,
    });
  });

  test("caps the final allowance at paid access expiry", () => {
    const januaryStart = new Date("2027-01-01T00:00:00.000Z");
    expect(
      resolveUsagePeriodRollover({
        tier: "PREMIUM",
        usagePeriodStart: new Date("2026-12-01T00:00:00.000Z"),
        usagePeriodEnd: januaryStart,
        currentPeriodEnd: accessEnd,
        now: januaryStart,
      }),
    ).toEqual({
      periodStart: januaryStart,
      periodEnd: accessEnd,
      resetUsage: true,
    });
  });

  test("repairs a missed paid renewal reset", () => {
    const renewalEnd = new Date("2026-09-01T00:00:00.000Z");
    const renewalNow = new Date("2026-08-04T00:00:00.000Z");
    expect(
      resolveUsagePeriodRollover({
        tier: "PRO",
        usagePeriodStart: new Date("2026-02-01T00:00:00.000Z"),
        usagePeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
        currentPeriodEnd: renewalEnd,
        now: renewalNow,
      }),
    ).toEqual({
      periodStart: renewalNow,
      periodEnd: renewalEnd,
      resetUsage: true,
    });
  });

  test.each([null, new Date("2026-03-01T00:00:00.000Z"), now])(
    "does not grant fresh paid quota without current access: %s",
    (currentPeriodEnd) => {
      expect(
        resolveUsagePeriodRollover({
          tier: "PRO",
          usagePeriodStart: new Date("2026-02-01T00:00:00.000Z"),
          usagePeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
          currentPeriodEnd,
          now,
        }),
      ).toBeNull();
    },
  );

  test("shortens access expiry without resetting consumed quota", () => {
    const currentPeriodEnd = new Date("2026-10-21T00:00:00.000Z");
    expect(
      resolveUsagePeriodRollover({
        tier: "PRO",
        usagePeriodStart: octoberStart,
        usagePeriodEnd: novemberStart,
        currentPeriodEnd,
        now,
      }),
    ).toEqual({
      periodStart: octoberStart,
      periodEnd: currentPeriodEnd,
      resetUsage: false,
    });
  });

  test("preserves an ordinary unexpired paid month", () => {
    const usagePeriodEnd = new Date("2026-10-21T15:58:09.997Z");
    expect(
      resolveUsagePeriodRollover({
        tier: "PRO",
        usagePeriodStart: new Date("2026-09-21T15:58:09.997Z"),
        usagePeriodEnd,
        currentPeriodEnd: usagePeriodEnd,
        now,
      }),
    ).toBeNull();
  });

  test("rolls Free usage into its UTC calendar month", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "FREE",
        usagePeriodStart: new Date("2026-02-01T00:00:00.000Z"),
        usagePeriodEnd: new Date("2026-02-28T23:59:59.999Z"),
        now,
      }),
    ).toEqual({
      periodStart: octoberStart,
      periodEnd: new Date("2026-10-31T23:59:59.999Z"),
      resetUsage: true,
    });
  });

  test("does not reset Free usage before its inclusive month end", () => {
    expect(
      resolveUsagePeriodRollover({
        tier: "FREE",
        usagePeriodStart: octoberStart,
        usagePeriodEnd: new Date("2026-10-31T23:59:59.999Z"),
        now,
      }),
    ).toBeNull();
  });
});
