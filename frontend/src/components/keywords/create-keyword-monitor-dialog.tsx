"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
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
  currentMonitorsCount?: number;
  maxMonitors?: number;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

export function CreateKeywordMonitorDialog({
  open,
  onOpenChange,
  keywordSets,
  onSuccess,
  currentMonitorsCount = 0,
  maxMonitors = 3,
}: CreateKeywordMonitorDialogProps) {
  const [keywordSetId, setKeywordSetId] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  // AI Suggestion State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: {
      keywordSetId: string;
      target: string;
      platform: string;
    }) => clientApi.createKeywordMonitor(data),
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
    setSuggestions([]);
    setSuggestError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSuggest = async () => {
    if (!keywordSetId) return;

    setIsSuggesting(true);
    setSuggestError(null);
    setSuggestions([]);

    try {
      const results = await clientApi.suggestKeywordSubreddits({
        keywordSetId,
      });
      setSuggestions(results);
    } catch (err) {
      setSuggestError("Failed to fetch suggestions");
    } finally {
      setIsSuggesting(false);
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

  const atLimit = currentMonitorsCount >= maxMonitors;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Keyword Monitor</DialogTitle>
            <DialogDescription>
              Choose a keyword set and specify a subreddit to monitor for
              matches.
            </DialogDescription>
          </DialogHeader>

          {/* Quota indicator */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Badge variant={atLimit ? "destructive" : "outline"}>
              {currentMonitorsCount}/{maxMonitors} monitors used
            </Badge>
            {atLimit && (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Upgrade to create more
              </span>
            )}
          </div>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyword-set">Keyword Set</Label>
              <Select
                value={keywordSetId}
                onValueChange={(val) => {
                  setKeywordSetId(val);
                  setSuggestions([]); // Clear suggestions on change
                }}
                disabled={atLimit}
              >
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
              <div className="flex items-center justify-between">
                <Label htmlFor="target">Target Subreddit</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggest}
                  disabled={isSuggesting || !keywordSetId || atLimit}
                  className="text-primary h-auto px-2 py-1 text-xs"
                >
                  {isSuggesting ? (
                    <span className="flex items-center gap-1">
                      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      Suggesting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <SparkleIcon className="h-3 w-3" />
                      Suggest
                    </span>
                  )}
                </Button>
              </div>

              <Input
                id="target"
                placeholder="e.g., r/saas or saas"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                maxLength={50}
                disabled={atLimit}
              />
              <p className="text-muted-foreground text-xs">
                Enter the subreddit name (with or without r/ prefix)
              </p>

              {suggestError && (
                <p className="text-xs text-red-500">{suggestError}</p>
              )}

              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground mb-1.5 text-xs">
                    Click to use:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((subreddit) => (
                      <Button
                        key={subreddit}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTarget(subreddit)}
                        className="bg-primary/10 text-primary hover:bg-primary/20 h-auto rounded-full px-2.5 py-1 text-xs font-medium"
                      >
                        {subreddit}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
            <Button
              type="submit"
              disabled={createMutation.isPending || atLimit}
            >
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
