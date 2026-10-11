import { beforeAll, describe, expect, test } from "bun:test";
import { z } from "zod";

// A fresh process keeps billing mocks isolated from scheduler/automation suites.
async function exerciseBilling() {
  const script = String.raw`
    import { mock } from "bun:test";
    import DodoPayments from "dodopayments";
    import { createHmac } from "node:crypto";
    const root = process.cwd() + "/src/";
    const now = new Date();
    const start = new Date(now.getTime() - 86400000);
    const end = new Date(now.getTime() + 25 * 86400000);
    let state;
    function reset(tier = "FREE", status = "ACTIVE") {
      state = {
        user: { id: "audit-user", email: "audit@example.invalid", name: "Audit", isDeleted: false },
        sub: { id: "audit-row", userId: "audit-user", subscriptionId: tier === "FREE" ? null : "audit-sub", subscriptionCustomerId: "audit-customer", tier, status, currentPeriodEnd: end, cancelledAtPeriodEnd: false, lastBillingEventAt: null },
        usage: { userId: "audit-user", periodStart: start, periodEnd: end, dailyDate: new Date(now.toISOString().slice(0,10) + "T00:00:00Z"), dailyCount: 2, scrapesUsed: 10, keywordDailyCount: 2, keywordScrapesUsed: 10 },
        events: [], changes: [], checkout: [], fault: false,
      };
    }
    function apply(row, data) {
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        row[key] = key === "currentPeriodEnd" || key === "lastBillingEventAt" ? new Date(value) : value && typeof value === "object" && "increment" in value ? row[key] + value.increment : value;
      }
      return row;
    }
    const db = {
      user: { findUnique: async () => { if (state.fault) { state.fault = false; throw new Error("Transient database failure"); } return { ...state.user, subscription: state.sub }; } },
      subscription: { findUnique: async () => structuredClone(state.sub), update: async ({ data }) => apply(state.sub, data), upsert: async ({ update }) => apply(state.sub, update) },
      usage: { findUnique: async () => state.usage, findUniqueOrThrow: async () => state.usage, update: async ({ data }) => apply(state.usage, data), updateMany: async ({ data }) => { apply(state.usage, data); return { count: 1 }; }, upsert: async ({ update }) => apply(state.usage, update) },
      webhookEvent: {
        findFirst: async ({ where }) => state.events.find(event => event.webhookId === where.webhookId && (!where.status || event.status === where.status)) ?? null,
        create: async ({ data }) => { const event = { id: "event-" + state.events.length, ...data }; state.events.push(event); return event; },
        update: async ({ where, data }) => apply(state.events.find(event => event.id === where.id), data),
      },
      userSchedule: { findUnique: async () => ({ scheduledHours: [12] }) },
      $executeRaw: async () => 1,
      $transaction: async callback => { const before = structuredClone({ sub: state.sub, usage: state.usage, events: state.events }); try { return await callback(db); } catch (error) { Object.assign(state, before); throw error; } },
    };
    const signingKey = Buffer.from("local-billing-test-signing-key");
    const client = new DodoPayments({ bearerToken: "unused-test-key", environment: "test_mode", webhookKey: "whsec_" + signingKey.toString("base64") });
    const dodo = {
      webhooks: client.webhooks,
      checkoutSessions: { create: async data => { state.checkout.push(data); return { checkout_url: "https://checkout.example.invalid/test" }; } },
      subscriptions: {
        changePlan: async (id, data) => { state.changes.push({ id, ...data }); if (state.changeError) throw state.changeError; },
        update: async () => {},
        previewChangePlan: async () => ({ immediate_charge: { summary: { total_amount: 850, currency: "USD", customer_credits: 0 } } }),
      },
    };
    mock.module(root + "env.ts", () => ({ env: { FRONTEND_URL: "https://app.example.invalid", DODO_PRO_PRODUCT_ID: "audit-pro", DODO_PREMIUM_PRODUCT_ID: "audit-premium" } }));
    mock.module(root + "lib/db.ts", () => ({ default: db }));
    mock.module(root + "lib/dodo.ts", () => ({ default: dodo }));
    mock.module(root + "lib/logger.ts", () => ({ default: { info() {}, warn() {}, error() {} } }));
    mock.module(root + "lib/email.ts", () => Object.fromEntries(["Active", "Cancelled", "Expired", "Failed", "OnHold", "PlanChanged", "Renewed"].map(name => ["sendSubscription" + name + "Email", async () => {}])));
    mock.module(root + "lib/discord.ts", () => ({ sendTransactionToDiscord: async () => {} }));
    mock.module(root + "services/automation.ts", () => ({ enableAutomationForUser: async () => {}, getAutomationStateForUser: async () => {} }));
    globalThis.fetch = () => { throw new Error("Billing regression tests prohibit external requests"); };
    const billing = await import(root + "controllers/billing.ts");
    const { newDodoWebhookHandler } = await import(root + "controllers/webhooks-new.ts");
    const { getTierLimits } = await import(root + "controllers/schedule.ts");
    const { tryConsumeScrapeCredit } = await import(root + "lib/usage.ts");
    function response() { return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() { return this; } }; }
    async function call(fn, body = {}, query = {}) { const res = response(); await fn({ userId: "audit-user", body, query }, res); return res; }
    function payload(type, extra = {}, timestamp = now.toISOString()) {
      return { type, timestamp, data: { payload_type: "Subscription", subscription_id: "audit-sub", product_id: "audit-premium", status: "active", previous_billing_date: start.toISOString(), next_billing_date: end.toISOString(), expires_at: end.toISOString(), cancel_at_next_billing_date: false, currency: "USD", metadata: { user_id: "audit-user" }, customer: { customer_id: "audit-customer", email: "audit@example.invalid", name: "Audit" }, billing: {}, ...extra } };
    }
    let sequence = 0;
    async function webhook(event, id = "webhook-" + ++sequence, invalidSignature = false) {
      const res = response();
      const body = JSON.stringify(event);
      const timestamp = String(Math.floor(Date.now() / 1000));
      const signature = createHmac("sha256", signingKey).update(id + "." + timestamp + "." + body).digest("base64");
      await newDodoWebhookHandler({ headers: { "webhook-id": id, "webhook-signature": "v1," + (invalidSignature ? "invalid" : signature), "webhook-timestamp": timestamp }, body: Buffer.from(body) }, res);
      await new Promise(resolve => setImmediate(resolve));
      return res;
    }
    const output = {};
    reset(); await call(billing.subscribe, { plan: "pro" }); output.checkout = state.checkout[0];
    reset("PRO"); output.upgrade = await call(billing.subscribe, { plan: "premium" }); output.upgradeTier = state.sub.tier; output.upgradeRequest = state.changes[0];
    reset("PREMIUM"); output.downgrade = await call(billing.subscribe, { plan: "pro" }); output.downgradeTier = state.sub.tier; output.downgradeRequest = state.changes[0];
    reset("PRO"); output.samePlan = (await call(billing.subscribe, { plan: "pro" })).code;
    reset("PRO"); state.changeError = { error: { code: "PREVIOUS_PAYMENT_PENDING" } }; output.paymentPending = (await call(billing.subscribe, { plan: "premium" })).code;
    reset("PRO"); output.preview = (await call(billing.previewPlanChange, { plan: "premium" })).body;
    reset(); state.fault = true; output.failedDelivery = (await webhook(payload("subscription.active"), "retry-webhook")).code;
    output.retryDelivery = (await webhook(payload("subscription.active"), "retry-webhook")).code; output.retryTier = state.sub.tier;
    state.usage.scrapesUsed = 5; await webhook(payload("subscription.active"), "retry-webhook"); output.duplicateUsed = state.usage.scrapesUsed;
    reset(); output.invalidSignature = (await webhook(payload("subscription.active"), "invalid-webhook", true)).code; output.invalidEvents = state.events.length;
    reset(); await webhook(payload("subscription.failed", { status: "failed" })); output.initialFailedResult = (await call(billing.getBillingStatus, {}, { subscription_id: "audit-sub", plan: "premium" })).body;
    await webhook(payload("subscription.active")); output.firstRecoveryUsed = state.usage.scrapesUsed;
    reset(); await webhook(payload("subscription.on_hold", { status: "on_hold" })); output.initialOnHoldSubscribe = (await call(billing.subscribe, { plan: "premium" })).code; output.initialOnHoldCheckouts = state.checkout.length;
    await webhook(payload("subscription.updated", { status: "on_hold" })); await webhook(payload("subscription.active")); output.firstHoldRecoveryUsed = state.usage.scrapesUsed;
    reset("PREMIUM"); await webhook(payload("subscription.on_hold", { status: "on_hold" })); output.onHoldTier = (await call(getTierLimits)).body.tier;
    output.onHoldQuota = (await tryConsumeScrapeCredit("audit-user", "PREMIUM", state.sub.currentPeriodEnd, "on")).allowed;
    await webhook(payload("subscription.active")); output.onHoldRecoveryUsed = state.usage.scrapesUsed;
    reset("PREMIUM"); await webhook(payload("subscription.expired", { status: "expired", expires_at: start.toISOString() })); output.expiredTier = (await call(getTierLimits)).body.tier;
    reset("PREMIUM"); state.sub.subscriptionId = "replacement-sub"; await webhook(payload("subscription.cancelled", { status: "cancelled" })); output.oldCancellationTier = state.sub.tier;
    reset("PREMIUM"); state.sub.lastBillingEventAt = now; await webhook(payload("subscription.on_hold", { status: "on_hold" }, start.toISOString())); output.oldEventStatus = state.sub.status;
    reset("PREMIUM"); state.sub.cancelledAtPeriodEnd = true; await webhook(payload("subscription.active")); output.reactivatedCancellation = state.sub.cancelledAtPeriodEnd;
    reset("PREMIUM"); await webhook(payload("subscription.updated")); await webhook(payload("subscription.plan_changed")); output.overlapUsed = state.usage.scrapesUsed;
    reset("PRO"); await webhook(payload("subscription.renewed", { product_id: "audit-pro", previous_billing_date: now.toISOString(), next_billing_date: new Date(end.getTime() + 30 * 86400000).toISOString() })); output.renewedUsed = state.usage.scrapesUsed;
    reset("PRO", "ON_HOLD"); output.onHoldSubscribe = (await call(billing.subscribe, { plan: "premium" })).code; output.onHoldCheckouts = state.checkout.length;
    reset("PRO", "CANCELLED"); state.sub.cancelledAtPeriodEnd = true; output.scheduledCancellation = (await call(billing.subscribe, { plan: "premium" })).code; output.cancelledCheckouts = state.checkout.length;
    reset(); output.freePlan = (await call(billing.subscribe, { plan: "free" })).code; output.missingPlan = (await call(billing.subscribe)).code; output.invalidCheckouts = state.checkout.length;
    if (billing.getBillingStatus) {
      reset("PREMIUM"); output.verifiedResult = (await call(billing.getBillingStatus, {}, { subscription_id: "audit-sub" })).body;
      output.otherResult = (await call(billing.getBillingStatus, {}, { subscription_id: "another-user-sub" })).body;
      output.missingResult = (await call(billing.getBillingStatus)).code;
      output.pendingUpgradeResult = (await call(billing.getBillingStatus, {}, { subscription_id: "audit-sub", plan: "pro" })).body;
    }
    console.log(JSON.stringify(output));
  `;
  const child = Bun.spawn(
    [process.execPath, "--no-env-file", "--eval", script],
    {
      cwd: process.cwd(),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [output, error] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(await child.exited, error).toBe(0);
  return z.record(z.string(), z.unknown()).parse(JSON.parse(output.trim()));
}

describe("billing reliability", () => {
  let result: Record<string, unknown>;
  beforeAll(async () => {
    result = await exerciseBilling();
  });
  test("returning customers reuse the correct customer at checkout", () => {
    expect(result.checkout).toMatchObject({
      product_cart: [{ product_id: "audit-pro" }],
      metadata: { user_id: "audit-user" },
      customer: { customer_id: "audit-customer" },
    });
  });
  test("upgrades wait for confirmation and prevent change on payment failure", () => {
    expect(result.upgradeTier).toBe("PRO");
    expect(result.upgradeRequest).toMatchObject({
      on_payment_failure: "prevent_change",
    });
  });
  test("downgrades preserve the current tier until next renewal", () => {
    expect(result.downgradeTier).toBe("PREMIUM");
    expect(result.downgradeRequest).toMatchObject({
      effective_at: "next_billing_date",
    });
  });
  test("same-tier and pending-payment requests cannot start another subscription", () => {
    expect(result.samePlan).toBe(400);
    expect(result.paymentPending).toBe(409);
    expect(result.onHoldSubscribe).toBe(409);
    expect(result.onHoldCheckouts).toBe(0);
    expect(result.scheduledCancellation).toBe(409);
    expect(result.cancelledCheckouts).toBe(0);
  });
  test("invalid or omitted plans never become paid checkout requests", () => {
    expect(result.freePlan).toBe(400);
    expect(result.missingPlan).toBe(400);
    expect(result.invalidCheckouts).toBe(0);
  });
  test("pricing returns amounts and a displayable summary", () => {
    expect(result.preview).toMatchObject({
      immediateCharge: { amount: 850, currency: "USD" },
      summary: expect.any(String),
    });
  });
  test("failed delivery is retried and completed duplicate does not reset quota", () => {
    expect(result.failedDelivery).toBe(500);
    expect(result.retryDelivery).toBe(200);
    expect(result.retryTier).toBe("PREMIUM");
    expect(result.duplicateUsed).toBe(5);
  });
  test("invalid signatures never create records", () => {
    expect(result.invalidSignature).toBe(401);
    expect(result.invalidEvents).toBe(0);
  });
  test("on-hold and expired subscriptions have no paid privileges", () => {
    expect(result.onHoldTier).toBe("FREE");
    expect(result.onHoldQuota).toBe(false);
    expect(result.expiredTier).toBe("FREE");
    expect(result.initialOnHoldSubscribe).toBe(409);
    expect(result.initialOnHoldCheckouts).toBe(0);
    expect(result.initialFailedResult).toMatchObject({
      state: "failed",
      tier: "FREE",
    });
    expect(result.firstRecoveryUsed).toBe(0);
    expect(result.firstHoldRecoveryUsed).toBe(0);
    expect(result.onHoldRecoveryUsed).toBe(10);
  });
  test("older and previous-subscription events cannot revoke current access", () => {
    expect(result.oldCancellationTier).toBe("PREMIUM");
    expect(result.oldEventStatus).toBe("ACTIVE");
  });
  test("reactivation clears cancellation and overlapping events preserve quota", () => {
    expect(result.reactivatedCancellation).toBe(false);
    expect(result.overlapUsed).toBe(10);
    expect(result.renewedUsed).toBe(0);
  });
  test("billing results confirm ownership and the requested tier", () => {
    expect(result.verifiedResult).toMatchObject({ state: "success" });
    expect(result.otherResult).toMatchObject({ state: "pending" });
    expect(result.missingResult).toBe(400);
    expect(result.pendingUpgradeResult).toMatchObject({ state: "pending" });
  });
});
