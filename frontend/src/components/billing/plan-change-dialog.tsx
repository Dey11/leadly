"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/types/backend";

type PlanType = "pro" | "premium";
interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan: PlanType;
  currentTier: SubscriptionTier;
  onConfirm: () => Promise<void>;
}
const PLAN_LABELS = { FREE: "Free", PRO: "Pro", PREMIUM: "Premium" };
const PLAN_PRICES = { FREE: "$0", PRO: "$4.50", PREMIUM: "$12" };

export function PlanChangeDialog({
  open,
  onOpenChange,
  targetPlan,
  currentTier,
  onConfirm,
}: PlanChangeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newTier = targetPlan === "pro" ? "PRO" : "PREMIUM";
  const isUpgrade = newTier === "PREMIUM";
  const preview = useQuery({
    queryKey: ["billing", "preview", currentTier, targetPlan],
    queryFn: () => clientApi.previewPlanChange(targetPlan),
    enabled: open && currentTier !== "FREE",
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const handleOpenChange = (isOpen: boolean) => {
    if (loading) return;
    setError(null);
    onOpenChange(isOpen);
  };
  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to change plan. Please retry.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUpgrade ? "Upgrade" : "Downgrade"} your plan
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="bg-muted/50 flex items-center justify-center gap-3 rounded-lg border p-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-1">
                    {PLAN_LABELS[currentTier]}
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    {PLAN_PRICES[currentTier]}/mo
                  </p>
                </div>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
                <div className="text-center">
                  <Badge
                    variant={isUpgrade ? "default" : "secondary"}
                    className="mb-1"
                  >
                    {PLAN_LABELS[newTier]}
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    {PLAN_PRICES[newTier]}/mo
                  </p>
                </div>
              </div>
              {preview.isFetching && (
                <p className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading pricing details…
                </p>
              )}
              {preview.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {preview.error.message}{" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => preview.refetch()}
                    >
                      Retry pricing
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : preview.data?.summary ? (
                <p className="text-foreground text-sm">
                  {preview.data.summary}
                </p>
              ) : null}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <p className="text-muted-foreground text-sm">
                {isUpgrade
                  ? "Upgraded features become available after your payment and subscription are confirmed."
                  : "Your plan changes at the next renewal. You keep your current features until then."}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            disabled={
              loading ||
              preview.isFetching ||
              preview.isError ||
              !preview.data?.canPreview
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Confirm ${isUpgrade ? "upgrade" : "downgrade"}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
