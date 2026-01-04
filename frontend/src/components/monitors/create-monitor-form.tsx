"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { MonitorIcpSelect } from "@/components/monitors/monitor-icp-select";
import { MonitorTargetInput } from "@/components/monitors/monitor-target-input";
import type { IcpOption } from "@/types/components/monitors";

type CreateMonitorFormProps = {
  icps: IcpOption[];
};

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
            <MonitorIcpSelect
              icps={icps}
              value={icpId}
              onChange={setIcpId}
              error={error}
            />

            <MonitorTargetInput
              value={target}
              onChange={setTarget}
              error={error}
              icpId={icpId}
              onSuggest={handleSuggestSubreddits}
              isLoading={suggestLoading}
              suggestError={suggestError}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />

            {/* Platform is implicitly Reddit for now */}
          </FieldGroup>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to create the monitor</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
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
