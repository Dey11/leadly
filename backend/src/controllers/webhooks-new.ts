import { Request, Response } from "express";
import dodoClient from "../lib/dodo";
import logger from "../lib/logger";
import {
  BillingAddress,
  Customer,
  Payment,
  Subscription,
  UnwrapWebhookEvent,
  WebhookEventType,
} from "dodopayments/resources/index";
import { PLANS_MAP, WEBHOOK_EVENTS } from "../lib/constants";
import db from "../lib/db";
import {
  SubscriptionStatus,
  SubscriptionTier,
  WebhookEventStatus,
} from "@prisma/client";
import {
  sendSubscriptionActiveEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionExpiredEmail,
  sendSubscriptionFailedEmail,
  sendSubscriptionOnHoldEmail,
  sendSubscriptionPlanChangedEmail,
  sendSubscriptionRenewedEmail,
} from "../lib/email";
import { initializeOrResetUsagePeriod } from "../lib/usage";
import { sendTransactionToDiscord } from "../lib/discord";
import { parseBillingAddress } from "../lib/utils";

const processedWebhooks = new Set();

type SubscriptionEventContext = {
  user: { id: string; email: string; name: string };
  subscriptionId: string;
  productId: string;
  status: string;
  startOfBillingCycle: string;
  endOfBillingCycle: string;
  expiresAt: string | null | undefined;
  cancelledAt: string | null | undefined;
  cancelAtNextBillingDate: boolean;
  currency: string;
  customer: Customer;
  billing: BillingAddress;
  webhookEventId: string;
};

