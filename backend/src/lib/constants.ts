import { SubscriptionTier } from "@prisma/client";

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
