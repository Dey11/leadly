"use client";

import { useState } from "react";
import { clientApi } from "@/lib/client/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Tier = "FREE" | "PRO" | "PREMIUM";

export function BillingPanel(props: {
  tier: Tier;
  usage: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
  };
}) {
  const { tier, usage } = props;
  const [loading, setLoading] = useState<"pro" | "premium" | null>(null);
  const canUpgradeToPro = tier === "FREE";
  const canUpgradeToPremium = tier !== "PREMIUM";

  async function handleSubscribe(plan: "pro" | "premium") {
    try {
      setLoading(plan);
      const res = await clientApi.subscribe(plan);
      if (res && (res as any).url) {
        window.location.href = (res as { url: string }).url;
      }
    } catch (e) {
      console.error("Subscribe failed", e);
      setLoading(null);
      alert("Failed to start checkout. Please try again.");
    }
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

  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Billing & usage</CardTitle>
        <Badge variant="outline">{tierLabel}</Badge>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-4 text-sm">
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
          {canUpgradeToPro && (
            <Button
              variant="default"
              disabled={loading !== null}
              onClick={() => handleSubscribe("pro")}
            >
              {loading === "pro" ? "Redirecting…" : "Upgrade to Pro ($4.5/mo)"}
            </Button>
          )}
          {canUpgradeToPremium && (
            <Button
              variant="secondary"
              disabled={loading !== null}
              onClick={() => handleSubscribe("premium")}
            >
              {loading === "premium"
                ? "Redirecting…"
                : "Upgrade to Premium ($12/mo)"}
            </Button>
          )}
          {!canUpgradeToPro && !canUpgradeToPremium && (
            <p className="text-xs">
              You are on the highest plan. Thank you for supporting us.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
