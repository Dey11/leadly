import type { Request, Response } from "express";
import type { Subscription, User } from "@prisma/client";
import type { SubscriptionChangePlanParams } from "dodopayments/resources/subscriptions";
import { z } from "zod";
import { billingSubscribeSchema } from "../types/schema";
import db from "../lib/db";
import { env } from "../env";
import dodoClient from "../lib/dodo";
import logger from "../lib/logger";
import { effectiveSubscriptionTier } from "../lib/subscription-access";

function providerErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("error" in error))
    return undefined;
  const detail = error.error;
  return typeof detail === "object" &&
    detail !== null &&
    "code" in detail &&
    typeof detail.code === "string"
    ? detail.code
    : undefined;
}

function planChangeRequest(
  plan: "pro" | "premium",
  currentTier: string,
): SubscriptionChangePlanParams {
  return {
    product_id:
      plan === "pro" ? env.DODO_PRO_PRODUCT_ID : env.DODO_PREMIUM_PRODUCT_ID,
    quantity: 1,
    proration_billing_mode: "prorated_immediately",
    on_payment_failure: "prevent_change",
    effective_at:
      currentTier === "PREMIUM" && plan === "pro"
        ? "next_billing_date"
        : "immediately",
  };
}

async function ensureCustomerId(
  user: User & { subscription: Subscription | null },
) {
  if (!user.subscription) throw new Error("Subscription not found");
  if (user.subscription.subscriptionCustomerId)
    return user.subscription.subscriptionCustomerId;
  const page = await dodoClient.customers.list({
    email: user.email,
    page_number: 1,
    page_size: 1,
  });
  const customer =
    page.items[0] ??
    (await dodoClient.customers.create({ email: user.email, name: user.name }));
  await db.subscription.update({
    where: { id: user.subscription.id },
    data: { subscriptionCustomerId: customer.customer_id },
  });
  return customer.customer_id;
}

async function createCustomerPortalUrl(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  if (!user || user.isDeleted) throw new Error("User not found");
  const customerId = await ensureCustomerId(user);
  const session = await dodoClient.customers.customerPortal.create(customerId);
  if (!session.link) throw new Error("Failed to read portal link");
  return session.link;
}

export async function subscribe(req: Request, res: Response) {
  const parsed = billingSubscribeSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid request body" });
  try {
    const { plan } = parsed.data;
    const user = await db.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });
    if (!user || user.isDeleted)
      return res.status(401).json({ error: "Unauthorized" });
    const subscription = user.subscription;
    if (
      subscription?.subscriptionId &&
      subscription.cancelledAtPeriodEnd &&
      effectiveSubscriptionTier(subscription) !== "FREE"
    ) {
      return res.status(409).json({
        error:
          "Resume your subscription in Manage subscription before changing plans.",
      });
    }
    if (
      subscription?.subscriptionId &&
      (subscription.status === "ON_HOLD" || subscription.status === "PENDING")
    ) {
      return res.status(409).json({
        code: "PAYMENT_ACTION_REQUIRED",
        error:
          "Resolve the existing payment in Manage subscription before starting another subscription.",
      });
    }
    const active =
      subscription?.status === "ACTIVE" && subscription.subscriptionId;
    if (active && subscription) {
      if (subscription.tier === plan.toUpperCase())
        return res.status(400).json({
          error: "You already have an active subscription with this plan.",
        });
      const request = planChangeRequest(plan, subscription.tier);
      await dodoClient.subscriptions.changePlan(active, request);
      // An accepted request is not confirmation of successful payment.
      return res.status(200).json({
        success: true,
        planChangePending: true,
        scheduled: request.effective_at === "next_billing_date",
        subscriptionId: active,
        newTier: plan.toUpperCase(),
      });
    }
    const customerId = subscription?.subscriptionCustomerId;
    const session = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id:
            plan === "pro"
              ? env.DODO_PRO_PRODUCT_ID
              : env.DODO_PREMIUM_PRODUCT_ID,
          quantity: 1,
        },
      ],
      customer: customerId
        ? { customer_id: customerId }
        : { email: user.email, name: user.name },
      return_url: `${env.FRONTEND_URL.replace(/\/+$/, "")}/billing/result?plan=${plan}`,
      show_saved_payment_methods: true,
      metadata: {
        user_id: user.id,
        plan_code: plan,
        source: "backend_subscribe_endpoint",
      },
    });
    if (!session.checkout_url) throw new Error("Checkout URL unavailable");
    return res.status(200).json({ url: session.checkout_url });
  } catch (error) {
    if (providerErrorCode(error) === "PREVIOUS_PAYMENT_PENDING")
      return res.status(409).json({
        code: "PAYMENT_PENDING",
        error:
          "Please wait for your previous payment to complete before changing plans.",
      });
    logger.error("Billing subscribe failed", {
      code: providerErrorCode(error),
    });
    return res
      .status(500)
      .json({ error: "Unable to start billing. Please try again." });
  }
}

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const url = new URL(await createCustomerPortalUrl(req.userId!));
    url.searchParams.set("focus", "cancel");
    return res.status(200).json({ url: url.toString() });
  } catch {
    logger.error("Failed to create cancel link");
    return res
      .status(500)
      .json({ error: "Unable to open the subscription portal" });
  }
}

