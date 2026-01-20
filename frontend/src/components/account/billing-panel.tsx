"use client";

import { useState } from "react";
import { clientApi } from "@/lib/client/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanChangeDialog } from "@/components/billing/plan-change-dialog";
import { Calendar, AlertCircle } from "lucide-react";
import type { SubscriptionStatus } from "@/types/backend";

type Tier = "FREE" | "PRO" | "PREMIUM";

interface BillingPanelProps {
  tier: Tier;
  status?: SubscriptionStatus;
  renewalDate?: string | null;
  cancelledAtPeriodEnd?: boolean;
  usage: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
  };
}

const STATUS_LABELS: Record<
  SubscriptionStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ACTIVE: { label: "Active", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
  ON_HOLD: { label: "On Hold", variant: "destructive" },
  EXPIRED: { label: "Expired", variant: "secondary" },
  PENDING: { label: "Pending", variant: "outline" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export function BillingPanel(props: BillingPanelProps) {
  const {
    tier,
    status = "ACTIVE",
    renewalDate,
    cancelledAtPeriodEnd = false,
    usage,
  } = props;
  const [loading, setLoading] = useState<"pro" | "premium" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<"pro" | "premium">("pro");
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: "pro" | "premium") {
    // For FREE tier, go directly to checkout (no dialog needed)
    if (tier === "FREE") {
      try {
        setLoading(plan);
        setError(null);
        const res = await clientApi.subscribe(plan);
        if (res && (res as any).url) {
          window.location.href = (res as { url: string }).url;
        }
      } catch (e: any) {
        console.error("Subscribe failed", e);
        setError(e?.message || "Failed to start checkout. Please try again.");
        setLoading(null);
      }
      return;
    }

    // For paid tiers, show confirmation dialog
    setTargetPlan(plan);
    setDialogOpen(true);
  }

  async function handleConfirmPlanChange() {
    setLoading(targetPlan);
    setError(null);
    const res = await clientApi.subscribe(targetPlan);
    if (res && (res as any).planChanged) {
      window.location.reload();
      return;
    }
    if (res && (res as any).url) {
      window.location.href = (res as { url: string }).url;
    }
    setLoading(null);
  }

  const dailyPct =
    usage.dailyLimit > 0
      ? Math.min(100, Math.round((usage.dailyUsed / usage.dailyLimit) * 100))
      : 0;
  const monthlyPct =
    usage.monthlyLimit > 0
      ? Math.min(
          100,
          Math.round((usage.monthlyUsed / usage.monthlyLimit) * 100),
        )
      : 0;

  const tierLabel =
    tier === "FREE" ? "Free" : tier === "PRO" ? "Pro" : "Premium";

  const statusConfig = STATUS_LABELS[status] || STATUS_LABELS.ACTIVE;

  // Format renewal date
  const formattedRenewalDate = renewalDate
    ? new Date(renewalDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Card className="border-border/60 bg-background/85">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Billing & usage</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tierLabel}</Badge>
            {tier !== "FREE" && (
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            )}
            {cancelledAtPeriodEnd && status === "ACTIVE" && (
              <Badge variant="secondary">Cancelling</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          {/* Cancellation scheduled notice */}
          {tier !== "FREE" &&
            formattedRenewalDate &&
            cancelledAtPeriodEnd &&
            status === "ACTIVE" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>
                  Cancellation scheduled for{" "}
                  <span className="font-medium">{formattedRenewalDate}</span>
                </span>
              </div>
            )}

          {/* Renewal date for paid tiers (only when not scheduled for cancellation) */}
          {tier !== "FREE" &&
            formattedRenewalDate &&
            status === "ACTIVE" &&
            !cancelledAtPeriodEnd && (
              <div className="border-border/50 bg-muted/30 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                <span>
                  Next renewal:{" "}
                  <span className="text-foreground font-medium">
                    {formattedRenewalDate}
                  </span>
                </span>
              </div>
            )}

          {/* Cancellation notice */}
          {status === "CANCELLED" && formattedRenewalDate && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                Access until:{" "}
                <span className="font-medium">{formattedRenewalDate}</span>
              </span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}

          <section className="space-y-2">
            <p className="text-foreground font-medium">Daily usage</p>
            <div className="bg-muted w-full rounded-full">
              <div
                className="bg-foreground h-2 rounded-full transition-all"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            <p>
              {usage.dailyUsed > usage.dailyLimit
                ? `${usage.dailyLimit}+`
                : usage.dailyUsed}{" "}
              / {usage.dailyLimit} scrapes today
            </p>
          </section>

          <section className="space-y-2">
            <p className="text-foreground font-medium">Monthly usage</p>
            <div className="bg-muted w-full rounded-full">
              <div
                className="bg-foreground h-2 rounded-full transition-all"
                style={{ width: `${monthlyPct}%` }}
              />
            </div>
            <p>
              {usage.monthlyUsed > usage.monthlyLimit
                ? `${usage.monthlyLimit}+`
                : usage.monthlyUsed}{" "}
              / {usage.monthlyLimit} scrapes this month
            </p>
          </section>

          <section className="flex flex-col gap-2 pt-2">
            {tier === "FREE" && (
              <>
                <Button
                  variant="default"
                  disabled={loading !== null}
                  onClick={() => handleSubscribe("pro")}
                >
                  {loading === "pro"
                    ? "Redirecting…"
                    : "Upgrade to Pro ($4.5/mo)"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={loading !== null}
                  onClick={() => handleSubscribe("premium")}
                >
                  {loading === "premium"
                    ? "Redirecting…"
                    : "Upgrade to Premium ($12/mo)"}
                </Button>
              </>
            )}
            {tier === "PRO" && (
              <Button
                variant="default"
                disabled={loading !== null || status !== "ACTIVE"}
                onClick={() => handleSubscribe("premium")}
              >
                {loading === "premium"
                  ? "Processing…"
                  : "Upgrade to Premium ($12/mo)"}
              </Button>
            )}
            {tier === "PREMIUM" && (
              <Button
                variant="outline"
                disabled={loading !== null || status !== "ACTIVE"}
                onClick={() => handleSubscribe("pro")}
              >
                {loading === "pro"
                  ? "Processing…"
                  : "Downgrade to Pro ($4.5/mo)"}
              </Button>
            )}
          </section>
        </CardContent>
      </Card>

      {/* Plan change confirmation dialog */}
      <PlanChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetPlan={targetPlan}
        currentTier={tier}
        onConfirm={handleConfirmPlanChange}
      />
    </>
  );
}
