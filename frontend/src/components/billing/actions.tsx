"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clientApi } from "@/lib/client/api";
import type { SubscriptionStatus } from "@/types/backend";

type ActionType = "manage" | "cancel" | null;

interface BillingActionsProps {
  status?: SubscriptionStatus;
}

export function BillingActions({ status }: BillingActionsProps) {
  const [loading, setLoading] = useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);

  const isCancelled = status === "CANCELLED";

  const handleAction = async (type: ActionType) => {
    if (!type) return;
    setLoading(type);
    setError(null);

    try {
      const action =
        type === "manage"
          ? await clientApi.openManageSubscription()
          : await clientApi.openCancelSubscription();
      if (!action?.url) {
        throw new Error("Unable to generate portal link");
      }
      window.open(action.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open Dodo portal at this time",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-border/60 bg-card/90">
      <CardHeader className="space-y-2">
        <CardTitle>Subscription actions</CardTitle>
        <p className="text-muted-foreground text-xs">
          {isCancelled
            ? "Your subscription is cancelled. You can resubscribe from the plans below."
            : "Manage payment methods, view invoices, or cancel directly in Dodo's portal."}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Portal unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            disabled={loading !== null}
            onClick={() => handleAction("manage")}
          >
            {loading === "manage"
              ? "Opening management portal…"
              : "Manage subscription"}
          </Button>
          {!isCancelled && (
            <Button
              variant="outline"
              disabled={loading !== null}
              onClick={() => handleAction("cancel")}
            >
              {loading === "cancel"
                ? "Opening cancellation flow…"
                : "Cancel subscription"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
