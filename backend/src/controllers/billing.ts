import { Request, Response } from "express";
import { billingSubscribeSchema } from "../types/schema";
import db from "../lib/db";
import { env } from "../env";
import { Subscription, SubscriptionTier } from "@prisma/client";
import dodoClient from "../lib/dodo";
import { Customer } from "dodopayments/resources/customers";
import { User } from "@prisma/client";
import logger from "../lib/logger";

type ChangePlanError = {
  code: string;
  error: string;
  status: number;
};

async function attemptChangePlan(
  existingSubscriptionId: string,
  productId: string,
): Promise<ChangePlanError | undefined> {
  try {
    logger.info(
      `[BILLING] Attempting plan change for subscription: ${existingSubscriptionId} to product: ${productId}`,
    );
    await dodoClient.subscriptions.changePlan(existingSubscriptionId, {
      product_id: productId,
      quantity: 1,
      proration_billing_mode: "prorated_immediately",
    });
    logger.info(
      `[BILLING] ✅ Plan change successful for subscription: ${existingSubscriptionId}`,
    );
  } catch (changePlanError: any) {
    const errorCode = changePlanError?.error?.code;

    if (errorCode === "PREVIOUS_PAYMENT_PENDING") {
      return {
        code: "PAYMENT_PENDING",
        error:
          "Please wait for your previous payment to complete before changing plans.",
        status: 409,
      };
    }

    if (errorCode === "PLAN_CHANGE_NOT_ALLOWED_FOR_SCHEDULED_CANCELLATION") {
      await dodoClient.subscriptions.update(existingSubscriptionId, {
        cancel_at_next_billing_date: false,
      });
      try {
        await dodoClient.subscriptions.changePlan(existingSubscriptionId, {
          product_id: productId,
          quantity: 1,
          proration_billing_mode: "prorated_immediately",
        });
      } catch (retryError: any) {
        if (retryError?.error?.code === "PREVIOUS_PAYMENT_PENDING") {
          return {
            code: "PAYMENT_PENDING",
            error:
              "Please wait for your previous payment to complete before changing plans.",
            status: 409,
          };
        }
        throw retryError;
      }
    } else {
      throw changePlanError;
    }
  }
}

async function ensureCustomerId(
  user: User & { subscription: Subscription | null },
) {
  if (!user?.subscription) {
    throw new Error("Subscription not found");
  }
  if (user.subscription.subscriptionCustomerId) {
    // TODO: check if this customer id is set at any time in the db (webhooks)
    return user.subscription.subscriptionCustomerId;
  }

  const page = await dodoClient.customers.list({
    email: user.email,
    page_number: 1,
    page_size: 1,
  });
  const customer = page?.items?.[0] as Customer | undefined;
  if (!customer) {
    const created = await dodoClient.customers.create({
      email: user.email,
      name: user.name,
    });
    const createdId = created.customer_id;
    await db.subscription.update({
      where: { id: user.subscription.id },
      data: { subscriptionCustomerId: createdId },
    });
    return createdId;
  }
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
  if (!user) {
    throw new Error("User not found");
  }
  const customerId = await ensureCustomerId(user);
  const session = await dodoClient.customers.customerPortal.create(customerId); // TODO: in the long run, we can save this for 24h
  if (!session.link) {
    throw new Error("Failed to read portal link");
  }
  return session.link;
}

