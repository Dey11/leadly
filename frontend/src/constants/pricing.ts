import type { UsageSummaryResponse } from "@/types/backend";
import { SUPPORT_EMAIL } from "@/constants/config";

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
    trialInfo?: string;
    betaLockIn?: string;
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
    features: [
      "Monitor 3 subreddits",
      "1 AI-powered scrape/day",
      "AI relevance scoring",
      "Lead dashboard access",
    ],
    ctaLabel: "Start Free",
    href: "/dashboard/billing",
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
    features: [
      "Everything in Free +",
      "Monitor 10 subreddits",
      "6 scrapes/day",
      "Advanced AI filters w/ reasoning",
      "Priority email support",
    ],
    ctaLabel: "Start 3-Day Trial",
    href: "/dashboard/billing",
    originalPrice: "$9",
    discountLabel: "50% Beta Discount",
    trialInfo: "3-day free trial",
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
    features: [
      "Everything in Pro +",
      "Monitor 20 subreddits",
      "24 scrapes/day (near real-time)",
      "CSV export for your CRM",
      "Priority feature access",
      "Free credits on new features",
    ],
    ctaLabel: "Start 3-Day Trial",
    href: "/dashboard/billing",
    originalPrice: "$24",
    discountLabel: "50% Beta Discount",
    trialInfo: "3-day free trial",
    betaLockIn: "Lock in this price forever",
  },
};

export const PLAN_ORDER: BillingTier[] = ["FREE", "PRO", "PREMIUM"];
