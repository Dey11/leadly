"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CirclePause, LoaderCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client/api";
import type { AutomationState } from "@/types/backend";

type AutomationPauseBannerProps = {
  automation: AutomationState | null;
};

/**
 * Restores future schedules after an account-level pause. The banner deliberately
 * stays visible until the backend confirms the account-level state change.
 */
export function AutomationPauseBanner({
  automation,
}: AutomationPauseBannerProps) {
  const router = useRouter();
  const [dismissedAfterSuccess, setDismissedAfterSuccess] = useState(false);
  const mutation = useMutation({
    mutationFn: clientApi.enableAutomation,
    onSuccess: () => {
      setDismissedAfterSuccess(true);
      toast.success("Future jobs are enabled");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Could not enable jobs", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  if (!automation?.pauseReason || dismissedAfterSuccess) return null;

  const description =
    automation.pauseReason === "ADMINISTRATIVE"
      ? "We paused scheduled automation while your account was away. Enable it again to resume future ICP and keyword jobs. Your monitors and schedules are unchanged."
      : `Free-tier automation pauses after ${automation.inactivityThresholdDays} days without activity. Enable it again to resume future ICP and keyword jobs. Your monitors and schedules are unchanged.`;

  return (
    <section
      aria-labelledby="automation-pause-heading"
      className="border-primary/25 bg-card/95 mb-6 rounded-xl border p-6 shadow-[0_12px_35px_-24px_rgba(119,51,68,0.7)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-primary/12 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <CirclePause className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2
              id="automation-pause-heading"
              className="text-foreground text-sm font-semibold text-balance sm:text-base"
            >
              Your scheduled jobs are paused
            </h2>
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6 text-pretty">
              {description}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-10 shrink-0 rounded-lg"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {mutation.isPending ? "Enabling jobs…" : "Enable jobs again"}
        </Button>
      </div>
    </section>
  );
}
