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
import { clientApi } from "@/lib/client/api";
import type { KeywordMonitor, KeywordSet } from "@/types/keyword";

interface EditKeywordMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor: KeywordMonitor;
  keywordSets: KeywordSet[];
  onSuccess: () => void;
}

export function EditKeywordMonitorDialog({
  open,
  onOpenChange,
  monitor,
  keywordSets,
  onSuccess,
}: EditKeywordMonitorDialogProps) {
  const [keywordSetId, setKeywordSetId] = useState(monitor.keywordSetId);
  const [target, setTarget] = useState(monitor.target);
  const [error, setError] = useState<string | null>(null);

  // Reset form when monitor changes
  useEffect(() => {
    setKeywordSetId(monitor.keywordSetId);
    setTarget(monitor.target);
    setError(null);
  }, [monitor]);

  const updateMutation = useMutation({
    mutationFn: (data: { keywordSetId?: string; target?: string }) =>
      clientApi.updateKeywordMonitor(monitor.id, data),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keywordSetId) {
      setError("Please select a keyword set");
      return;
    }

    if (!target.trim()) {
      setError("Target subreddit is required");
      return;
    }

    // Format subreddit target
    let formattedTarget = target.trim();
    if (!formattedTarget.startsWith("r/")) {
      formattedTarget = `r/${formattedTarget}`;
    }

    // Only include changed fields
    const updates: { keywordSetId?: string; target?: string } = {};
    if (keywordSetId !== monitor.keywordSetId) {
      updates.keywordSetId = keywordSetId;
    }
    if (formattedTarget !== monitor.target) {
      updates.target = formattedTarget;
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
              <Label htmlFor="target">Target Subreddit</Label>
              <Input
                id="target"
                placeholder="e.g., r/saas or saas"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                maxLength={50}
              />
              <p className="text-muted-foreground text-xs">
                Enter the subreddit name (with or without r/ prefix)
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
