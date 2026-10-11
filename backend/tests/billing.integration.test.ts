import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { createHmac } from "node:crypto";
import type { Server } from "node:http";
import type { PrismaClient } from "@prisma/client";
import DodoPayments from "dodopayments";
import express from "express";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (
  databaseUrl.hostname !== "127.0.0.1" ||
  databaseUrl.pathname !== "/leadly_billing_test"
) {
  throw new Error(
    "Billing integration tests require local leadly_billing_test",
  );
}
const key = Buffer.from("local-integration-signing-key");
const client = new DodoPayments({
  bearerToken: "unused-local-key",
  environment: "test_mode",
  webhookKey: "whsec_" + key.toString("base64"),
});
mock.module("../src/env", () => ({
  env: {
    DODO_PRO_PRODUCT_ID: "test-pro",
    DODO_PREMIUM_PRODUCT_ID: "test-premium",
  },
}));
mock.module("../src/lib/dodo", () => ({
  default: { webhooks: client.webhooks },
}));
mock.module("../src/lib/logger", () => ({
  default: { info() {}, warn() {}, error() {} },
}));
const noop = async () => undefined;
mock.module("../src/lib/email", () => ({
  sendSubscriptionActiveEmail: noop,
  sendSubscriptionCancelledEmail: noop,
  sendSubscriptionExpiredEmail: noop,
  sendSubscriptionFailedEmail: noop,
  sendSubscriptionOnHoldEmail: noop,
  sendSubscriptionPlanChangedEmail: noop,
  sendSubscriptionRenewedEmail: noop,
}));
mock.module("../src/lib/discord", () => ({ sendTransactionToDiscord: noop }));

let db: PrismaClient;
let server: Server;
let origin: string;
const userIds: string[] = [];
const webhookIds: string[] = [];
const now = new Date();
const periodStart = new Date(now.getTime() - 86400000);
const periodEnd = new Date(now.getTime() + 25 * 86400000);

beforeAll(async () => {
  ({ default: db } = await import("../src/lib/db"));
  const { newDodoWebhookHandler } =
    await import("../src/controllers/webhooks-new");
  const app = express();
  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    newDodoWebhookHandler,
  );
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing local server port");
  origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  server?.closeAllConnections();
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) =>
        error && !("code" in error && error.code === "ERR_SERVER_NOT_RUNNING")
          ? reject(error)
          : resolve(),
      ),
    );
  await db.webhookEvent.deleteMany({
    where: { webhookId: { in: webhookIds } },
  });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

async function fixture(id = crypto.randomUUID()) {
  const user = await db.user.create({
    data: {
      id,
      name: "Billing fixture",
      email: `${id}@example.invalid`,
      passwordHash: "unused",
    },
  });
  userIds.push(user.id);
  await db.subscription.create({
    data: {
      userId: user.id,
      status: "ACTIVE",
      tier: "FREE",
      currentPeriodEnd: periodEnd,
    },
  });
  await db.usage.create({
    data: {
      userId: user.id,
      periodStart,
      periodEnd,
      scrapesUsed: 10,
      keywordScrapesUsed: 10,
      dailyCount: 2,
      keywordDailyCount: 2,
      dailyDate: now,
    },
  });
  return user.id;
}

function event(
  userId: string,
  type = "subscription.active",
  status = "active",
  timestamp = now.toISOString(),
) {
  return {
    type,
    timestamp,
    data: {
      subscription_id: `sub-${userId}`,
      payload_type: "Subscription",
      metadata: { user_id: userId },
      product_id: "test-premium",
      status,
      previous_billing_date: periodStart.toISOString(),
      next_billing_date: periodEnd.toISOString(),
      expires_at: periodEnd.toISOString(),
      cancel_at_next_billing_date: false,
      currency: "USD",
      customer: {
        customer_id: `customer-${userId}`,
        email: `${userId}@example.invalid`,
        name: "Billing fixture",
      },
      billing: {},
    },
  };
}

async function deliver(
  payload: ReturnType<typeof event>,
  webhookId = crypto.randomUUID(),
  invalidSignature = false,
) {
  webhookIds.push(webhookId);
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", key)
    .update(`${webhookId}.${timestamp}.${body}`)
    .digest("base64");
  return fetch(`${origin}/webhook`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "webhook-id": webhookId,
      "webhook-timestamp": timestamp,
      "webhook-signature": `v1,${invalidSignature ? "invalid" : signature}`,
    },
  });
}

