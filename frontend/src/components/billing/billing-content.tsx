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
import { BillingActions } from "@/components/billing/actions";
import {
  BILLING_PLANS,
  PLAN_ORDER,
  type BillingTier,
} from "@/constants/pricing";
import { Check } from "lucide-react";

export async function BillingContent() {
  const [scheduleLimits, usageSummary] = await Promise.all([
    getScheduleLimits(),
    getUsageSummary(),
  ]);

  const usagePayload = usageSummary?.payload ?? null;
  const activeTier = (usagePayload?.tier ??
    scheduleLimits?.tier ??
    "FREE") as BillingTier;
  const fallbackPlan = BILLING_PLANS[activeTier];
  const usageSnapshot = {
    dailyUsed: usagePayload?.dailyUsed ?? 0,
    dailyLimit: usagePayload?.dailyLimit ?? fallbackPlan.dailyLimit,
    monthlyUsed: usagePayload?.monthlyUsed ?? 0,
    monthlyLimit: usagePayload?.monthlyLimit ?? fallbackPlan.monthlyLimit,
  };

  const isFreeTier = activeTier === "FREE";

  return (
    <div className="flex flex-col gap-8 pb-12">
      <section className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm md:p-8">
        <div className="bg-primary/5 pointer-events-none absolute top-0 -right-10 h-64 w-64 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col gap-6">
          <DashboardPageHeader
            title="Billing & Subscription"
            description="Manage your plan, track usage quotas, and unlock more capacity."
          />
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Billing flows are securely handled by Dodo Payments. Upgrade to
            higher tiers to increase your daily scrape limits and gain access to
            premium features like CSV exports and dedicated support.
          </p>

          {isFreeTier && (
            <div className="mt-4 max-w-2xl rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                🎉 Beta users lock in their discounted price for life.
              </p>
            </div>
          )}
        </div>
      </section>

      {!isFreeTier && (
        <section className="grid gap-6">
          <BillingActions />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BillingPanel
          tier={activeTier}
          usage={{
            dailyUsed: usageSnapshot.dailyUsed,
            dailyLimit: usageSnapshot.dailyLimit,
            monthlyUsed: usageSnapshot.monthlyUsed,
            monthlyLimit: usageSnapshot.monthlyLimit,
          }}
        />

        <Card className="border-border bg-card h-fit rounded-3xl border shadow-sm">
          <CardHeader className="border-border/50 border-b pb-4">
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Compare tier limits and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-4">
              {PLAN_ORDER.map((tier) => {
                const plan = BILLING_PLANS[tier];
                const isActive = tier === activeTier;
                return (
                  <div
                    key={tier}
                    className={`rounded-2xl border p-5 transition-all ${
                      isActive
                        ? "border-primary/50 bg-primary/5 ring-primary/20 ring-1"
                        : "border-border/60 bg-muted/20 hover:border-border"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-foreground font-semibold">
                            {plan.label}
                          </h4>
                          {isActive && (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 h-5 px-1.5 text-[10px]"
                            >
                              CURRENT
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 max-w-[200px] text-xs leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{plan.price}</p>
                        {plan.price !== "$0" && (
                          <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                            /month
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-border/40 mt-3 space-y-2 border-t pt-2">
                      <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground font-medium">
                            {plan.dailyLimit}
                          </span>{" "}
                          scrapes/day
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground font-medium">
                            {plan.monthlyLimit}
                          </span>{" "}
                          /month
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                        {plan.features.slice(0, 3).map((feature, i) => (
                          <div
                            key={i}
                            className="text-muted-foreground/80 flex items-center gap-1 text-[11px]"
                          >
                            <Check className="text-primary h-3 w-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
