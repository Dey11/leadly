import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccountSummary, getUsageSummary } from "@/lib/backend-queries";
import type { AccountSummary } from "@/types/backend";
import { SUPPORT_EMAIL } from "@/constants/config";

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
    <CheckCircle2 className="text-foreground/90 size-5" aria-hidden />
  ) : (
    <AlertTriangle className="text-destructive size-5" aria-hidden />
  );

  const statusCopy = isSuccessful
    ? "Your Dodo checkout completed successfully and the subscription is now active."
    : "We could not verify the subscription. Check Dodo’s checkout logs or try again.";
  const contact = usagePayload?.billingContact ?? null;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto max-w-5xl space-y-8 px-5 py-16">
        <section className="border-border/60 bg-card/90 rounded-3xl border p-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary rounded-full">
                Billing result
              </Badge>
              <div className="text-muted-foreground inline-flex items-center gap-2 text-sm font-semibold tracking-[0.3em] uppercase">
                {statusLabel}
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                {statusIcon}
                <h1 className="text-3xl font-semibold">
                  {isSuccessful
                    ? "Payment confirmed"
                    : "Payment needs attention"}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{statusCopy}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/40 bg-background/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
                    Workspace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  <p className="text-foreground text-sm font-semibold">
                    {account?.name ?? "Leadly workspace"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {account?.email}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-background/80">
                <CardHeader className="pb-0">
                  <CardTitle className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
                    Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  <p className="text-foreground text-sm font-semibold">
                    {planName}
                  </p>
                  <p className="text-muted-foreground text-xs">
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
                    <CardTitle className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
                      Billing contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-4">
                    {contact.name ? (
                      <p className="text-foreground text-sm font-semibold">
                        {contact.name}
                      </p>
                    ) : null}
                    {contact.email ? (
                      <p className="text-muted-foreground text-xs">
                        {contact.email}
                      </p>
                    ) : null}
                    {contact.phone ? (
                      <p className="text-muted-foreground text-xs">
                        {contact.phone}
                      </p>
                    ) : null}
                    {contact.address ? (
                      <p className="text-muted-foreground text-xs break-words">
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
              <p className="text-muted-foreground text-xs">
                Daily & monthly consumed scrapes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Daily</p>
                  <p className="text-foreground text-2xl font-semibold">
                    {usageSnapshot.dailyUsed} / {usageSnapshot.dailyLimit}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Monthly</p>
                  <p className="text-foreground text-2xl font-semibold">
                    {usageSnapshot.monthlyUsed} / {usageSnapshot.monthlyLimit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/90">
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
              <p className="text-muted-foreground text-xs">
                Reach out if something doesn’t look right
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                If your status is not “Active”, revisit the checkout or contact
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  &nbsp;{SUPPORT_EMAIL}
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
