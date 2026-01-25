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
    // Lead Gen limits
    monitors: number;
    scrapesPerDay: number;
    selectableHours: number;
    monthlyScrapeLimit: number;
    maxIcps: number;
    // Keyword limits
    keywordMonitors: number;
    maxKeywordSets: number;
    maxKeywordsPerSet: number;
    keywordScrapesPerDay: number;
    keywordMonthlyScrapeLimit: number;
  }
> = {
  FREE: {
    monitors: 3,
    scrapesPerDay: 1,
    selectableHours: 1,
    monthlyScrapeLimit: 30,
    maxIcps: 25,
    keywordMonitors: 1,
    maxKeywordSets: 1,
    maxKeywordsPerSet: 6,
    keywordScrapesPerDay: 1,
    keywordMonthlyScrapeLimit: 30,
  },
  PRO: {
    monitors: 10,
    scrapesPerDay: 6,
    selectableHours: 6,
    monthlyScrapeLimit: 180,
    maxIcps: 50,
    keywordMonitors: 3,
    maxKeywordSets: 3,
    maxKeywordsPerSet: 15,
    keywordScrapesPerDay: 6,
    keywordMonthlyScrapeLimit: 180,
  },
  PREMIUM: {
    monitors: 20,
    scrapesPerDay: 24,
    selectableHours: 24,
    monthlyScrapeLimit: 720,
    maxIcps: 100,
    keywordMonitors: 10,
    maxKeywordSets: 10,
    maxKeywordsPerSet: 30,
    keywordScrapesPerDay: 24,
    keywordMonthlyScrapeLimit: 720,
  },
} as const;

// =============================================================================
// AI PROVIDER CONFIGURATION
// =============================================================================
// Add/remove providers here. Each provider needs:
// - name: Unique identifier used in providerOrder arrays
// - model: Model identifier for the provider
// - liteModel: (optional) Lighter/faster model variant
// - enabled: Set to false to disable without removing

export type AIProviderConfig = {
  name: string;
  model: string;
  liteModel?: string;
  enabled: boolean;
};

/**
 * All available AI providers.
 * To add a new provider:
 *   1. Add config here
 *   2. Add initialization in ai.ts (import SDK, create client)
 *   3. Add to PROVIDERS array in ai.ts
 */
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    name: "gemini",
    model: "gemini-flash-latest",
    liteModel: "gemini-2.0-flash-lite",
    enabled: true,
  },
  {
    name: "wavespeed",
    model: "google/gemini-3-flash-preview",
    enabled: true,
  },
  {
    name: "cerebras",
    model: "zai-glm-4.7",
    enabled: true,
  },
  {
    name: "nebius",
    model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    enabled: true,
  },
] as const;

/**
 * Provider fallback order for ICP generation (fast, user-facing).
 * Order: WaveSpeed → Cerebras → Nebius → Gemini (fallback)
 */
export const AI_PROVIDER_ORDER_ICP: string[] = [
  "cerebras",
  "nebius",
  "gemini",
  "wavespeed",
] as const;

export const CRON_INTERVAL = "0 * * * *"; // 0 hobe first er ta
export const KEYWORD_CRON_INTERVAL = "30 * * * *"; // Keyword: hourly at xx:30

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
