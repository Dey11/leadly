"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_EMAIL } from "@/constants/config";
import { BugReportButton } from "@/components/shared/bug-report-dialog";

// Status classification
const SUCCESS_STATUSES = new Set([
  "succeeded",
  "active",
  "subscription.active",
]);
const FAILURE_STATUSES = new Set(["failed", "payment.failed", "incomplete"]);
const CANCELLED_STATUSES = new Set(["cancelled", "canceled", "abandoned"]);

type PaymentState = "success" | "failed" | "cancelled";

function getPaymentState(status: string): PaymentState {
  if (!status) return "success"; // Default to success for backward compat
  const normalized = status.toLowerCase().trim();
  if (SUCCESS_STATUSES.has(normalized)) return "success";
  if (FAILURE_STATUSES.has(normalized)) return "failed";
  if (CANCELLED_STATUSES.has(normalized)) return "cancelled";
  // If unknown status, treat as success (existing behavior for subscription.active etc)
  return "success";
}

// State-specific configurations
const STATE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-500",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/5",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    statusLabel: "Active",
    heading: "Payment confirmed",
    description:
      "Your checkout completed successfully and the subscription is now active.",
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
    heading: "Checkout cancelled",
    description:
      "You cancelled the checkout process. No charges were made to your account.",
  },
};

function BillingResultContent() {
  const searchParams = useSearchParams();
  const statusRaw = searchParams.get("status") ?? "";
  const subscriptionId = searchParams.get("subscription_id");
  const paymentState = getPaymentState(statusRaw);
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
