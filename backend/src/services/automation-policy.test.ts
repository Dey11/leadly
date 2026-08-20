import { describe, expect, test } from "bun:test";
import {
  FREE_TIER_INACTIVITY_MS,
  resolveAutomationPolicy,
} from "./automation-policy";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("free-tier automation policy", () => {
  test("keeps a recently active free account enabled", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "FREE",
          lastActiveAt: new Date(now.getTime() - FREE_TIER_INACTIVITY_MS + 1),
          freeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: true,
      pausedForInactivity: false,
      transition: null,
    });
  });

  test("pauses a free account at the three-day inactivity boundary", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "FREE",
          lastActiveAt: new Date(now.getTime() - FREE_TIER_INACTIVITY_MS),
          freeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: true,
      transition: "pause",
    });
  });

  test("requires an explicit re-enable after an inactive free user returns", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "FREE",
          lastActiveAt: now,
          freeAutomationPausedAt: new Date("2026-08-19T12:00:00.000Z"),
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: true,
      transition: null,
    });
  });

  test("pauses again three days after an explicit re-enable", () => {
    const reenabledAt = now;
    const decision = resolveAutomationPolicy(
      {
        tier: "FREE",
        lastActiveAt: reenabledAt,
        freeAutomationPausedAt: null,
      },
      new Date(reenabledAt.getTime() + FREE_TIER_INACTIVITY_MS),
    );

    expect(decision).toEqual({
      enabled: false,
      pausedForInactivity: true,
      transition: "pause",
    });
  });

  test("never pauses a paid account and clears stale free-tier pause state", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "PRO",
          lastActiveAt: new Date("2026-01-01T00:00:00.000Z"),
          freeAutomationPausedAt: new Date("2026-08-19T12:00:00.000Z"),
        },
        now,
      ),
    ).toEqual({
      enabled: true,
      pausedForInactivity: false,
      transition: "clear-paid-pause",
    });
  });
});
