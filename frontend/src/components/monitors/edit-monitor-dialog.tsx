"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import type {
  Monitor,
  RedditTargetType,
  SubscriptionTier,
} from "@/types/backend";
import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EditMonitorDialogProps = {
  monitor: Monitor & { icpName?: string };
  icps: Array<{ id: string; name: string; platform: string }>;
  tier?: SubscriptionTier;
};

export function EditMonitorDialog({
  monitor,
  icps,
  tier = "FREE",
}: EditMonitorDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState(() => ({
    icpId: monitor.icpId,
    target: monitor.target,
    targetType: monitor.targetType,
    status: monitor.status,
  }));
  const [error, setError] = useState<string | null>(null);
  const canUseCustomFeeds = tier === "PREMIUM";

  useEffect(() => {
    if (open) {
      setFormState({
        icpId: monitor.icpId,
        target: monitor.target,
        targetType: monitor.targetType,
        status: monitor.status,
      });
      setError(null);
    }
  }, [monitor, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!formState.target || !formState.icpId) {
        throw new Error("ICP and monitor target are required.");
      }

      return clientApi.updateMonitor(monitor.id, {
        icpId: formState.icpId,
        target: formState.target,
        targetType: formState.targetType,
        status: formState.status,
      });
    },
    onSuccess: () => {
      router.refresh();
      setOpen(false);
    },
    onError: (mutationError: unknown) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to update the monitor.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Edit monitor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="px-6 pb-6"
        >
          <FieldGroup className="space-y-4">
            <Field data-invalid={!!error && !formState.icpId}>
              <FieldLabel htmlFor={`monitor-icp-${monitor.id}`}>ICP</FieldLabel>
              <Select
                value={formState.icpId}
                onValueChange={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    icpId: val,
                  }))
                }
              >
                <SelectTrigger id={`monitor-icp-${monitor.id}`}>
                  <SelectValue placeholder="Select ICP" />
                </SelectTrigger>
                <SelectContent>
                  {icps.map((icp) => (
                    <SelectItem key={icp.id} value={icp.id}>
                      {icp.name} · {icp.platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formState.icpId && error ? (
                <FieldError>Select an ICP.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.target}>
              <FieldLabel htmlFor={`monitor-target-${monitor.id}`}>
                Target
              </FieldLabel>

              <Tabs
                value={formState.targetType}
                onValueChange={(next) =>
                  setFormState((prev) => ({
                    ...prev,
                    targetType: next as RedditTargetType,
                    target: next === prev.targetType ? prev.target : "",
                  }))
                }
              >
                <TabsList className="w-full">
                  <TabsTrigger value="SUBREDDIT" className="flex-1">
                    Subreddit
                  </TabsTrigger>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="flex flex-1">
                          <TabsTrigger
                            value="CUSTOM_FEED"
                            disabled={!canUseCustomFeeds}
                            className="w-full gap-1.5"
                          >
                            {!canUseCustomFeeds && <Lock className="h-3 w-3" />}
                            List
                          </TabsTrigger>
                        </span>
                      </TooltipTrigger>
                      {!canUseCustomFeeds && (
                        <TooltipContent>
                          <p>
                            Custom feeds (lists) are available on the Premium
                            plan.
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TabsList>
              </Tabs>

              <Input
                id={`monitor-target-${monitor.id}`}
                placeholder={
                  formState.targetType === "CUSTOM_FEED"
                    ? "reddit.com/user/<name>/m/<feed>"
                    : "r/SaaS"
                }
                value={formState.target}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    target: event.target.value,
                  }))
                }
                required
              />
              {formState.targetType === "CUSTOM_FEED" && (
                <p className="text-muted-foreground text-xs">
                  Paste the link to a public Reddit custom feed (multireddit).
                </p>
              )}
              {!formState.target && error ? (
                <FieldError>Enter a target.</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor={`monitor-status-${monitor.id}`}>
                Status
              </FieldLabel>
              <Select
                value={formState.status}
                onValueChange={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: val as Monitor["status"],
                  }))
                }
              >
                <SelectTrigger id={`monitor-status-${monitor.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          {error ? (
            <p className="text-destructive mt-4 text-sm font-medium">{error}</p>
          ) : null}
          <DialogFooter className="border-border/40 border-t px-0 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