export async function subscribe(req: Request, res: Response) {
  try {
    const parse = billingSubscribeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { plan } = parse.data;

    const userId = req.userId!;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId =
      plan === "pro" ? env.DODO_PRO_PRODUCT_ID : env.DODO_PREMIUM_PRODUCT_ID;

    logger.info(`[BILLING] Subscribe request received`, {
      userId,
      requestedPlan: plan,
      productId,
    });

    const existingSubscriptionId = user.subscription?.subscriptionId;
    const isActive = user.subscription?.status === "ACTIVE";
    const currentTier = user.subscription?.tier;
    const requestedTier = plan.toUpperCase() as SubscriptionTier;
    const isSameTier = currentTier === requestedTier;

    logger.info(`[BILLING] Subscription state check`, {
      existingSubscriptionId: existingSubscriptionId ?? "NONE",
      subscriptionStatus: user.subscription?.status ?? "NO_SUBSCRIPTION",
      isActive,
      currentTier: currentTier ?? "NONE",
      requestedTier,
      isSameTier,
    });

    const isChangingPlan = existingSubscriptionId && isActive && !isSameTier;

    logger.info(`[BILLING] isChangingPlan evaluation`, {
      hasSubscriptionId: !!existingSubscriptionId,
      isActive,
      isDifferentTier: !isSameTier,
      isChangingPlan: !!isChangingPlan,
    });

    if (isChangingPlan) {
      logger.info(`[BILLING] ➡️ Entering plan change flow`);
      const error = await attemptChangePlan(existingSubscriptionId, productId);
      if (error) {
        logger.error(`[BILLING] ❌ Plan change failed`, { error });
        return res.status(error.status).json({ error: error.error });
      }

      const newTier = plan === "pro" ? "PRO" : "PREMIUM";
      await db.subscription.update({
        where: { userId },
        data: { tier: newTier as SubscriptionTier },
      });

      logger.info(`[BILLING] ✅ Plan changed successfully to ${newTier}`);
      return res.status(200).json({
        success: true,
        message: "Plan changed successfully",
        planChanged: true,
      });
    }

    if (existingSubscriptionId && isActive) {
      logger.warn(
        `[BILLING] ⚠️ User already has active subscription with same plan`,
        {
          existingSubscriptionId,
          currentTier,
          requestedTier,
        },
      );
      return res.status(400).json({
        error: "You already have an active subscription with this plan.",
      });
    }

    logger.info(
      `[BILLING] ➡️ Creating new checkout session (no active subscription or resubscribing)`,
    );

    const baseReturn = env.FRONTEND_URL;
    const returnUrl = `${baseReturn.replace(/\/+$/, "")}/billing/result`;

    const existingCustomerId = user.subscription?.subscriptionCustomerId;

    const session = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      ...(existingCustomerId && { customer_id: existingCustomerId }),
      customer: { email: user.email, name: user.name },
      return_url: returnUrl,
      show_saved_payment_methods: true,
      metadata: {
        user_id: userId,
        plan_code: plan,
        source: "backend_subscribe_endpoint",
      },
    });

    if (!session?.checkout_url) {
      return res
        .status(500)
        .json({ error: "Failed to create checkout session URL" });
    }

    return res.status(200).json({ url: session.checkout_url });
  } catch (error) {
    logger.error("[BILLING] Subscribe failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const url = await createCustomerPortalUrl(userId);
    return res.status(200).json({ url: `${url}?focus=cancel` });
  } catch (err) {
    logger.error("Failed to create cancel link:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function manageSubscription(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const url = await createCustomerPortalUrl(userId);
    return res.status(200).json({ url });
  } catch (err) {
    logger.error("Failed to create manage link:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function previewPlanChange(req: Request, res: Response) {
  try {
    const parse = billingSubscribeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { plan } = parse.data;
    const userId = req.userId!;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const existingSubscriptionId = user.subscription?.subscriptionId;
    const isActive = user.subscription?.status === "ACTIVE";
    const currentTier = user.subscription?.tier ?? "FREE";

    const productId =
      plan === "pro" ? env.DODO_PRO_PRODUCT_ID : env.DODO_PREMIUM_PRODUCT_ID;
    const newTier = plan.toUpperCase() as SubscriptionTier;

    if (!existingSubscriptionId || !isActive) {
      return res.status(200).json({
        canPreview: false,
        isNewSubscription: true,
        currentTier,
        newTier,
        message: "New subscription - checkout required",
      });
    }

    if (currentTier === newTier) {
      return res.status(400).json({
        error: "You are already on this plan",
      });
    }

    try {
      const preview = await dodoClient.subscriptions.previewChangePlan(
        existingSubscriptionId,
        {
          product_id: productId,
          quantity: 1,
          proration_billing_mode: "prorated_immediately",
        },
      );

      const isUpgrade =
        (currentTier === "FREE" &&
          (newTier === "PRO" || newTier === "PREMIUM")) ||
        (currentTier === "PRO" && newTier === "PREMIUM");

      return res.status(200).json({
        canPreview: true,
        isNewSubscription: false,
        currentTier,
        newTier,
        isUpgrade,
        immediateCharge: (preview as any).immediate_charge ?? null,
        credit: (preview as any).credit ?? null,
        summary: (preview as any).immediate_charge?.summary ?? null,
      });
    } catch (previewError: any) {
      logger.error("[BILLING] Preview failed:", previewError);

      if (previewError?.error?.code === "PREVIOUS_PAYMENT_PENDING") {
        return res.status(409).json({
          error:
            "Please wait for your previous payment to complete before changing plans.",
          code: "PAYMENT_PENDING",
          retryAfterSeconds: 120,
        });
      }

      return res.status(200).json({
        canPreview: true,
        isNewSubscription: false,
        currentTier,
        newTier,
        isUpgrade:
          (currentTier === "FREE" &&
            (newTier === "PRO" || newTier === "PREMIUM")) ||
          (currentTier === "PRO" && newTier === "PREMIUM"),
        fallback: true,
        message: "Preview unavailable, plan change will be prorated",
      });
    }
  } catch (error) {
    logger.error("Preview plan change failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
