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
          administrativeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: true,
      pausedForInactivity: false,
      pauseReason: null,
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
          administrativeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: true,
      pauseReason: "FREE_TIER_INACTIVITY",
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
          administrativeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: true,
      pauseReason: "FREE_TIER_INACTIVITY",
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
        administrativeAutomationPausedAt: null,
      },
      new Date(reenabledAt.getTime() + FREE_TIER_INACTIVITY_MS),
    );

    expect(decision).toEqual({
      enabled: false,
      pausedForInactivity: true,
      pauseReason: "FREE_TIER_INACTIVITY",
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
          administrativeAutomationPausedAt: null,
        },
        now,
      ),
    ).toEqual({
      enabled: true,
      pausedForInactivity: false,
      pauseReason: null,
      transition: "clear-paid-pause",
    });
  });

  test("keeps a paid account disabled while an administrative pause is active", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "PREMIUM",
          lastActiveAt: now,
          freeAutomationPausedAt: null,
          administrativeAutomationPausedAt: new Date(
            "2026-08-21T06:48:44.209Z",
          ),
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: false,
      pauseReason: "ADMINISTRATIVE",
      transition: null,
    });
  });

  test("administrative pause takes precedence over an existing inactivity pause", () => {
    expect(
      resolveAutomationPolicy(
        {
          tier: "FREE",
          lastActiveAt: now,
          freeAutomationPausedAt: new Date("2026-08-21T06:48:44.209Z"),
          administrativeAutomationPausedAt: new Date(
            "2026-08-21T07:00:00.000Z",
          ),
        },
        now,
      ),
    ).toEqual({
      enabled: false,
      pausedForInactivity: false,
      pauseReason: "ADMINISTRATIVE",
      transition: null,
    });
  });
});
