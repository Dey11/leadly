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

/**x
 * Dodo Payments Webhook Handler
 *
 * Security:
 * - Verifies signature using standardwebhooks (docs: https://docs.dodopayments.com/developer-resources/webhooks)
 * - Uses raw request body (index registers express.raw before json parser)
 * - Idempotency via Redis on "webhook-id" header
 *
 * Events handled (source-of-truth):
 * - subscription.active
 * - subscription.renewed
 * - subscription.plan_changed
 * - subscription.on_hold
 * - subscription.cancelled
 * - subscription.failed
 *
 * References:
 * - Node client init: https://context7.com/dodopayments/dodopayments-node/llms.txt
 * - Webhooks setup and secret retrieval: https://context7.com/dodopayments/dodopayments-node/llms.txt
 * - Express verify example: https://docs.dodopayments.com/developer-resources/webhooks
 */
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
    const subscriptionId: string | undefined =
      data?.subscription_id || data?.id;
    const planCode: string | undefined =
      data?.plan_code || data?.metadata?.plan || data?.metadata?.plan_code;

    console.log(
      "[Dodo Webhook]",
      JSON.stringify({
        type,
        subscriptionId,
        planCode,
      })
    );

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

    switch (type) {
      case "subscription.active": {
        if (userId) {
          const tier = mapPlanToTier(planCode) ?? SubscriptionTier.PRO;
          const periodEnd = parsePeriodEnd()!;
          await db.subscription.upsert({
            where: { userId },
            create: {
              userId,
              subscriptionId: subscriptionId ?? undefined,
              status: SubscriptionStatus.ACTIVE,
              tier,
              currentPeriodEnd: periodEnd,
            },
            update: {
              subscriptionId: subscriptionId ?? undefined,
              status: SubscriptionStatus.ACTIVE,
              tier,
              currentPeriodEnd: periodEnd,
            },
          });
          // Initialize/reset usage window on activation
          await initializeOrResetUsagePeriod(
            userId,
            tier,
            undefined,
            periodEnd
          );
          console.log(
            JSON.stringify({
              evt: "subscription.active.persisted",
              userId,
              tier,
              subscriptionId,
              periodEnd,
            })
          );
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.active.no_user_id",
              subscriptionId,
            })
          );
        }
        break;
      }
      case "subscription.renewed": {
        if (userId) {
          const periodEnd = parsePeriodEnd()!;
          let tierForReset: SubscriptionTier = SubscriptionTier.PRO;
          try {
            const existing = await db.subscription.findUnique({
              where: { userId },
            });
            if (existing?.tier) {
              tierForReset = existing.tier;
            }
          } catch {}
          await db.subscription
            .update({
              where: { userId },
              data: {
                status: SubscriptionStatus.ACTIVE,
                currentPeriodEnd: periodEnd,
              },
            })
            .catch(async () => {
              await db.subscription.create({
                data: {
                  userId,
                  status: SubscriptionStatus.ACTIVE,
                  tier: tierForReset,
                  subscriptionId: subscriptionId ?? undefined,
                  currentPeriodEnd: periodEnd,
                },
              });
            });
          await initializeOrResetUsagePeriod(
            userId,
            tierForReset,
            undefined,
            periodEnd
          );
          console.log(
            JSON.stringify({
              evt: "subscription.renewed.persisted",
              userId,
              subscriptionId,
              periodEnd,
              tierForReset,
            })
          );
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.renewed.no_user_id",
              subscriptionId,
            })
          );
        }
        break;
      }
      case "subscription.plan_changed": {
        if (userId) {
          const tier = mapPlanToTier(planCode);
          if (tier) {
            // Update tier
            await db.subscription
              .update({
                where: { userId },
                data: { tier },
              })
              .catch(async () => {
                await db.subscription.create({
                  data: {
                    userId,
                    status: SubscriptionStatus.ACTIVE,
                    tier,
                    subscriptionId: subscriptionId ?? undefined,
                    currentPeriodEnd: parsePeriodEnd()!,
                  },
                });
              });

            // Reset usage counters on plan change and align to current cycle end if present
            const end = parsePeriodEnd();
            await initializeOrResetUsagePeriod(userId, tier, undefined, end);

            console.log(
              JSON.stringify({
                evt: "subscription.plan_changed.persisted",
                userId,
                tier,
                subscriptionId,
                periodEnd: end,
              })
            );
          } else {
            console.warn(
              JSON.stringify({
                warn: "subscription.plan_changed.unknown_plan",
                userId,
                planCode,
              })
            );
          }
        } else {
          console.warn(
            JSON.stringify({
              warn: "subscription.plan_changed.no_user_id",
              subscriptionId,
              planCode,
            })
          );
        }
        break;
      }
      case "subscription.on_hold": {
        if (userId) {
          await db.subscription
            .update({
              where: { userId },
              data: { status: SubscriptionStatus.PAST_DUE },
            })
            .catch(() => {});
          console.log(
            JSON.stringify({
              evt: "subscription.on_hold.persisted",
              userId,
              subscriptionId,
            })
          );
        }
        break;
      }
      case "subscription.cancelled": {
        if (userId) {
          await db.subscription
            .update({
              where: { userId },
              data: {
                status: SubscriptionStatus.CANCELED,
                tier: SubscriptionTier.FREE,
              },
            })
            .catch(() => {});
          console.log(
            JSON.stringify({
              evt: "subscription.cancelled.persisted",
              userId,
              subscriptionId,
            })
          );
        }
        break;
      }
      case "subscription.failed": {
        if (userId) {
          await db.subscription
            .update({
              where: { userId },
              data: { status: SubscriptionStatus.INCOMPLETE },
            })
            .catch(() => {});
          console.log(
            JSON.stringify({
              evt: "subscription.failed.persisted",
              userId,
              subscriptionId,
            })
          );
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
