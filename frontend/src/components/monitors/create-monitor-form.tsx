"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type IcpOption = {
  id: string;
  name: string;
  platform: string;
};

type CreateMonitorFormProps = {
  icps: IcpOption[];
};

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

export function CreateMonitorForm({ icps }: CreateMonitorFormProps) {
  const router = useRouter();
  const [icpId, setIcpId] = useState(icps[0]?.id ?? "");
  const [platform, setPlatform] = useState(icps[0]?.platform ?? "REDDIT");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  useEffect(() => {
    if (icps.length > 0 && !icpId) {
      setIcpId(icps[0].id);
      setPlatform(icps[0].platform);
    }
  }, [icps, icpId]);

  useEffect(() => {
    const selected = icps.find((icp) => icp.id === icpId);
    if (selected) {
      setPlatform(selected.platform);
    }
  }, [icps, icpId]);

  useEffect(() => {
    setSuggestions([]);
    setSuggestError(null);
  }, [icpId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!icpId || !target) {
        throw new Error("ICP and target are required.");
      }

      return clientApi.createMonitor({
        icpId,
        target,
        platform,
      });
    },
    onSuccess: () => {
      setError(null);
      setSuccess("Monitor created. Leadly will begin scraping on schedule.");
      setTarget("");
      setSuggestions([]);
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the monitor.",
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleSuggestSubreddits = async () => {
    if (!icpId) {
      setSuggestError("Please select an ICP first.");
      return;
    }

    setSuggestLoading(true);
    setSuggestError(null);

    try {
      const result = await clientApi.suggestSubreddits({ icpId });
      setSuggestions(result);
    } catch (err) {
      setSuggestError(
        err instanceof Error
          ? err.message
          : "Failed to suggest subreddits. Please try again.",
      );
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleSelectSuggestion = (subreddit: string) => {
    setTarget(subreddit);
    setSuggestions([]);
  };

  if (icps.length === 0) {
    return (
      <Card className="bg-background/80">
        <CardHeader>
          <CardTitle>Create new monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Define an ICP first</AlertTitle>
            <AlertDescription>
              You need at least one ICP before you can create monitors.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80">
      <CardHeader>
        <CardTitle>Create new monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FieldGroup>
            <Field data-invalid={!!error && !icpId}>
              <FieldLabel htmlFor="monitor-icp">ICP</FieldLabel>
              <Select
                id="monitor-icp"
                name="icpId"
                value={icpId}
                onChange={(event) => setIcpId(event.target.value)}
                required
              >
                {icps.map((icp) => (
                  <option key={icp.id} value={icp.id}>
                    {icp.name} · {icp.platform}
                  </option>
                ))}
              </Select>
              {!icpId && error && (
                <FieldError>Select an ICP to continue.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !target}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="monitor-target">
                  Target (e.g., subreddit)
                </FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestSubreddits}
                  disabled={suggestLoading || !icpId}
                  className="text-primary h-auto px-2 py-1 text-xs"
                >
                  {suggestLoading ? (
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
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                aria-invalid={!!error && !target}
                required
              />
              {!target && error && (
                <FieldError>Provide a target to monitor.</FieldError>
              )}

              {suggestError && (
                <p className="mt-1 text-xs text-red-500">{suggestError}</p>
              )}

              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground mb-1.5 text-xs">
                    Click to use:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((subreddit) => (
                      <button
                        key={subreddit}
                        type="button"
                        onClick={() => handleSelectSuggestion(subreddit)}
                        className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                      >
                        {subreddit}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="monitor-platform">Platform</FieldLabel>
              <Select
                id="monitor-platform"
                name="platform"
                value={platform}
                disabled
              >
                <option value="REDDIT">Reddit</option>
              </Select>
            </Field>
          </FieldGroup>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to create the monitor</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertTitle>Monitor created</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating monitor..." : "Create monitor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

