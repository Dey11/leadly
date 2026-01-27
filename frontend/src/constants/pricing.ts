import type { UsageSummaryResponse } from "@/types/backend";
export type BillingTier = UsageSummaryResponse["payload"]["tier"];

export const BILLING_PLANS: Record<
  BillingTier,
  {
    label: string;
    price: string;
    description: string;
    dailyLimit: number;
    monthlyLimit: number;
    subreddits: string;
    onDemandLabel: string;
    features: string[];
    monthlyPriceInt: number;
    ctaLabel: string;
    href: string;
    originalPrice?: string;
    discountLabel?: string;
    betaLockIn?: string;
    // Keyword limits
    keywordSets: number;
    keywordMonitors: number;
    keywordsPerSet: number;
    keywordDailyLimit: number;
    keywordMonthlyLimit: number;
  }
> = {
  FREE: {
    label: "Free",
    price: "$0",
    monthlyPriceInt: 0,
    description: "Explore Leadly with basic Reddit monitoring.",
    dailyLimit: 1,
    monthlyLimit: 30,
    subreddits: "3 subreddits",
    onDemandLabel: "On-demand coming soon",
    keywordSets: 1,
    keywordMonitors: 1,
    keywordsPerSet: 6,
    keywordDailyLimit: 1,
    keywordMonthlyLimit: 30,
    features: [
      // Lead Gen Mode
      "Lead Gen: Track up to 3 subreddits",
      "Lead Gen: 1 scrape/day (30/month)",
      "Lead Gen: AI relevance scoring",
      // Keyword Mode
      "Keywords: 1 keyword set with 6 keywords",
      "Keywords: 1 subreddit monitor",
      // General
      "Lead dashboard access",
    ],
    ctaLabel: "Start Free",
    href: "/dashboard/settings?tab=billing",
  },
  PRO: {
    label: "Pro",
    price: "$4.50",
    monthlyPriceInt: 4.5,
    description: "Catch more leads, faster. For growing teams.",
    dailyLimit: 6,
    monthlyLimit: 180,
    subreddits: "10 subreddits",
    onDemandLabel: "10 on-demand scrapes/month (coming soon)",
    keywordSets: 3,
    keywordMonitors: 3,
    keywordsPerSet: 15,
    keywordDailyLimit: 6,
    keywordMonthlyLimit: 180,
    features: [
      "Everything in Free +",
      // Lead Gen Mode
      "Lead Gen: Track up to 10 subreddits",
      "Lead Gen: 6 scrapes/day (180/month)",
      "Lead Gen: AI filters with reasoning",
      // Keyword Mode
      "Keywords: 3 keyword sets (15 keywords each)",
      "Keywords: 3 subreddit monitors",
      // General
      "Priority email support",
    ],
    ctaLabel: "Get Started",
    href: "/dashboard/settings?tab=billing",
    originalPrice: "$9",
    discountLabel: "50% Beta Discount",
    betaLockIn: "Lock in this price forever",
  },
  PREMIUM: {
    label: "Premium",
    price: "$12",
    monthlyPriceInt: 12,
    description: "Near real-time monitoring for serious teams.",
    dailyLimit: 24,
    monthlyLimit: 720,
    subreddits: "20 subreddits",
    onDemandLabel: "30 on-demand scrapes/month (coming soon)",
    keywordSets: 10,
    keywordMonitors: 10,
    keywordsPerSet: 30,
    keywordDailyLimit: 24,
    keywordMonthlyLimit: 720,
    features: [
      "Everything in Pro +",
      // Lead Gen Mode
      "Lead Gen: Track up to 20 subreddits",
      "Lead Gen: 24 scrapes/day (720/month)",
      // Keyword Mode
      "Keywords: 10 keyword sets (30 keywords each)",
      "Keywords: 10 subreddit monitors",
      // General
      "CSV export for your CRM",
      "Priority feature access",
    ],
    ctaLabel: "Get Started",
    href: "/dashboard/settings?tab=billing",
    originalPrice: "$24",
    discountLabel: "50% Beta Discount",
    betaLockIn: "Lock in this price forever",
  },
};

export const PLAN_ORDER: BillingTier[] = ["FREE", "PRO", "PREMIUM"];
