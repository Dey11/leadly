import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { PrismaClient } from "@prisma/client";
import type * as Identity from "../src/services/monitor-identity";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.pathname !== "/leadly_monitor_test") {
  throw new Error(
    "Monitor integration tests require local leadly_monitor_test",
  );
}

let db: PrismaClient;
let identity: typeof Identity;
let userId: string;
let icpId: string;

beforeAll(async () => {
  ({ default: db } = await import("../src/lib/db"));
  identity = await import("../src/services/monitor-identity");
  const user = await db.user.create({
    data: {
      email: `monitor-${crypto.randomUUID()}@example.invalid`,
      passwordHash: "unused",
      name: "Monitor regression fixture",
    },
  });
  userId = user.id;
  const icp = await db.icp.create({
    data: {
      userId,
      name: "Test ICP",
      summary: "Test",
      targetPersona: "Test",
      pains: "Test",
      valueProposition: "Test",
      qualifyingSignals: "Test",
      disqualifyingSignals: "Test",
      platform: "REDDIT",
    },
  });
  icpId = icp.id;
});

afterAll(async () => {
  if (userId) await db.user.delete({ where: { id: userId } });
  await db.$disconnect();
});

function data(target: string) {
  return {
    icpId,
    userId,
    platform: "REDDIT" as const,
    targetType: "SUBREDDIT" as const,
    target,
  };
}

describe("monitor persistence with PostgreSQL advisory locks", () => {
  test("creates a monitor and rejects a case-insensitive duplicate", async () => {
    const monitor = await identity.createMonitorWithIdentityGuard(
      data("r/smallbusiness"),
    );
    expect(monitor.target).toBe("r/smallbusiness");
    await expect(
      identity.createMonitorWithIdentityGuard(data("R/SmallBusiness")),
    ).rejects.toBeInstanceOf(identity.DuplicateMonitorError);
  });

  test("concurrent creates persist exactly one monitor", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 4 }, () =>
        identity.createMonitorWithIdentityGuard(data("r/concurrent")),
      ),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    for (const result of results) {
      if (result.status === "rejected")
        expect(result.reason).toBeInstanceOf(identity.DuplicateMonitorError);
    }
    expect(
      await db.monitor.count({ where: { icpId, target: "r/concurrent" } }),
    ).toBe(1);
  });

  test("updates a target while retaining duplicate protection", async () => {
    const monitor = await identity.createMonitorWithIdentityGuard(
      data("r/original"),
    );
    const updated = await identity.updateMonitorWithIdentityGuard({
      id: monitor.id,
      identity: data("r/updated"),
      data: { target: "r/updated" },
    });
    expect(updated.target).toBe("r/updated");
    await expect(
      identity.updateMonitorWithIdentityGuard({
        id: monitor.id,
        identity: data("r/smallbusiness"),
        data: { target: "r/smallbusiness" },
      }),
    ).rejects.toBeInstanceOf(identity.DuplicateMonitorError);
    expect(
      (await db.monitor.findUniqueOrThrow({ where: { id: monitor.id } }))
        .target,
    ).toBe("r/updated");
  });

  test("new notification channels default to warm and neutral only", async () => {
    const channel = await db.notificationChannel.create({
      data: { userId, destination: "unused" },
    });
    expect(channel.notifyLeadTypes).toEqual(["WARM", "NEUTRAL"]);
  });
});
