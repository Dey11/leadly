import type { Request, Response } from "express";
import {
  Webhook,
  type WebhookUnbrandedRequiredHeaders,
} from "standardwebhooks";
import { env } from "../env";
import { getRedis } from "../lib/redis";
import db from "../lib/db";
import { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { initializeOrResetUsagePeriod } from "../lib/usage";
import { sendTransactionToDiscord } from "../lib/discord";

export async function dodoWebhookHandler(req: Request, res: Response) {
  try {
    const headers: WebhookUnbrandedRequiredHeaders = {
      "webhook-id": (req.header("webhook-id") || "") as string,
      "webhook-signature": (req.header("webhook-signature") || "") as string,
      "webhook-timestamp": (req.header("webhook-timestamp") || "") as string,
    };

    if (
      !headers["webhook-id"] ||
      !headers["webhook-signature"] ||
      !headers["webhook-timestamp"]
    ) {
      return res
        .status(400)
        .json({ error: "Missing webhook signature headers" });
    }

    // express.raw({ type: 'application/json' }) gives Buffer
    const raw = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});
    const redis = getRedis();
    const idemKey = `dodo:webhooks:${headers["webhook-id"]}`;
    const created = await redis.setnx(idemKey, "1"); // 1 if key set, 0 if exists
    if (created === 0) {
      // already processed
      return res.status(200).json({ received: true, duplicate: true });
    }
    await redis.expire(idemKey, 60 * 60); // 1 hour TTL

    const webhook = new Webhook(env.DODO_WEBHOOK_SECRET);
    let payload: any;
    try {
      // verify returns the parsed payload when verification succeeds
      payload = await webhook.verify(raw, headers);
    } catch (e: unknown) {
      console.error("Invalid webhook signature:", e);
      return res.status(400).json({ error: "Invalid signature" });
    }

    const type: string = payload?.type || payload?.event_type || "";
    // Common fields we may use
    const data = payload?.data ?? payload?.object ?? {};

    // Extract customer_id from multiple possible paths in Dodo payload
    const customerId: string | undefined =
      (data?.customer_id as string | undefined) ??
      (data?.customer?.customer_id as string | undefined) ??
      (payload?.customer_id as string | undefined) ??
      undefined;

    const subscriptionId: string | undefined =
      data?.subscription_id || data?.id;
    const planCode: string | undefined =
      data?.plan_code || data?.metadata?.plan || data?.metadata?.plan_code;

    const userId = (data?.metadata?.user_id as string | undefined) ?? undefined;

    const mapPlanToTier = (pc?: string): SubscriptionTier | undefined => {
      if (!pc) return undefined;
      const norm = String(pc).toLowerCase();
      if (norm === "pro") return SubscriptionTier.PRO;
      if (norm === "premium") return SubscriptionTier.PREMIUM;
      if (norm === "free") return SubscriptionTier.FREE;
      return undefined;
    };

    const parsePeriodEnd = (): Date | undefined => {
      const raw =
        (data?.current_period_end as string | undefined) ??
        (data?.current_period_ends_at as string | undefined) ??
        (data?.period_end as string | undefined);
      if (raw) {
        const t = Date.parse(raw);
        if (!Number.isNaN(t)) return new Date(t);
      }
      // Fallback placeholder; exact boundary should come from Dodo event payload
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    };

    const getBillingDetails = (payloadData: any) => {
      const customer = payloadData?.customer ?? {};
      const metadata = payloadData?.metadata ?? {};
      const name =
        customer?.name ??
        payloadData?.customer_name ??
        metadata?.billing_name ??
        undefined;
      const email =
        customer?.email ??
        payloadData?.customer_email ??
        metadata?.billing_email ??
        undefined;
      const phone =
        customer?.phone_number ??
        payloadData?.customer_phone_number ??
        metadata?.billing_phone ??
        undefined;
      const addressFields =
        payloadData?.billing_address ??
        payloadData?.address ??
        metadata?.billing_address ??
        undefined;
      const address =
        addressFields && typeof addressFields === "object"
          ? JSON.stringify(addressFields)
          : (addressFields ?? undefined);
      return {
        billingName: name ?? undefined,
        billingEmail: email ?? undefined,
        billingPhone: phone ?? undefined,
        billingAddress: address,
      };
    };

    const billingDetails = getBillingDetails(data);
    console.log(
      "[Dodo Webhook] billingDetails:",
      JSON.stringify(billingDetails),
    );
    const attachCustomerId = async (userId: string, id?: string) => {
      if (!id) return;
      try {
        await db.subscription.update({
          where: { userId },
          data: { subscriptionCustomerId: id },
        });
      } catch {}
    };

    switch (type) {
      case "subscription.active": {
        if (userId) {
          const tier = mapPlanToTier(planCode) ?? SubscriptionTier.PRO;
          const periodEnd = parsePeriodEnd()!;

          // Wrap subscription + usage update in transaction
          await db.$transaction(async (tx) => {
            await tx.subscription.upsert({
              where: { userId },
              create: {
                userId,
                subscriptionId: subscriptionId ?? undefined,
                status: SubscriptionStatus.ACTIVE,
                tier,
                currentPeriodEnd: periodEnd,
                subscriptionCustomerId: customerId ?? undefined,
                ...billingDetails,
              },
              update: {
                subscriptionId: subscriptionId ?? undefined,
                status: SubscriptionStatus.ACTIVE,
                tier,
                currentPeriodEnd: periodEnd,
                subscriptionCustomerId: customerId ?? undefined,
                ...billingDetails,
              },
            });

            await initializeOrResetUsagePeriod(
              tx,
              userId,
              tier,
              undefined,
              periodEnd,
            );
          });

          // Notify Discord
          db.user
            .findUnique({
              where: { id: userId },
              select: { name: true, email: true, isDeleted: true },
            })
            .then((user) => {
              if (user && !user.isDeleted) {
                sendTransactionToDiscord({
                  type: "subscription.active",
                  tier,
                  user: { name: user.name, email: user.email },
                  subscriptionId,
                  periodEnd,
                });
              }
            })
            .catch((e) => console.error("Discord notify failed", e));

          console.log(
            JSON.stringify({
              evt: "subscription.active.persisted",
              userId,
              tier,
              subscriptionId,
              periodEnd,
            }),
          );
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.active.no_user_id",
              subscriptionId,
            }),
          );
        }
        break;
      }
      case "subscription.renewed": {
        if (userId) {
          const periodEnd = parsePeriodEnd()!;
          let tierForReset: SubscriptionTier = SubscriptionTier.PRO;

          // Get existing tier first
          try {
            const existing = await db.subscription.findUnique({
              where: { userId },
            });
            if (existing?.tier) {
              tierForReset = existing.tier;
            }
          } catch {}

          // Wrap subscription + usage update in transaction
          await db.$transaction(async (tx) => {
            // Try update, create if doesn't exist
            try {
              await tx.subscription.update({
                where: { userId },
                data: {
                  status: SubscriptionStatus.ACTIVE,
                  currentPeriodEnd: periodEnd,
                  ...billingDetails,
                },
              });
            } catch {
              await tx.subscription.create({
                data: {
                  userId,
                  status: SubscriptionStatus.ACTIVE,
                  tier: tierForReset,
                  subscriptionId: subscriptionId ?? undefined,
                  currentPeriodEnd: periodEnd,
                  ...billingDetails,
                },
              });
            }

            await initializeOrResetUsagePeriod(
              tx,
              userId,
              tierForReset,
              undefined,
              periodEnd,
            );
          });

          // Notify Discord
          db.user
            .findUnique({
              where: { id: userId },
              select: { name: true, email: true, isDeleted: true },
            })
            .then((user) => {
              if (user && !user.isDeleted) {
                sendTransactionToDiscord({
                  type: "subscription.renewed",
                  tier: tierForReset,
                  user: { name: user.name, email: user.email },
                  subscriptionId,
                  periodEnd,
                });
              }
            })
            .catch((e) => console.error("Discord notify failed", e));

          console.log(
            JSON.stringify({
              evt: "subscription.renewed.persisted",
              userId,
              subscriptionId,
              periodEnd,
              tierForReset,
            }),
          );
          await attachCustomerId(userId, customerId);
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.renewed.no_user_id",
              subscriptionId,
            }),
          );
        }
        break;
      }
      case "subscription.plan_changed": {
        if (userId) {
          const end = parsePeriodEnd();

          const existing = await db.subscription.findUnique({
            where: { userId },
          });

          if (existing) {
            await db.$transaction(async (tx) => {
              await tx.subscription.update({
                where: { userId },
                data: {
                  currentPeriodEnd: end ?? existing.currentPeriodEnd,
                },
              });

              await initializeOrResetUsagePeriod(
                tx,
                userId,
                existing.tier,
                undefined,
                end,
              );
            });

            // Notify Discord
            db.user
              .findUnique({
                where: { id: userId },
                select: { name: true, email: true, isDeleted: true },
              })
              .then((user) => {
                if (user && !user.isDeleted) {
                  sendTransactionToDiscord({
                    type: "subscription.plan_changed",
                    tier: existing.tier,
                    user: { name: user.name, email: user.email },
                    subscriptionId,
                    periodEnd: end,
                  });
                }
              })
              .catch((e) => console.error("Discord notify failed", e));

            console.log(
              JSON.stringify({
                evt: "subscription.plan_changed.persisted",
                userId,
                tier: existing.tier,
                subscriptionId,
                periodEnd: end,
              }),
            );
            await attachCustomerId(userId, customerId);
          } else {
            console.warn(
              JSON.stringify({
                warn: "subscription.plan_changed.no_existing_subscription",
                userId,
                planCode,
              }),
            );
          }
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.plan_changed.no_user_id",
              subscriptionId,
              planCode,
            }),
          );
        }
        break;
      }
      case "subscription.on_hold": {
        if (userId && subscriptionId) {
          const existing = await db.subscription.findUnique({
            where: { userId },
          });
          if (existing?.subscriptionId === subscriptionId) {
            await db.subscription
              .update({
                where: { userId },
                data: { status: SubscriptionStatus.PAST_DUE },
              })
              .catch(() => {});

            db.user
              .findUnique({
                where: { id: userId },
                select: { name: true, email: true, isDeleted: true },
              })
              .then((user) => {
                if (user && !user.isDeleted) {
                  sendTransactionToDiscord({
                    type: "subscription.on_hold",
                    tier: existing.tier ?? "UNKNOWN",
                    user: { name: user.name, email: user.email },
                    subscriptionId,
                  });
                }
              })
              .catch((e) => console.error("Discord notify failed", e));

            console.log(
              JSON.stringify({
                evt: "subscription.on_hold.persisted",
                userId,
                subscriptionId,
              }),
            );
          }
        }
        break;
      }
      case "subscription.cancelled": {
        if (userId && subscriptionId) {
          const existing = await db.subscription.findUnique({
            where: { userId },
          });
          if (existing?.subscriptionId === subscriptionId) {
            await db.subscription
              .update({
                where: { userId },
                data: {
                  status: SubscriptionStatus.CANCELLED,
                  tier: SubscriptionTier.FREE,
                },
              })
              .catch(() => {});

            db.user
              .findUnique({
                where: { id: userId },
                select: { name: true, email: true, isDeleted: true },
              })
              .then((user) => {
                if (user && !user.isDeleted) {
                  sendTransactionToDiscord({
                    type: "subscription.cancelled",
                    tier: existing.tier ?? "UNKNOWN",
                    user: { name: user.name, email: user.email },
                    subscriptionId,
                  });
                }
              })
              .catch((e) => console.error("Discord notify failed", e));

            console.log(
              JSON.stringify({
                evt: "subscription.cancelled.persisted",
                userId,
                subscriptionId,
              }),
            );
          } else {
            console.log(
              JSON.stringify({
                evt: "subscription.cancelled.skipped",
                reason: "subscriptionId_mismatch",
                userId,
                webhookSubscriptionId: subscriptionId,
                storedSubscriptionId: existing?.subscriptionId,
              }),
            );
          }
        }
        break;
      }
      case "subscription.failed": {
        if (userId && subscriptionId) {
          const existing = await db.subscription.findUnique({
            where: { userId },
          });
          if (existing?.subscriptionId === subscriptionId) {
            await db.subscription
              .update({
                where: { userId },
                data: { status: SubscriptionStatus.INCOMPLETE },
              })
              .catch(() => {});

            db.user
              .findUnique({
                where: { id: userId },
                select: { name: true, email: true, isDeleted: true },
              })
              .then((user) => {
                if (user && !user.isDeleted) {
                  sendTransactionToDiscord({
                    type: "subscription.failed",
                    tier: existing.tier ?? "UNKNOWN",
                    user: { name: user.name, email: user.email },
                    subscriptionId,
                  });
                }
              })
              .catch((e) => console.error("Discord notify failed", e));

            console.log(
              JSON.stringify({
                evt: "subscription.failed.persisted",
                userId,
                subscriptionId,
              }),
            );
          }
        }
        break;
      }
      default: {
        // Unknown/unsupported event: no-op
        console.log(JSON.stringify({ evt: "webhook.unhandled", type }));
        break;
      }
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return res.status(200).json({ received: true, error: "handled_error" });
  }
}