export async function newDodoWebhookHandler(req: Request, res: Response) {
  try {
    const webhookId = req.headers["webhook-id"] as string;
    const webhookSignature = req.headers["webhook-signature"] as string;
    const webhookTimestamp = req.headers["webhook-timestamp"] as string;

    logger.info(`[WEBHOOK] Received webhook with ID: ${webhookId}`);

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      logger.warn("[WEBHOOK] Missing webhook headers");
      return res.status(400).json({ error: "Missing webhook headers" });
    }

    if (processedWebhooks.has(webhookId)) {
      logger.info(`[WEBHOOK] Duplicate webhook detected: ${webhookId}`);
      return res.status(200).json({ received: true, duplicate: true });
    }

    const unwrapped = dodoClient.webhooks.unwrap(req.body.toString(), {
      headers: {
        "webhook-id": webhookId,
        "webhook-signature": webhookSignature,
        "webhook-timestamp": webhookTimestamp,
      },
    });

    logger.info(`[WEBHOOK] Unwrapped webhook type: ${unwrapped.type}`);
    // Log full payload only for subscription.cancelled to debug cancellation types
    if (unwrapped.type === "subscription.cancelled") {
      logger.info(
        `[WEBHOOK] Cancelled payload: ${JSON.stringify(unwrapped.data, null, 2)}`,
      );
    }

    const webhookEvent = await db.webhookEvent.create({
      data: {
        customerId: (unwrapped.data as Subscription | Payment).customer
          .customer_id,
        eventData: JSON.stringify(unwrapped.data),
        status: WebhookEventStatus.PENDING,
        webhookId: webhookId,
      },
    });

    logger.info(
      `[WEBHOOK] Created webhook event in DB with ID: ${webhookEvent.id}`,
    );
    res.status(200).json({ received: true }).end();

    processedWebhooks.add(webhookId);
    logger.info(
      `[WEBHOOK] Starting async processing for webhook: ${webhookId}`,
    );
    asyncProcessWebhook(unwrapped, webhookEvent.id);
  } catch (error) {
    logger.error("[WEBHOOK] Error in webhook handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function asyncProcessWebhook(
  unwrapped: UnwrapWebhookEvent,
  webhookEventId: string,
) {
  try {
    logger.info(
      `[ASYNC_PROCESS] Starting async processing for webhook event: ${webhookEventId}`,
    );

    const type: WebhookEventType = unwrapped.type;
    const data = unwrapped.data as any;
    const payloadType = data.payload_type as "Subscription" | "Payment";
    const customer: Customer = data.customer;
    const billing: BillingAddress = data.billing;

    logger.info(
      `[ASYNC_PROCESS] Webhook type: ${type}, Payload type: ${payloadType}`,
    );

    if (payloadType === "Subscription") {
      logger.info(
        `[ASYNC_PROCESS] Handling subscription event for webhook: ${webhookEventId}`,
      );
      await handleSubscriptionEvent(
        data,
        type,
        customer,
        billing,
        webhookEventId,
      );
      logger.info(
        `[ASYNC_PROCESS] ✅ Successfully processed subscription event: ${webhookEventId}`,
      );
    } else if (payloadType === "Payment") {
      logger.info(
        `[ASYNC_PROCESS] Payment event received (not yet implemented): ${webhookEventId}`,
      );
      // TODO: handle payment event in the future
    } else {
      logger.warn(`[ASYNC_PROCESS] Unknown payload type: ${payloadType}`);
    }
  } catch (error) {
    logger.error(
      `[ASYNC_PROCESS] ❌ Error processing webhook ${webhookEventId}:`,
      error,
    );
    logger.error(
      `[ASYNC_PROCESS] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace",
    );

    // TODO: add retries
    await db.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        status: WebhookEventStatus.FAILED,
        lastError: error instanceof Error ? error.message : String(error),
      },
    });

    logger.error(
      `[ASYNC_PROCESS] Updated webhook ${webhookEventId} status to FAILED`,
    );
  }
}

function getTierFromProductId(productId: string): SubscriptionTier {
  return (
    (Object.entries(PLANS_MAP).find(
      ([_, id]) => id === productId,
    )?.[0] as SubscriptionTier) ?? SubscriptionTier.FREE
  );
}

async function handleSubscriptionActive(ctx: SubscriptionEventContext) {
  logger.info(
    `[ACTIVE] Handling subscription active for user: ${ctx.user.email}`,
  );
  const tier = getTierFromProductId(ctx.productId);
  logger.info(
    `[ACTIVE] Determined tier: ${tier} from product ID: ${ctx.productId}`,
  );

  await db.$transaction(async (tx) => {
    logger.info(
      `[ACTIVE] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    logger.info(`[ACTIVE] Upserting subscription for user: ${ctx.user.id}`);
    await tx.subscription.upsert({
      where: { userId: ctx.user.id },
      create: {
        userId: ctx.user.id,
        subscriptionId: ctx.subscriptionId,
        subscriptionCustomerId: ctx.customer.customer_id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: ctx.endOfBillingCycle,
        billingAddress: parseBillingAddress(ctx.billing),
        billingEmail: ctx.customer.email,
        billingPhone: ctx.customer.phone_number,
        billingName: ctx.customer.name,
        currency: ctx.currency,
        tier,
      },
      update: {
        subscriptionId: ctx.subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: ctx.endOfBillingCycle,
        billingAddress: parseBillingAddress(ctx.billing),
        billingEmail: ctx.customer.email,
        billingPhone: ctx.customer.phone_number,
        billingName: ctx.customer.name,
        currency: ctx.currency,
        tier,
        subscriptionCustomerId: ctx.customer.customer_id,
      },
    });

    logger.info(`[ACTIVE] Initializing usage period for tier: ${tier}`);
    await initializeOrResetUsagePeriod(
      tx,
      ctx.user.id,
      tier,
      new Date(ctx.startOfBillingCycle),
      new Date(ctx.endOfBillingCycle),
    );

    logger.info(`[ACTIVE] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[ACTIVE] Transaction completed - sending notifications`);
  sendSubscriptionActiveEmail(
    ctx.user.email,
    ctx.subscriptionId,
    new Date(ctx.endOfBillingCycle),
  );
  sendTransactionToDiscord({
    type: "subscription.active",
    tier,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
    periodEnd: new Date(ctx.endOfBillingCycle),
  });
  logger.info(
    `[ACTIVE] ✅ Subscription active handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionUpdated(ctx: SubscriptionEventContext) {
  logger.info(
    `[UPDATED] Handling subscription updated for user: ${ctx.user.email}`,
  );
  const tier = getTierFromProductId(ctx.productId);
  logger.info(`[UPDATED] Tier: ${tier}, New status: ${ctx.status}`);

  await db.$transaction(async (tx) => {
    logger.info(
      `[UPDATED] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[UPDATED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    logger.info(
      `[UPDATED] Updating subscription with new status, cancelledAtPeriodEnd=${ctx.cancelAtNextBillingDate}`,
    );
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: ctx.status.toUpperCase() as SubscriptionStatus,
        currentPeriodEnd: ctx.endOfBillingCycle,
        cancelledAtPeriodEnd: ctx.cancelAtNextBillingDate,
        billingAddress: parseBillingAddress(ctx.billing),
        billingEmail: ctx.customer.email,
        billingPhone: ctx.customer.phone_number,
        billingName: ctx.customer.name,
        currency: ctx.currency,
      },
    });

    logger.info(`[UPDATED] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(
    `[UPDATED] ✅ Subscription updated handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionOnHold(ctx: SubscriptionEventContext) {
  logger.info(
    `[ON_HOLD] Handling subscription on hold for user: ${ctx.user.email}`,
  );
  const tier = getTierFromProductId(ctx.productId);

  await db.$transaction(async (tx) => {
    logger.info(
      `[ON_HOLD] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[ON_HOLD] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    logger.info(`[ON_HOLD] Setting subscription status to ON_HOLD`);
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: SubscriptionStatus.ON_HOLD,
        currentPeriodEnd: ctx.endOfBillingCycle,
      },
    });

    logger.info(`[ON_HOLD] Resetting usage period to FREE tier`);
    await initializeOrResetUsagePeriod(tx, ctx.user.id, SubscriptionTier.FREE);

    logger.info(`[ON_HOLD] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[ON_HOLD] Transaction completed - sending notifications`);
  sendSubscriptionOnHoldEmail(
    ctx.user.email,
    ctx.subscriptionId,
    new Date(ctx.endOfBillingCycle),
  );
  sendTransactionToDiscord({
    type: "subscription.on_hold",
    tier,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
    periodEnd: new Date(ctx.endOfBillingCycle),
  });
  logger.info(
    `[ON_HOLD] ✅ Subscription on hold handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionRenewed(ctx: SubscriptionEventContext) {
  logger.info(
    `[RENEWED] Handling subscription renewed for user: ${ctx.user.email}`,
  );
  const tier = getTierFromProductId(ctx.productId);
  logger.info(`[RENEWED] Tier: ${tier}`);

  await db.$transaction(async (tx) => {
    logger.info(
      `[RENEWED] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[RENEWED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    logger.info(`[RENEWED] Updating subscription status to ACTIVE`);
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: ctx.endOfBillingCycle,
        billingAddress: parseBillingAddress(ctx.billing),
        billingEmail: ctx.customer.email,
        billingPhone: ctx.customer.phone_number,
        billingName: ctx.customer.name,
        currency: ctx.currency,
      },
    });

    logger.info(`[RENEWED] Resetting usage period for new billing cycle`);
    await initializeOrResetUsagePeriod(
      tx,
      ctx.user.id,
      tier,
      new Date(ctx.startOfBillingCycle),
      new Date(ctx.endOfBillingCycle),
    );

    logger.info(`[RENEWED] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[RENEWED] Transaction completed - sending notifications`);
  sendSubscriptionRenewedEmail(
    ctx.user.email,
    ctx.subscriptionId,
    new Date(ctx.endOfBillingCycle),
  );
  sendTransactionToDiscord({
    type: "subscription.renewed",
    tier,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
    periodEnd: new Date(ctx.endOfBillingCycle),
  });
  logger.info(
    `[RENEWED] ✅ Subscription renewed handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionPlanChanged(ctx: SubscriptionEventContext) {
  logger.info(
    `[PLAN_CHANGED] Handling subscription plan changed for user: ${ctx.user.email}`,
  );
  const tier = getTierFromProductId(ctx.productId);
  logger.info(`[PLAN_CHANGED] New tier: ${tier}`);

  let oldTier: SubscriptionTier | undefined;

  await db.$transaction(async (tx) => {
    logger.info(
      `[PLAN_CHANGED] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[PLAN_CHANGED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    oldTier = existingSubscription.tier;
    logger.info(`[PLAN_CHANGED] Old tier: ${oldTier}, New tier: ${tier}`);

    logger.info(`[PLAN_CHANGED] Updating subscription with new plan`);
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: ctx.endOfBillingCycle,
        billingAddress: parseBillingAddress(ctx.billing),
        billingEmail: ctx.customer.email,
        billingPhone: ctx.customer.phone_number,
        billingName: ctx.customer.name,
        currency: ctx.currency,
        tier,
      },
    });

    logger.info(
      `[PLAN_CHANGED] Initializing usage period for new tier: ${tier}`,
    );
    await initializeOrResetUsagePeriod(
      tx,
      ctx.user.id,
      tier,
      tier === SubscriptionTier.FREE
        ? undefined
        : new Date(ctx.startOfBillingCycle),
      tier === SubscriptionTier.FREE
        ? undefined
        : new Date(ctx.endOfBillingCycle),
    );

    logger.info(`[PLAN_CHANGED] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[PLAN_CHANGED] Transaction completed - sending notifications`);
  sendSubscriptionPlanChangedEmail(ctx.user.email, ctx.subscriptionId, tier);
  sendTransactionToDiscord({
    type: "subscription.plan_changed",
    tier,
    oldTier,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
    periodEnd:
      tier === SubscriptionTier.FREE
        ? undefined
        : new Date(ctx.endOfBillingCycle),
  });
  logger.info(
    `[PLAN_CHANGED] ✅ Subscription plan changed handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionCancelled(ctx: SubscriptionEventContext) {
  logger.info(
    `[CANCELLED] Handling subscription cancelled for user: ${ctx.user.email}`,
  );

  const isImmediateCancellation = !ctx.cancelAtNextBillingDate;
  logger.info(
    `[CANCELLED] cancelAtNextBillingDate=${ctx.cancelAtNextBillingDate}, isImmediateCancellation=${isImmediateCancellation}`,
  );

  await db.$transaction(async (tx) => {
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[CANCELLED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    if (isImmediateCancellation) {
      logger.info(`[CANCELLED] IMMEDIATE cancellation - setting tier to FREE`);
      await tx.subscription.update({
        where: { userId: ctx.user.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          tier: SubscriptionTier.FREE,
          currentPeriodEnd: ctx.endOfBillingCycle,
        },
      });
      await initializeOrResetUsagePeriod(
        tx,
        ctx.user.id,
        SubscriptionTier.FREE,
      );
    } else {
      logger.info(
        `[CANCELLED] SCHEDULED cancellation - keeping current tier until period end`,
      );
      await tx.subscription.update({
        where: { userId: ctx.user.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          currentPeriodEnd: ctx.endOfBillingCycle,
        },
      });
    }

    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[CANCELLED] Transaction completed - sending notifications`);
  sendSubscriptionCancelledEmail(ctx.user.email, ctx.subscriptionId);
  sendTransactionToDiscord({
    type: "subscription.cancelled",
    tier: isImmediateCancellation
      ? SubscriptionTier.FREE
      : getTierFromProductId(ctx.productId),
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
  });
  logger.info(
    `[CANCELLED] ✅ Subscription cancelled handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionExpired(ctx: SubscriptionEventContext) {
  logger.info(
    `[EXPIRED] Handling subscription expired for user: ${ctx.user.email}`,
  );

  await db.$transaction(async (tx) => {
    logger.info(
      `[EXPIRED] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[EXPIRED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    logger.info(`[EXPIRED] Setting subscription status to EXPIRED`);
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: SubscriptionStatus.EXPIRED,
        currentPeriodEnd: ctx.expiresAt ? new Date(ctx.expiresAt) : undefined,
      },
    });

    logger.info(`[EXPIRED] Resetting usage period to FREE tier`);
    await initializeOrResetUsagePeriod(tx, ctx.user.id, SubscriptionTier.FREE);

    logger.info(`[EXPIRED] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[EXPIRED] Transaction completed - sending notifications`);
  sendSubscriptionExpiredEmail(ctx.user.email, ctx.subscriptionId);
  sendTransactionToDiscord({
    type: "subscription.expired",
    tier: SubscriptionTier.FREE,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
  });
  logger.info(
    `[EXPIRED] ✅ Subscription expired handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionFailed(ctx: SubscriptionEventContext) {
  logger.info(
    `[FAILED] Handling subscription failed for user: ${ctx.user.email}`,
  );

  await db.$transaction(async (tx) => {
    logger.info(
      `[FAILED] Transaction started - updating webhook status to PROCESSING`,
    );
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.PROCESSING },
    });

    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!existingSubscription) {
      logger.error(
        `[FAILED] ❌ Subscription not found for user: ${ctx.user.id}`,
      );
      throw new Error("Subscription not found for user");
    }

    logger.info(`[FAILED] Setting subscription status to FAILED`);
    await tx.subscription.update({
      where: { userId: ctx.user.id },
      data: {
        status: SubscriptionStatus.FAILED,
        currentPeriodEnd: undefined,
      },
    });

    logger.info(`[FAILED] Resetting usage period to FREE tier`);
    await initializeOrResetUsagePeriod(tx, ctx.user.id, SubscriptionTier.FREE);

    logger.info(`[FAILED] Updating webhook status to COMPLETED`);
    await tx.webhookEvent.update({
      where: { id: ctx.webhookEventId },
      data: { status: WebhookEventStatus.COMPLETED },
    });
  });

  logger.info(`[FAILED] Transaction completed - sending notifications`);
  sendSubscriptionFailedEmail(ctx.user.email, ctx.subscriptionId);
  sendTransactionToDiscord({
    type: "subscription.failed",
    tier: SubscriptionTier.FREE,
    user: { name: ctx.user.name, email: ctx.user.email },
    subscriptionId: ctx.subscriptionId,
  });
  logger.info(
    `[FAILED] ✅ Subscription failed handler completed for ${ctx.subscriptionId}`,
  );
}

async function handleSubscriptionEvent(
  data: Subscription,
  type: WebhookEventType,
  customer: Customer,
  billing: BillingAddress,
  webhookEventId: string,
) {
  logger.info(
    `[SUBSCRIPTION_EVENT] Processing event type: ${type} for webhook: ${webhookEventId}`,
  );
  logger.info(
    `[SUBSCRIPTION_EVENT] Subscription ID: ${data.subscription_id}, User ID: ${data.metadata.user_id}`,
  );

  const user = await db.user.findUnique({
    where: { id: data.metadata.user_id },
  });

  if (!user) {
    logger.error(`[SUBSCRIPTION_EVENT] ❌ User not found for subscription:`, {
      subscriptionId: data.subscription_id,
      userId: data.metadata.user_id,
    });
    return;
  }

  logger.info(`[SUBSCRIPTION_EVENT] ✅ Found user: ${user.email} (${user.id})`);

  const ctx: SubscriptionEventContext = {
    user: { id: user.id, email: user.email, name: user.name },
    subscriptionId: data.subscription_id,
    productId: data.product_id,
    status: data.status,
    startOfBillingCycle: data.previous_billing_date,
    endOfBillingCycle: data.next_billing_date,
    expiresAt: data.expires_at,
    cancelledAt: data.cancelled_at,
    cancelAtNextBillingDate: data.cancel_at_next_billing_date ?? false,
    currency: data.currency,
    customer,
    billing,
    webhookEventId,
  };

  logger.info(`[SUBSCRIPTION_EVENT] Dispatching to handler for: ${type}`);

  switch (type) {
    case WEBHOOK_EVENTS.SUBSCRIPTION_ACTIVE:
      await handleSubscriptionActive(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
      await handleSubscriptionUpdated(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_ON_HOLD:
      await handleSubscriptionOnHold(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_RENEWED:
      await handleSubscriptionRenewed(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_PLAN_CHANGED:
      await handleSubscriptionPlanChanged(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_CANCELLED:
      await handleSubscriptionCancelled(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_EXPIRED:
      await handleSubscriptionExpired(ctx);
      break;
    case WEBHOOK_EVENTS.SUBSCRIPTION_FAILED:
      await handleSubscriptionFailed(ctx);
      break;
    default:
      logger.error(`[SUBSCRIPTION_EVENT] ❌ Unknown webhook event: ${type}`);
      logger.error("[SUBSCRIPTION_EVENT] Webhook event data:", data);
      await db.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: WebhookEventStatus.FAILED,
          lastError: "Unknown webhook event type",
        },
      });
  }

  logger.info(
    `[SUBSCRIPTION_EVENT] ✅ Completed processing for ${type} - webhook: ${webhookEventId}`,
  );
}
