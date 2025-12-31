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
  }
> = {
  FREE: {
    label: "Free",
    price: "$0",
    monthlyPriceInt: 0,
    description: "Baseline tooling for founders and lean GTM teams.",
    dailyLimit: 1,
    monthlyLimit: 30,
    subreddits: "3 subreddits",
    onDemandLabel: "On-demand coming soon",
    features: [
      "1 scrape/day",
      "3 subreddits",
      "Daily check cadence",
      "Basic summaries",
    ],
  },
  PRO: {
    label: "Pro",
    price: "$9",
    monthlyPriceInt: 9,
    description: "6 scrapes/day and expanded filters for growing pods.",
    dailyLimit: 6,
    monthlyLimit: 180,
    subreddits: "10 subreddits",
    onDemandLabel: "10 on-demand scrapes/month (coming soon)",
    features: [
      "6 scrapes/day",
      "10 subreddits",
      "Hourly checks",
      "AI email drafting",
      "Priority support",
    ],
  },
  PREMIUM: {
    label: "Premium",
    price: "$24",
    monthlyPriceInt: 24,
    description: "24 scrapes/day with priority support and exports.",
    dailyLimit: 24,
    monthlyLimit: 720,
    subreddits: "20 subreddits",
    onDemandLabel: "30 on-demand scrapes/month (coming soon)",
    features: [
      "24 scrapes/day",
      "20 subreddits",
      "Real-time checks",
      "CSV exports",
      "Dedicated account manager",
    ],
  },
};

export const PLAN_ORDER: BillingTier[] = ["FREE", "PRO", "PREMIUM"];
