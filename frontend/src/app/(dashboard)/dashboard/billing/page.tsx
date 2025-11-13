import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { BillingPanel } from "@/components/account/billing-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getScheduleLimits, getUsageSummary } from "@/lib/backend-queries";
import type { UsageSummaryResponse } from "@/types/backend";

type BillingTier = UsageSummaryResponse["payload"]["tier"];

const billingPlanDefinitions: Record<
  BillingTier,
  {
    label: string;
    price: string;
    description: string;
    dailyLimit: number;
    monthlyLimit: number;
    subreddits: string;
    onDemandLabel: string;
  }
> = {
  FREE: {
    label: "Free",
    price: "$0",
    description: "Baseline tooling for founders and lean GTM teams.",
    dailyLimit: 1,
    monthlyLimit: 30,
    subreddits: "3 subreddits",
    onDemandLabel: "On-demand coming soon",
  },
  PRO: {
    label: "Pro",
    price: "$9 / month",
    description: "6 scrapes/day and expanded filters for growing pods.",
    dailyLimit: 6,
    monthlyLimit: 180,
    subreddits: "10 subreddits",
    onDemandLabel: "10 on-demand scrapes/month (coming soon)",
  },
  PREMIUM: {
    label: "Premium",
    price: "$24 / month",
    description: "24 scrapes/day with priority support and exports.",
    dailyLimit: 24,
    monthlyLimit: 720,
    subreddits: "20 subreddits",
    onDemandLabel: "30 on-demand scrapes/month (coming soon)",
  },
};

const billingPlanOrder: BillingTier[] = ["FREE", "PRO", "PREMIUM"];

export default async function BillingPage() {
  const [scheduleLimits, usageSummary] = await Promise.all([
    getScheduleLimits(),
    getUsageSummary(),
  ]);

  const usagePayload = usageSummary?.payload ?? null;
  const activeTier = (
    usagePayload?.tier ?? scheduleLimits?.tier ?? "FREE"
  ) as BillingTier;
  const fallbackPlan = billingPlanDefinitions[activeTier];
  const usageSnapshot = {
    dailyUsed: usagePayload?.dailyUsed ?? 0,
    dailyLimit: usagePayload?.dailyLimit ?? fallbackPlan.dailyLimit,
    monthlyUsed: usagePayload?.monthlyUsed ?? 0,
    monthlyLimit: usagePayload?.monthlyLimit ?? fallbackPlan.monthlyLimit,
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <section className="border-border/60 bg-card/95 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur md:p-8">
        <div className="bg-primary/15 pointer-events-none absolute top-0 -right-10 h-48 w-48 rounded-full blur-3xl" />
        <div className="flex flex-col gap-6">
          <DashboardPageHeader
            title="Billing"
            description="Review your plan limits, usage, and what the next tier unlocks."
            action={
              <Badge className="bg-primary/10 text-primary">Powered by Dodo</Badge>
            }
          />
          <p className="text-sm text-muted-foreground">
            Billing flows are routed through Dodo Payments so upgrades stay
            flexible and secure. Use this page to see how close you are to your
            current scrape limits and what the higher tiers offer.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <BillingPanel
          tier={activeTier}
          usage={{
            dailyUsed: usageSnapshot.dailyUsed,
            dailyLimit: usageSnapshot.dailyLimit,
            monthlyUsed: usageSnapshot.monthlyUsed,
            monthlyLimit: usageSnapshot.monthlyLimit,
          }}
        />
        <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
          <CardHeader className="border-border/50 border-b pb-4">
            <div>
              <CardTitle>Plan reference</CardTitle>
              <CardDescription>
                Scrape cadence, subreddit coverage, and on-demand limits.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-3">
              {billingPlanOrder.map((tier) => {
                const plan = billingPlanDefinitions[tier];
                const isActive = tier === activeTier;
                return (
                  <div
                    key={tier}
                    className={`rounded-2xl border p-4 ${
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/40 bg-background/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {plan.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {plan.price}
                      </p>
                    </div>
                    <p className="mt-3 text-xs leading-tight text-muted-foreground">
                      {plan.dailyLimit} scrapes/day · {plan.monthlyLimit} per month
                    </p>
                    <p className="text-xs leading-tight text-muted-foreground">
                      {plan.subreddits} · {plan.onDemandLabel}
                    </p>
                    {isActive ? (
                      <Badge
                        variant="outline"
                        className="mt-3 text-[0.65rem] uppercase tracking-wide"
                      >
                        Current tier
                      </Badge>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              On-demand cooldown: 30 minutes between manual scrapes.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
