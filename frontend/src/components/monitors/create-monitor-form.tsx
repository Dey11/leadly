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
import { Textarea } from "@/components/ui/textarea";

export type IcpOption = {
  id: string;
  name: string;
  platform: string;
};

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
              <FieldLabel htmlFor="monitor-target">
                Target (e.g., subreddit)
              </FieldLabel>
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
