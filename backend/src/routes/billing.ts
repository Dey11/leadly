import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../lib/db";
import { authMiddleware } from "../middleware/auth";
import client from "../lib/dodo";
import { env } from "../env";
import type { Customer } from "dodopayments/resources/customers";

// Request body validator
const subscribeSchema = z.object({
  plan: z.enum(["pro", "premium"]),
});

const router = Router();

async function getUserWithSubscription(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  return user;
}

async function ensureCustomerId(
  user: Awaited<ReturnType<typeof getUserWithSubscription>>,
) {
  if (!user?.subscription) {
    throw new Error("Subscription not found");
  }
  if (user.subscription.subscriptionCustomerId) {
    return user.subscription.subscriptionCustomerId;
  }

  const page = await client.customers.list({
    email: user.email,
    page_number: 1,
    page_size: 1,
  });
  const customer = page?.items?.[0] as Customer | undefined;
  if (!customer) {
    const created = await client.customers.create({
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

router.post(
  "/subscribe",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const parse = subscribeSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const userId = req.userId!;
      const user = await getUserWithSubscription(userId);
      if (!user || user.isDeleted) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const plan = parse.data.plan;
      const productId =
        plan === "pro" ? env.DODO_PRO_PRODUCT_ID : env.DODO_PREMIUM_PRODUCT_ID;

      const existingSubscriptionId = user.subscription?.subscriptionId;
      const isActive = user.subscription?.status === "ACTIVE";

      console.log("[Subscribe] Debug:", JSON.stringify({
        userId,
        plan,
        existingSubscriptionId,
        isActive,
        subscriptionStatus: user.subscription?.status,
        tier: user.subscription?.tier,
      }));

      if (existingSubscriptionId && isActive) {
        console.log("[Subscribe] Using changePlan for:", existingSubscriptionId);
        try {
          await client.subscriptions.changePlan(existingSubscriptionId, {
            product_id: productId,
            quantity: 1,
            proration_billing_mode: "prorated_immediately",
          });

          const newTier = plan === "pro" ? "PRO" : "PREMIUM";
          await db.subscription.update({
            where: { userId },
            data: { tier: newTier as any },
          });
          console.log("[Subscribe] Plan changed and DB updated to:", newTier);

          return res.status(200).json({ 
            success: true, 
            message: "Plan changed successfully",
            planChanged: true,
          });
        } catch (changePlanError: any) {
          if (changePlanError?.error?.code === "PREVIOUS_PAYMENT_PENDING") {
            return res.status(409).json({ 
              error: "Plan changes are available after your trial ends.",
              code: "PAYMENT_PENDING",
            });
          }
          throw changePlanError;
        }
      }

      console.log("[Subscribe] Creating new checkout (no active subscription)");

      const baseReturn = env.APP_BASE_URL || env.FRONTEND_URL;
      const returnUrl = `${baseReturn.replace(/\/+$/, "")}/billing/result`;

      const existingCustomerId = user.subscription?.subscriptionCustomerId;
      
      const session = await client.checkoutSessions.create({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        ...(existingCustomerId 
          ? { customer_id: existingCustomerId }
          : { customer: { email: user.email, name: user.name } }
        ),
        return_url: returnUrl,
        show_saved_payment_methods: true,
        metadata: {
          user_id: userId,
          plan_code: plan,
          source: "backend_subscribe_endpoint",
        }
      });

      const s: any = session as any;
      const url = s?.checkout_url || s?.link || s?.url;

      if (!url) {
        return res
          .status(500)
          .json({ error: "Failed to create checkout session URL" });
      }

      return res.status(200).json({ url });
    } catch (err) {
      console.error("Failed to create subscription link:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

async function createCustomerPortalUrl(userId: string) {
  const user = await getUserWithSubscription(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const customerId = await ensureCustomerId(user);
  const session = await client.customers.customerPortal.create(customerId);
  const link = (session as { link?: string }).link;
  if (!link) {
    throw new Error("Failed to read portal link");
  }
  return link;
}

async function createCustomerCancelUrl(userId: string) {
  const url = await createCustomerPortalUrl(userId);
  return `${url}?focus=cancel`;
}

router.post(
  "/portal/manage",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const url = await createCustomerPortalUrl(userId);
      return res.status(200).json({ url });
    } catch (err) {
      console.error("Failed to create portal link:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/portal/cancel",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const url = await createCustomerCancelUrl(userId);
      return res.status(200).json({ url });
    } catch (err) {
      console.error("Failed to create cancel link:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
