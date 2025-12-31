"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
}: MonitorTargetInputProps) {
  return (
    <Field data-invalid={!!error && !value}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="monitor-target">
          Target (e.g., subreddit)
        </FieldLabel>
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
      </div>
      <Input
        id="monitor-target"
        name="target"
        placeholder="r/SaaS"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error && !value}
        required
      />
      {!value && error && <FieldError>Provide a target to monitor.</FieldError>}

      {suggestError && (
        <p className="mt-1 text-xs text-red-500">{suggestError}</p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-muted-foreground mb-1.5 text-xs">Click to use:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((subreddit) => (
              <button
                key={subreddit}
                type="button"
                onClick={() => onSelectSuggestion(subreddit)}
                className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              >
                {subreddit}
              </button>
            ))}
          </div>
        </div>
      )}
    </Field>
  );
}
