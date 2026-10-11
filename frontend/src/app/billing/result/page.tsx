"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  CreditCard,
  CalendarX,
} from "lucide-react";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/client/api";
import type { BillingResultState } from "@/types/backend";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_EMAIL } from "@/constants/config";
import { BugReportButton } from "@/components/shared/bug-report-dialog";

// State-specific configurations
const STATE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-500",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/5",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    statusLabel: "Active",
    heading: "Subscription active",
    description: "Your account has confirmed access to this subscription.",
  },
  pending: {
    icon: Clock,
    iconClass: "text-blue-600 dark:text-blue-500",
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/5",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    statusLabel: "Processing",
    heading: "Payment processing",
    description:
      "We have not confirmed this subscription yet. Sign in to the account used at checkout, then check again or review billing.",
  },
  on_hold: {
    icon: CreditCard,
    iconClass: "text-orange-600 dark:text-orange-500",
    borderClass: "border-orange-500/30",
    bgClass: "bg-orange-500/5",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    statusLabel: "On Hold",
    heading: "Subscription on hold",
    description:
      "Your subscription is on hold due to a payment issue. Please update your payment method to reactivate your subscription.",
  },
  failed: {
    icon: XCircle,
    iconClass: "text-destructive",
    borderClass: "border-destructive/30",
    bgClass: "bg-destructive/5",
    badgeClass: "bg-destructive/10 text-destructive",
    statusLabel: "Failed",
    heading: "Payment failed",
    description:
      "Your payment could not be processed. This could be due to insufficient funds, an expired card, or a declined transaction.",
  },
  cancelled: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-500",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/5",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    statusLabel: "Cancelled",
    heading: "Subscription cancelled",
    description:
      "This subscription is cancelled. Review billing or the payment portal for charge details.",
  },
  expired: {
    icon: CalendarX,
    iconClass: "text-slate-600 dark:text-slate-400",
    borderClass: "border-slate-500/30",
    bgClass: "bg-slate-500/5",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
    statusLabel: "Expired",
    heading: "Subscription expired",
    description:
      "Your subscription has expired. Subscribe again to continue using premium features.",
  },
};

function BillingResultContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const planRaw = searchParams.get("plan");
  const plan = planRaw === "pro" || planRaw === "premium" ? planRaw : undefined;
  const statusQuery = useQuery({
    queryKey: ["billing", "status", subscriptionId, plan],
    queryFn: () => clientApi.billingStatus(subscriptionId!, plan),
    enabled: !!subscriptionId,
    staleTime: 0,
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.state === "pending" &&
      query.state.dataUpdateCount < 12 &&
      query.state.status !== "error"
        ? 5000
        : false,
  });
  const paymentState: BillingResultState = statusQuery.isError
    ? "pending"
    : (statusQuery.data?.state ?? "pending");
  const config = STATE_CONFIG[paymentState];
  const IconComponent = config.icon;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto max-w-3xl space-y-8 px-5 py-16">
        {/* Main Status Card */}
        <section
          className={`rounded-3xl border p-8 shadow-sm ${config.borderClass} ${config.bgClass}`}
        >
          <div className="flex flex-col gap-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className={`rounded-full ${config.badgeClass}`}>
                Billing result
              </Badge>
              <div className="text-muted-foreground inline-flex items-center gap-2 text-sm font-semibold tracking-[0.3em] uppercase">
                {config.statusLabel}
              </div>
            </div>

            {/* Heading with Icon */}
            <div className="flex items-center gap-3">
              <IconComponent
                className={`size-7 ${config.iconClass}`}
                aria-hidden
              />
              <h1 className="text-2xl font-semibold sm:text-3xl">
                {config.heading}
              </h1>
            </div>

            {/* Description */}
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {config.description}
            </p>

            {statusQuery.isError && (
              <p role="alert" className="text-destructive text-sm">
                Unable to verify your subscription. Please sign in and retry.
              </p>
            )}
            {!subscriptionId && (
              <p className="text-muted-foreground text-sm">
                No subscription reference was provided. Review your account
                billing to check access.
              </p>
            )}

            {/* Subscription ID for success */}
            {paymentState === "success" && subscriptionId && (
              <p className="text-muted-foreground text-xs">
                Subscription ID: {subscriptionId}
              </p>
            )}

            {/* State-specific CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {paymentState === "success" && (
                <Button asChild>
                  <Link href="/dashboard">
                    Go to dashboard
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              )}

              {paymentState === "pending" && (
                <>
                  <Button
                    onClick={() => void statusQuery.refetch()}
                    disabled={!subscriptionId || statusQuery.isFetching}
                    variant="outline"
                  >
                    <RefreshCw className="size-4" aria-hidden />
                    Check status
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                </>
              )}

              {paymentState === "on_hold" && (
                <>
                  <Button asChild>
                    <Link href="/dashboard/billing">
                      <CreditCard className="size-4" aria-hidden />
                      Update payment method
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`mailto:${SUPPORT_EMAIL}`}>Contact support</a>
                  </Button>
                </>
              )}

              {paymentState === "failed" && (
                <>
                  <Button asChild>
                    <Link href="/dashboard/billing">
                      <RefreshCw className="size-4" aria-hidden />
                      Try again
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`mailto:${SUPPORT_EMAIL}`}>Contact support</a>
                  </Button>
                </>
              )}

              {paymentState === "cancelled" && (
                <>
                  <Button asChild>
                    <Link href="/dashboard/billing">
                      Return to billing
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                  <BugReportButton variant="outline" defaultCategory="OTHER">
                    Share Feedback
                  </BugReportButton>
                </>
              )}

              {paymentState === "expired" && (
                <>
                  <Button asChild>
                    <Link href="/dashboard/billing">
                      Subscribe again
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Help Card - always show */}
        <Card className="border-border/60 bg-card/90">
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
            <p className="text-muted-foreground text-xs">
              Reach out if something doesn&apos;t look right
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              {paymentState === "success" ? (
                <>
                  Your subscription is active. If you have any questions,
                  contact us at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : paymentState === "pending" ? (
                <>
                  Your subscription has not been confirmed yet. If it takes
                  longer than expected, contact us at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : paymentState === "on_hold" ? (
                <>
                  Your subscription was paused because of a payment issue.
                  Update your payment method to continue. Need help? Contact us
                  at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : paymentState === "failed" ? (
                <>
                  If the problem persists, please check with your bank or try a
                  different payment method. You can also contact us at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : paymentState === "expired" ? (
                <>
                  Your subscription has ended. Subscribe again to regain access
                  to premium features. Questions? Reach out at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : (
                <>
                  Changed your mind? We&apos;d love to know why. Feel free to
                  reach out at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              )}
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">Review billing options</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function BillingResultPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Loading...</div>
        </div>
      }
    >
      <BillingResultContent />
    </Suspense>
  );
}
