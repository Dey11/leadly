"use client";

import { useState } from "react";
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
import type { KeywordSet } from "@/types/keyword";

interface CreateKeywordMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keywordSets: KeywordSet[];
  onSuccess: () => void;
}

export function CreateKeywordMonitorDialog({
  open,
  onOpenChange,
  keywordSets,
  onSuccess,
}: CreateKeywordMonitorDialogProps) {
  const [keywordSetId, setKeywordSetId] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { keywordSetId: string; target: string; platform: string }) =>
      clientApi.createKeywordMonitor(data),
    onSuccess: () => {
      resetForm();
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to create monitor");
    },
  });

  const resetForm = () => {
    setKeywordSetId("");
    setTarget("");
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
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

    createMutation.mutate({
      keywordSetId,
      target: formattedTarget,
      platform: "REDDIT",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Keyword Monitor</DialogTitle>
            <DialogDescription>
              Choose a keyword set and specify a subreddit to monitor for matches.
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
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Monitor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
