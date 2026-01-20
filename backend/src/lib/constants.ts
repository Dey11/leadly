import { SubscriptionTier } from "@prisma/client";
import { env } from "../env";

export const MIN_RELEVANCE_SCORE = 0.7;
export const MAX_SCRAPE_POSTS_LIMIT = 50;

/**
 * Default allowed hours per day for each tier.
 * - FREE: 1 run/day
 * - PRO: 6 runs/day
 * - PREMIUM: 24 runs/day
 */
export const DEFAULT_HOURS_MAP = {
  FREE: [12], // 1 per day
  PRO: [0, 4, 8, 12, 16, 20], // 6 per day
  PREMIUM: [
    // 24 per day
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
} as const;

/**
 * Plan limits mapping to your business policy:
 * - FREE: 3 subreddits, 1 scrape/day -> 30/month
 * - PRO: 10 subreddits, 6 scrapes/day -> 180/month
 * - PREMIUM: 20 subreddits, 24 scrapes/day -> 720/month
 */
export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    monitors: number; // subreddit cap
    scrapesPerDay: number;
    selectableHours: number; // maximum hours user can select in schedule
    monthlyScrapeLimit: number; // derived monthly limit
    maxIcps: number; // maximum ICPs user can create
  }
> = {
  FREE: {
    monitors: 3,
    scrapesPerDay: 1,
    selectableHours: 1,
    monthlyScrapeLimit: 30,
    maxIcps: 25,
  },
  PRO: {
    monitors: 10,
    scrapesPerDay: 6,
    selectableHours: 6,
    monthlyScrapeLimit: 180,
    maxIcps: 50,
  },
  PREMIUM: {
    monitors: 20,
    scrapesPerDay: 24,
    selectableHours: 24,
    monthlyScrapeLimit: 720,
    maxIcps: 100,
  },
} as const;

export const MODEL_LITE = "gemini-2.0-flash-lite";
export const MODEL = "gemini-flash-latest";
export const CRON_INTERVAL = "0 * * * *";

// Retry settings for failed scrape jobs
export const MAX_SCRAPE_RETRY_COUNT = 3;
export const SCRAPE_RETRY_DELAY_MS = 60 * 60 * 1000;

// Stuck pending job threshold (6 hours) - jobs stuck in PENDING bypass Redis
export const STUCK_PENDING_THRESHOLD_MS = 6 * 60 * 60 * 1000;

export const WEBHOOK_EVENTS = {
  // Payment events
  PAYMENT_SUCCEEDED: "payment.succeeded", // Triggered when a payment is successfully processed.
  PAYMENT_FAILED: "payment.failed", // Occurs when a payment attempt fails due to errors, declined cards, or other issues.
  PAYMENT_PROCESSING: "payment.processing", // Indicates that a payment is currently being processed.
  PAYMENT_CANCELLED: "payment.cancelled", // Triggered when a payment is cancelled before completion.

  // Subscription events
  SUBSCRIPTION_ACTIVE: "subscription.active", // Indicates that a subscription is now active and recurring charges are scheduled.
  SUBSCRIPTION_UPDATED: "subscription.updated", // Triggered when any subscription field is updated (real-time sync without polling).
  SUBSCRIPTION_ON_HOLD: "subscription.on_hold", // Triggered when a subscription is temporarily put on hold due to failed renewal.
  SUBSCRIPTION_RENEWED: "subscription.renewed", // Occurs when a subscription is successfully renewed.
  SUBSCRIPTION_PLAN_CHANGED: "subscription.plan_changed", // Triggered when a subscription is upgraded, downgraded, or modified with different addons.
  SUBSCRIPTION_CANCELLED: "subscription.cancelled", // Triggered when a subscription is cancelled by the merchant or customer.
  SUBSCRIPTION_FAILED: "subscription.failed", // Indicates a failed subscription. This means that we were unable to create a mandate.
  SUBSCRIPTION_EXPIRED: "subscription.expired", // Triggered when a subscription reaches the end of its term and expires.
} as const;

export const SUPPORT_EMAIL = "leadly.helpdesk@gmail.com";

export const PLANS_MAP = {
  FREE: "",
  PRO: env.DODO_PRO_PRODUCT_ID,
  PREMIUM: env.DODO_PREMIUM_PRODUCT_ID,
};

export const WEBHOOK_MAX_RETRY_COUNT = 3;