export async function manageSubscription(req: Request, res: Response) {
  try {
    return res
      .status(200)
      .json({ url: await createCustomerPortalUrl(req.userId!) });
  } catch {
    logger.error("Failed to create manage link");
    return res
      .status(500)
      .json({ error: "Unable to open the subscription portal" });
  }
}

export async function previewPlanChange(req: Request, res: Response) {
  const parsed = billingSubscribeSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid request body" });
  try {
    const { plan } = parsed.data;
    const user = await db.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });
    if (!user || user.isDeleted)
      return res.status(401).json({ error: "Unauthorized" });
    const subscription = user.subscription;
    const currentTier = subscription?.tier ?? "FREE";
    const newTier = plan.toUpperCase();
    if (!subscription?.subscriptionId || subscription.status !== "ACTIVE")
      return res.status(200).json({
        canPreview: false,
        isNewSubscription: true,
        currentTier,
        newTier,
      });
    if (currentTier === newTier)
      return res.status(400).json({ error: "You are already on this plan" });
    if (subscription.cancelledAtPeriodEnd)
      return res.status(409).json({
        error:
          "Resume your subscription in Manage subscription before changing plans.",
      });
    const request = planChangeRequest(plan, currentTier);
    const preview = await dodoClient.subscriptions.previewChangePlan(
      subscription.subscriptionId,
      request,
    );
    const {
      total_amount: amount,
      currency,
      customer_credits: credits,
      customer_credits_currency: creditCurrency,
    } = preview.immediate_charge.summary;
    const scheduled = request.effective_at === "next_billing_date";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    const fractionDigits =
      formatter.resolvedOptions().maximumFractionDigits ?? 2;
    const formatted = formatter.format(amount / 10 ** fractionDigits);
    return res.status(200).json({
      canPreview: true,
      isNewSubscription: false,
      currentTier,
      newTier,
      isUpgrade: !scheduled,
      scheduled,
      immediateCharge: { amount, currency },
      credit:
        credits > 0 ? { amount: credits, currency: creditCurrency } : null,
      summary: scheduled
        ? `Your plan changes at your next renewal on ${subscription.currentPeriodEnd.toISOString().slice(0, 10)}. Your current features remain available until then.`
        : `Dodo estimates an immediate charge of ${formatted}, including applicable taxes.`,
    });
  } catch (error) {
    if (providerErrorCode(error) === "PREVIOUS_PAYMENT_PENDING")
      return res.status(409).json({
        error:
          "Please wait for your previous payment to complete before changing plans.",
        code: "PAYMENT_PENDING",
      });
    logger.error("Billing preview failed", { code: providerErrorCode(error) });
    return res.status(503).json({
      error: "Pricing preview is unavailable. Please retry before confirming.",
    });
  }
}

const billingStatusSchema = z.object({
  subscription_id: z.string().trim().min(1).max(200),
  plan: z.enum(["pro", "premium"]).optional(),
});

export async function getBillingStatus(req: Request, res: Response) {
  const parsed = billingStatusSchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ error: "A subscription ID is required" });
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId: req.userId! },
    });
    // Do not reveal whether a different user's provider subscription exists.
    if (
      !subscription ||
      subscription.subscriptionId !== parsed.data.subscription_id
    )
      return res.json({ state: "pending" });
    const tier = effectiveSubscriptionTier(subscription);
    const requestedTier = parsed.data.plan?.toUpperCase();
    let state:
      "success" | "pending" | "on_hold" | "failed" | "cancelled" | "expired" =
      "pending";
    if (tier !== "FREE" && (!requestedTier || tier === requestedTier))
      state = "success";
    else if (subscription.status === "ON_HOLD") state = "on_hold";
    else if (subscription.status === "FAILED") state = "failed";
    else if (
      subscription.status === "EXPIRED" ||
      subscription.currentPeriodEnd <= new Date()
    )
      state = "expired";
    else if (subscription.status === "CANCELLED") state = "cancelled";
    return res.json({ state, tier });
  } catch {
    return res
      .status(500)
      .json({ error: "Unable to verify subscription status" });
  }
}
