import { Request, Response } from "express";
import { billingSubscribeSchema } from "../types/schema";
import db from "../lib/db";
import { env } from "../env";
import { Subscription, SubscriptionTier } from "@prisma/client";
import dodoClient from "../lib/dodo";
import { Customer } from "dodopayments/resources/customers";
import { User } from "@prisma/client";

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
    await dodoClient.subscriptions.changePlan(existingSubscriptionId, {
      product_id: productId,
      quantity: 1,
      proration_billing_mode: "prorated_immediately",
    });
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

    const existingSubscriptionId = user.subscription?.subscriptionId;
    const isActive = user.subscription?.status === "ACTIVE";
    const isChangingPlan =
      existingSubscriptionId &&
      isActive &&
      user.subscription?.tier !== (plan.toUpperCase() as SubscriptionTier);

    if (isChangingPlan) {
      const error = await attemptChangePlan(existingSubscriptionId, productId);
      if (error) {
        return res.status(error.status).json({ error: error.error });
      }

      const newTier = plan === "pro" ? "PRO" : "PREMIUM";
      await db.subscription.update({
        where: { userId },
        data: { tier: newTier as SubscriptionTier },
      });

      return res.status(200).json({
        success: true,
        message: "Plan changed successfully",
        planChanged: true,
      });
    }

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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const url = await createCustomerPortalUrl(userId);
    return res.status(200).json({ url: `${url}?focus=cancel` });
  } catch (err) {
    console.error("Failed to create cancel link:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function manageSubscription(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const url = await createCustomerPortalUrl(userId);
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Failed to create manage link:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
