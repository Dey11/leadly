import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccountSummary, getUsageSummary } from "@/lib/backend-queries";
import type { AccountSummary } from "@/types/backend";

const SUCCESS_STATUSES = new Set(["active", "subscription.active"]);

type BillingResultPageProps = {
  searchParams: {
    status?: string;
    subscription_id?: string;
    plan?: string;
  };
};

function describePlan(tier: "FREE" | "PRO" | "PREMIUM", fallback?: string) {
  if (tier === "PRO") return "Pro";
  if (tier === "PREMIUM") return "Premium";
  return fallback ?? "Free";
}

export default async function BillingResultPage({
  searchParams,
}: BillingResultPageProps) {
  const statusRaw = searchParams.status ?? "";
  const statusNormalized = statusRaw.toLowerCase().trim();
  const isSuccessful =
    !statusNormalized || SUCCESS_STATUSES.has(statusNormalized);
  const statusLabel = isSuccessful ? "Active" : "Attention required";

  let account: AccountSummary | null = null;
  try {
    account = await getAccountSummary();
  } catch {
    redirect("/login?next=/billing/result");
  }

  const usageSummary = await getUsageSummary();
  const usagePayload = usageSummary?.payload ?? null;
  const tier = (usagePayload?.tier ?? "FREE") as "FREE" | "PRO" | "PREMIUM";
  const planName = describePlan(tier, searchParams.plan);

  const usageSnapshot = {
    dailyUsed: usagePayload?.dailyUsed ?? 0,
    dailyLimit: usagePayload?.dailyLimit ?? 0,
    monthlyUsed: usagePayload?.monthlyUsed ?? 0,
    monthlyLimit: usagePayload?.monthlyLimit ?? 0,
  };

  const statusIcon = isSuccessful ? (
    <CheckCircle2 className="size-5 text-foreground/90" aria-hidden />
  ) : (
    <AlertTriangle className="size-5 text-destructive" aria-hidden />
  );

  const statusCopy = isSuccessful
    ? "Your Dodo checkout completed successfully and the subscription is now active."
    : "We could not verify the subscription. Check Dodo’s checkout logs or try again.";
  const contact = usagePayload?.billingContact ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl space-y-8 px-5 py-16">
        <section className="rounded-3xl border border-border/60 bg-card/90 p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-primary/10 text-primary">
                Billing result
              </Badge>
              <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {statusLabel}
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                {statusIcon}
                <h1 className="text-3xl font-semibold">
                  {isSuccessful ? "Payment confirmed" : "Payment needs attention"}
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{statusCopy}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/40 bg-background/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Workspace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {account?.name ?? "Leadly workspace"}
                  </p>
                  <p className="text-xs text-muted-foreground">{account?.email}</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-background/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  <p className="text-sm font-semibold text-foreground">{planName}</p>
                  <p className="text-xs text-muted-foreground">
                    {searchParams.subscription_id
                      ? `Subscription ID: ${searchParams.subscription_id}`
                      : "Subscription details will appear shortly."}
                  </p>
                </CardContent>
              </Card>
            </div>
            {contact ? (
              <div className="mt-4">
                <Card className="border-border/40 bg-background/80">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Billing contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-4">
                    {contact.name ? (
                      <p className="text-sm font-semibold text-foreground">
                        {contact.name}
                      </p>
                    ) : null}
                    {contact.email ? (
                      <p className="text-xs text-muted-foreground">
                        {contact.email}
                      </p>
                    ) : null}
                    {contact.phone ? (
                      <p className="text-xs text-muted-foreground">
                        {contact.phone}
                      </p>
                    ) : null}
                    {contact.address ? (
                      <p className="text-xs text-muted-foreground break-words">
                        {contact.address}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 pt-6">
              <Button asChild>
                <Link href="/dashboard/billing">
                  Go back to billing
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 bg-card/90">
            <CardHeader>
              <CardTitle>Usage snapshot</CardTitle>
              <p className="text-xs text-muted-foreground">
                Daily & monthly consumed scrapes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Daily</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {usageSnapshot.dailyUsed} / {usageSnapshot.dailyLimit}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {usageSnapshot.monthlyUsed} / {usageSnapshot.monthlyLimit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/90">
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
              <p className="text-xs text-muted-foreground">
                Reach out if something doesn’t look right
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If your status is not “Active”, revisit the checkout or contact
                <a
                  href="mailto:hello@leadly.live"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  &nbsp;hello@leadly.live
                </a>
                .
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/billing">Review billing options</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
