"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { clientApi } from "@/lib/client/api";
import type { KeywordMonitor, KeywordSet } from "@/types/keyword";
import type { RedditTargetType, SubscriptionTier } from "@/types/backend";

interface EditKeywordMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor: KeywordMonitor;
  keywordSets: KeywordSet[];
  onSuccess: () => void;
  tier?: SubscriptionTier;
}

export function EditKeywordMonitorDialog({
  open,
  onOpenChange,
  monitor,
  keywordSets,
  onSuccess,
  tier = "FREE",
}: EditKeywordMonitorDialogProps) {
  const [keywordSetId, setKeywordSetId] = useState(monitor.keywordSetId);
  const [target, setTarget] = useState(monitor.target);
  const [targetType, setTargetType] = useState<RedditTargetType>(
    monitor.targetType,
  );
  const [error, setError] = useState<string | null>(null);
  const canUseCustomFeeds = tier === "PREMIUM";

  // Reset form when monitor changes
  useEffect(() => {
    setKeywordSetId(monitor.keywordSetId);
    setTarget(monitor.target);
    setTargetType(monitor.targetType);
    setError(null);
  }, [monitor]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      keywordSetId?: string;
      target?: string;
      targetType?: string;
    }) => clientApi.updateKeywordMonitor(monitor.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to update monitor");
    },
  });

  const handleClose = (next: boolean) => {
    if (!next) {
      setError(null);
    }
    onOpenChange(next);
  };

  const handleTargetTypeChange = (next: RedditTargetType) => {
    if (next === "CUSTOM_FEED" && !canUseCustomFeeds) return;
    setTargetType(next);
    if (next !== monitor.targetType) {
      setTarget("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keywordSetId) {
      setError("Please select a keyword set");
      return;
    }

    if (!target.trim()) {
      setError(
        targetType === "CUSTOM_FEED"
          ? "A custom feed URL is required"
          : "Target subreddit is required",
      );
      return;
    }

    let formattedTarget = target.trim();
    if (targetType === "SUBREDDIT" && !formattedTarget.startsWith("r/")) {
      formattedTarget = `r/${formattedTarget}`;
    }

    // Only include changed fields
    const updates: {
      keywordSetId?: string;
      target?: string;
      targetType?: string;
    } = {};
    if (keywordSetId !== monitor.keywordSetId) {
      updates.keywordSetId = keywordSetId;
    }
    if (formattedTarget !== monitor.target) {
      updates.target = formattedTarget;
    }
    if (targetType !== monitor.targetType) {
      updates.targetType = targetType;
    }

    if (Object.keys(updates).length === 0) {
      // No changes
      handleClose(false);
      return;
    }

    updateMutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Keyword Monitor</DialogTitle>
            <DialogDescription>
              Update the keyword set or target subreddit for this monitor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyword-set">Keyword Set</Label>
              <Select value={keywordSetId} onValueChange={setKeywordSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a keyword set" />
                </SelectTrigger>
                <SelectContent>
                  {keywordSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name} ({set.keywords.length} keywords)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">
                {targetType === "CUSTOM_FEED"
                  ? "Custom Feed URL"
                  : "Target Subreddit"}
              </Label>

              <Tabs
                value={targetType}
                onValueChange={(next) =>
                  handleTargetTypeChange(next as RedditTargetType)
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
                id="target"
                placeholder={
                  targetType === "CUSTOM_FEED"
                    ? "reddit.com/user/<name>/m/<feed>"
                    : "e.g., r/saas or saas"
                }
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                maxLength={targetType === "CUSTOM_FEED" ? 300 : 50}
              />
              <p className="text-muted-foreground text-xs">
                {targetType === "CUSTOM_FEED"
                  ? "Paste the link to a public Reddit custom feed (multireddit)."
                  : "Enter the subreddit name (with or without r/ prefix)"}
              </p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
