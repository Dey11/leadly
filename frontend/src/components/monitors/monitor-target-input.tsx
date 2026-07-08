"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RedditTargetType } from "@/types/backend";

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

interface MonitorTargetInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  icpId: string;
  onSuggest: () => void;
  isLoading: boolean;
  suggestError: string | null;
  suggestions: string[];
  onSelectSuggestion: (value: string) => void;
  targetType: RedditTargetType;
  onTargetTypeChange: (targetType: RedditTargetType) => void;
  canUseCustomFeeds: boolean;
}

export function MonitorTargetInput({
  value,
  onChange,
  error,
  icpId,
  onSuggest,
  isLoading,
  suggestError,
  suggestions,
  onSelectSuggestion,
  targetType,
  onTargetTypeChange,
  canUseCustomFeeds,
}: MonitorTargetInputProps) {
  const isCustomFeed = targetType === "CUSTOM_FEED";

  return (
    <Field data-invalid={!!error && !value}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="monitor-target">
          {isCustomFeed
            ? "Target (custom feed URL)"
            : "Target (e.g., subreddit)"}
        </FieldLabel>
        {!isCustomFeed && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSuggest}
            disabled={isLoading || !icpId}
            className="text-primary h-auto px-2 py-1 text-xs"
          >
            {isLoading ? (
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
        )}
      </div>

      <Tabs
        value={targetType}
        onValueChange={(next) => onTargetTypeChange(next as RedditTargetType)}
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
                  <p>Custom feeds (lists) are available on the Premium plan.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </TabsList>
      </Tabs>

      <Input
        id="monitor-target"
        name="target"
        placeholder={
          isCustomFeed ? "reddit.com/user/<name>/m/<feed>" : "r/SaaS"
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error && !value}
        required
      />

      {isCustomFeed && (
        <p className="text-muted-foreground text-xs">
          Paste the link to a public Reddit custom feed (multireddit), e.g.
          reddit.com/user/someuser/m/leads.
        </p>
      )}

      {!value && error && <FieldError>Provide a target to monitor.</FieldError>}

      {!isCustomFeed && suggestError && (
        <p className="mt-1 text-xs text-red-500">{suggestError}</p>
      )}

      {!isCustomFeed && suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-muted-foreground mb-1.5 text-xs">Click to use:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((subreddit) => (
              <Button
                key={subreddit}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectSuggestion(subreddit)}
                className="bg-primary/10 text-primary hover:bg-primary/20 h-auto rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {subreddit}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Field>
  );
}
