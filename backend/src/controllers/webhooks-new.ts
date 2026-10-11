import type { Request, Response } from "express";
import type {
  Subscription as DodoSubscription,
  UnwrapWebhookEvent,
} from "dodopayments/resources/index";
import {
  SubscriptionStatus,
  type Prisma,
  type SubscriptionTier,
} from "@prisma/client";
import dodoClient from "../lib/dodo";
import db from "../lib/db";
import logger from "../lib/logger";
import { PLANS_MAP } from "../lib/constants";
import { effectiveSubscriptionTier } from "../lib/subscription-access";
import { initializeOrResetUsagePeriod } from "../lib/usage";
import { resolveInitialUsagePeriod } from "../lib/usage-period";
import { parseBillingAddress } from "../lib/utils";
import {
  sendSubscriptionActiveEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionExpiredEmail,
  sendSubscriptionFailedEmail,
  sendSubscriptionOnHoldEmail,
  sendSubscriptionPlanChangedEmail,
  sendSubscriptionRenewedEmail,
} from "../lib/email";
import { sendTransactionToDiscord } from "../lib/discord";

function subscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "on_hold":
    case "paused":
    case "past_due":
      return "ON_HOLD";
    case "cancelled":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    case "failed":
      return "FAILED";
    case "pending":
      return "PENDING";
    default:
      throw new Error("Unsupported subscription status");
  }
}

function productTier(productId: string): SubscriptionTier {
  if (productId === PLANS_MAP.PRO) return "PRO";
  if (productId === PLANS_MAP.PREMIUM) return "PREMIUM";
  throw new Error("Subscription product is not mapped to a paid plan");
}

type SubscriptionNotification = {
  type: string;
  user: { email: string; name: string };
  subscriptionId: string;
  tier: SubscriptionTier;
  oldTier?: SubscriptionTier;
  periodEnd: Date;
};

function subscriptionPayload(
  event: UnwrapWebhookEvent,
): DodoSubscription | null {
  switch (event.type) {
    case "subscription.active":
    case "subscription.updated":
    case "subscription.unpaused":
    case "subscription.renewed":
    case "subscription.plan_changed":
    case "subscription.on_hold":
    case "subscription.past_due":
    case "subscription.paused":
    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.failed":
      return event.data;
    default:
      return null;
  }
}

async function applySubscriptionEvent(
  tx: Prisma.TransactionClient,
  data: DodoSubscription,
  type: string,
  occurredAt: Date,
): Promise<SubscriptionNotification | null> {
  const userId = data.metadata.user_id;
  if (typeof userId !== "string" || !userId)
    throw new Error("Subscription has no user metadata");
  // Serialize different deliveries for one account as well as duplicates.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"billing-user:" + userId}, 0))`;
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Subscription user not found");
  if (user.isDeleted) return null;
  const existing = await tx.subscription.findUnique({ where: { userId } });
  if (existing?.lastBillingEventAt && occurredAt < existing.lastBillingEventAt)
    return null;
  const isReplacement = existing?.subscriptionId !== data.subscription_id;
  // An account's first delivery may be a failure or an update. Remember it so
  // checkout can report its state and the customer can recover in the portal.
  // Only activation may replace an already associated provider subscription.
  if (
    isReplacement &&
    type !== "subscription.active" &&
    (existing?.subscriptionId || effectiveSubscriptionTier(existing) !== "FREE")
  )
    return null;
  if (
    isReplacement &&
    existing?.subscriptionId &&
    effectiveSubscriptionTier(existing) !== "FREE"
  )
    return null;
  if (
    isReplacement &&
    existing?.subscriptionId &&
    existing.lastBillingEventAt &&
    occurredAt <= existing.lastBillingEventAt
  )
    return null;

  const status = subscriptionStatus(data.status);
  const tier = productTier(data.product_id);
  const periodStart = new Date(data.previous_billing_date);
  const periodEnd = new Date(
    data.status === "expired" && data.expires_at
      ? data.expires_at
      : data.next_billing_date,
  );
  if (
    !Number.isFinite(periodStart.getTime()) ||
    !Number.isFinite(periodEnd.getTime())
  )
    throw new Error("Invalid subscription billing dates");
  const subscriptionData = {
    subscriptionId: data.subscription_id,
    subscriptionCustomerId: data.customer.customer_id,
    status,
    tier: status === "ACTIVE" ? tier : (existing?.tier ?? "FREE"),
    currentPeriodEnd: periodEnd,
    cancelledAtPeriodEnd: data.cancel_at_next_billing_date ?? false,
    lastBillingEventAt: occurredAt,
    billingAddress: parseBillingAddress(data.billing),
    billingEmail: data.customer.email,
    billingPhone: data.customer.phone_number,
    billingName: data.customer.name,
    currency: data.currency,
  };
  const subscription = await tx.subscription.upsert({
    where: { userId },
    create: { userId, ...subscriptionData },
    update: subscriptionData,
  });
  const effectiveTier = effectiveSubscriptionTier(subscription);
  if (effectiveTier !== "FREE") {
    const usage = await tx.usage.findUnique({ where: { userId } });
    const newCycle =
      !existing ||
      existing.tier === "FREE" ||
      isReplacement ||
      periodEnd > existing.currentPeriodEnd;
    if (!usage || newCycle) {
      await initializeOrResetUsagePeriod(
        tx,
        userId,
        effectiveTier,
        periodStart,
        periodEnd,
      );
    } else {
      // Several events describe one change. Preserve credits already consumed.
      const period = resolveInitialUsagePeriod({
        tier: effectiveTier,
        periodStart,
        periodEnd,
      });
      await tx.usage.update({ where: { userId }, data: period });
    }
  }
  return {
    type,
    user: { email: user.email, name: user.name },
    subscriptionId: data.subscription_id,
    tier,
    oldTier: existing?.tier,
    periodEnd,
  };
}

