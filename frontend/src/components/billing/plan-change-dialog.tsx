"use client";

import { useState } from "react";
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
import { ArrowRight, Loader2, AlertCircle, Clock } from "lucide-react";
import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PlanType = "pro" | "premium";

interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan: PlanType;
  currentTier: string;
  onConfirm: () => Promise<void>;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
};

const PLAN_PRICES: Record<string, string> = {
  FREE: "$0",
  PRO: "$4.50",
  PREMIUM: "$12",
};

export function PlanChangeDialog({
  open,
  onOpenChange,
  targetPlan,
  currentTier,
  onConfirm,
}: PlanChangeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<{
    isUpgrade?: boolean;
    summary?: string | null;
    fallback?: boolean;
    error?: string;
    retryAfterSeconds?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const newTier = targetPlan.toUpperCase();
  const isUpgrade =
    (currentTier === "FREE" && (newTier === "PRO" || newTier === "PREMIUM")) ||
    (currentTier === "PRO" && newTier === "PREMIUM");

  // Fetch preview when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && currentTier !== "FREE") {
      setPreviewLoading(true);
      setError(null);
      try {
        const result = await clientApi.previewPlanChange(targetPlan);
        if (result.error) {
          setError(result.error);
          setPreview({
            error: result.error,
            retryAfterSeconds: result.retryAfterSeconds,
          });
        } else {
          setPreview({
            isUpgrade: result.isUpgrade,
            summary: result.summary,
            fallback: result.fallback,
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load preview");
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to change plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isUpgrade ? "⬆️ Upgrade" : "⬇️ Downgrade"} your plan
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Plan transition visual */}
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

              {/* Preview loading */}
              {previewLoading && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading pricing details...
                </div>
              )}

              {/* Preview details */}
              {!previewLoading && preview && !preview.error && (
                <div className="border-border/60 bg-card rounded-lg border p-3 text-sm">
                  {preview.summary ? (
                    <p className="text-foreground">{preview.summary}</p>
                  ) : isUpgrade ? (
                    <p className="text-muted-foreground">
                      You will be charged the prorated difference for the
                      remaining billing period.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      You will receive credit for unused time on your current
                      plan, applied to future renewals.
                    </p>
                  )}
                </div>
              )}

              {/* Error state */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex flex-col gap-1">
                    <span>{error}</span>
                    {preview?.retryAfterSeconds && (
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Try again in ~
                        {Math.ceil(preview.retryAfterSeconds / 60)} minute(s)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Confirmation text */}
              {!error && (
                <p className="text-muted-foreground text-sm">
                  {isUpgrade
                    ? "Your new plan will be active immediately after confirmation."
                    : "Your plan will be changed immediately. You'll keep access to your current features until the next billing cycle."}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={loading || !!error}
            className={
              isUpgrade
                ? ""
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