describe("durable billing delivery", () => {
  test("historical failed delivery can be replayed without deleting its record", async () => {
    const userId = await fixture();
    const payload = event(userId);
    const webhookId = crypto.randomUUID();
    await db.webhookEvent.create({
      data: {
        webhookId,
        customerId: `customer-${userId}`,
        eventData: JSON.stringify(payload.data),
        status: "FAILED",
        lastError: "Historical failure",
      },
    });
    expect((await deliver(payload, webhookId)).status).toBe(200);
    expect(await db.webhookEvent.count({ where: { webhookId } })).toBe(1);
    expect(
      await db.webhookEvent.findFirstOrThrow({ where: { webhookId } }),
    ).toMatchObject({ status: "COMPLETED", lastError: null, retryCount: 1 });
  });
  test("concurrent duplicate activation commits one event and one reset", async () => {
    const userId = await fixture();
    const payload = event(userId);
    const webhookId = crypto.randomUUID();
    const responses = await Promise.all([
      deliver(payload, webhookId),
      deliver(payload, webhookId),
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(await db.webhookEvent.count({ where: { webhookId } })).toBe(1);
    expect(
      (await db.subscription.findUniqueOrThrow({ where: { userId } })).tier,
    ).toBe("PREMIUM");
    expect(
      (await db.usage.findUniqueOrThrow({ where: { userId } })).scrapesUsed,
    ).toBe(0);
    await db.usage.update({ where: { userId }, data: { scrapesUsed: 7 } });
    expect((await deliver(payload, webhookId)).status).toBe(200);
    expect(
      (await db.usage.findUniqueOrThrow({ where: { userId } })).scrapesUsed,
    ).toBe(7);
  });

  test("a failed transaction rolls back and the same delivery succeeds on retry", async () => {
    const userId = crypto.randomUUID();
    const payload = event(userId);
    const webhookId = crypto.randomUUID();
    expect((await deliver(payload, webhookId)).status).toBe(500);
    expect(await db.webhookEvent.count({ where: { webhookId } })).toBe(0);
    await fixture(userId);
    expect((await deliver(payload, webhookId)).status).toBe(200);
    expect(
      (await db.subscription.findUniqueOrThrow({ where: { userId } })).tier,
    ).toBe("PREMIUM");
  });

  test("overlapping notifications preserve consumed usage and persist cancellation flags", async () => {
    const userId = await fixture();
    await deliver(event(userId));
    await db.usage.update({
      where: { userId },
      data: { scrapesUsed: 9, keywordScrapesUsed: 8 },
    });
    const updated = event(userId, "subscription.updated");
    updated.data.cancel_at_next_billing_date = true;
    const responses = await Promise.all([
      deliver(updated),
      deliver(event(userId, "subscription.plan_changed")),
    ]);
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(
      await db.usage.findUniqueOrThrow({ where: { userId } }),
    ).toMatchObject({ scrapesUsed: 9, keywordScrapesUsed: 8 });
    const reactivated = event(
      userId,
      "subscription.active",
      "active",
      new Date(now.getTime() + 1000).toISOString(),
    );
    expect((await deliver(reactivated)).status).toBe(200);
    expect(
      (await db.subscription.findUniqueOrThrow({ where: { userId } }))
        .cancelledAtPeriodEnd,
    ).toBe(false);
  });

  test("older events and previous-subscription cancellations do not revoke current access", async () => {
    const userId = await fixture();
    await deliver(event(userId));
    const older = event(
      userId,
      "subscription.on_hold",
      "on_hold",
      periodStart.toISOString(),
    );
    expect((await deliver(older)).status).toBe(200);
    const previous = event(userId, "subscription.cancelled", "cancelled");
    previous.data.subscription_id = "retired-subscription";
    expect((await deliver(previous)).status).toBe(200);
    expect(
      (await db.subscription.findUniqueOrThrow({ where: { userId } })).status,
    ).toBe("ACTIVE");
  });

  test("invalid signatures never create payment records", async () => {
    const userId = await fixture();
    const webhookId = crypto.randomUUID();
    expect((await deliver(event(userId), webhookId, true)).status).toBe(401);
    expect(await db.webhookEvent.count({ where: { webhookId } })).toBe(0);
  });
});