async function notifySubscription(notification: SubscriptionNotification) {
  const { type, user, subscriptionId, tier, periodEnd } = notification;
  switch (type) {
    case "subscription.active":
      await sendSubscriptionActiveEmail(user.email, subscriptionId, periodEnd);
      break;
    case "subscription.plan_changed":
      await sendSubscriptionPlanChangedEmail(user.email, subscriptionId, tier);
      break;
    case "subscription.renewed":
      await sendSubscriptionRenewedEmail(user.email, subscriptionId, periodEnd);
      break;
    case "subscription.on_hold":
      await sendSubscriptionOnHoldEmail(user.email, subscriptionId, periodEnd);
      break;
    case "subscription.cancelled":
      await sendSubscriptionCancelledEmail(user.email, subscriptionId);
      break;
    case "subscription.expired":
      await sendSubscriptionExpiredEmail(user.email, subscriptionId);
      break;
    case "subscription.failed":
      await sendSubscriptionFailedEmail(user.email, subscriptionId);
      break;
    default:
      return;
  }
  await sendTransactionToDiscord({ ...notification, type });
}

export async function newDodoWebhookHandler(req: Request, res: Response) {
  const webhookId = req.headers["webhook-id"];
  const signature = req.headers["webhook-signature"];
  const timestamp = req.headers["webhook-timestamp"];
  if (
    typeof webhookId !== "string" ||
    typeof signature !== "string" ||
    typeof timestamp !== "string"
  ) {
    return res.status(400).json({ error: "Missing webhook headers" });
  }
  let event: UnwrapWebhookEvent;
  try {
    event = dodoClient.webhooks.unwrap(req.body.toString(), {
      headers: {
        "webhook-id": webhookId,
        "webhook-signature": signature,
        "webhook-timestamp": timestamp,
      },
    });
  } catch {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }
  try {
    const occurredAt = new Date(event.timestamp);
    if (!Number.isFinite(occurredAt.getTime()))
      throw new Error("Invalid webhook event time");
    const result = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"billing-webhook:" + webhookId}, 0))`;
        const completed = await tx.webhookEvent.findFirst({
          where: { webhookId, status: "COMPLETED" },
        });
        if (completed) return { duplicate: true, notification: null };
        const previous = await tx.webhookEvent.findFirst({
          where: { webhookId },
          orderBy: { createdAt: "desc" },
        });
        const data = event.data;
        const eventData = JSON.parse(
          JSON.stringify(event),
        ) as Prisma.InputJsonValue;
        const record = previous
          ? await tx.webhookEvent.update({
              where: { id: previous.id },
              data: {
                status: "PROCESSING",
                eventData,
                lastError: null,
                retryCount: { increment: 1 },
              },
            })
          : await tx.webhookEvent.create({
              data: {
                webhookId,
                customerId: "customer" in data ? data.customer.customer_id : "",
                eventData,
                status: "PROCESSING",
              },
            });
        const subscription = subscriptionPayload(event);
        const notification = subscription
          ? await applySubscriptionEvent(
              tx,
              subscription,
              event.type,
              occurredAt,
            )
          : null;
        // Payment events do not grant access. Their corresponding confirmed
        // subscription events own entitlements; ignored events are still durable.
        await tx.webhookEvent.update({
          where: { id: record.id },
          data: { status: "COMPLETED", lastError: null },
        });
        return { duplicate: false, notification };
      },
      { timeout: 15000 },
    );
    // Notifications cannot roll back or retry an already committed payment event.
    if (result.notification) {
      void notifySubscription(result.notification).catch(() =>
        logger.error("Billing notification failed", { webhookId }),
      );
    }
    return res
      .status(200)
      .json({ received: true, duplicate: result.duplicate });
  } catch {
    logger.error("Billing webhook transaction failed; provider must retry", {
      webhookId,
    });
    return res
      .status(500)
      .json({ error: "Webhook processing failed; retry required" });
  }
}
