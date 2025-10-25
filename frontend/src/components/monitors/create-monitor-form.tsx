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

export type ServiceOption = {
  id: string;
  name: string;
  platform: string;
};

type CreateMonitorFormProps = {
  services: ServiceOption[];
};

export function CreateMonitorForm({ services }: CreateMonitorFormProps) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [platform, setPlatform] = useState("REDDIT");
  const [target, setTarget] = useState("");
  const [cursor, setCursor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (services.length > 0 && !serviceId) {
      setServiceId(services[0].id);
    }
  }, [services, serviceId]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!serviceId || !target) {
        throw new Error("Service and target are required.");
      }

      return clientApi.createMonitor({
        serviceId,
        target,
        platform,
        cursor: cursor.trim() ? cursor.trim() : null,
      });
    },
    onSuccess: () => {
      setError(null);
      setSuccess("Monitor created. Leadly will begin scraping on schedule.");
      setTarget("");
      setCursor("");
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the monitor."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  if (services.length === 0) {
    return (
      <Card className="bg-background/80">
        <CardHeader>
          <CardTitle>Create new monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Add a service first</AlertTitle>
            <AlertDescription>
              You need at least one service before you can create monitors.
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
            <Field data-invalid={!!error && !serviceId}>
              <FieldLabel htmlFor="monitor-service">Service</FieldLabel>
              <Select
                id="monitor-service"
                name="serviceId"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                required
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} · {service.platform}
                  </option>
                ))}
              </Select>
              {!serviceId && error && (
                <FieldError>Select a service to continue.</FieldError>
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
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="REDDIT">Reddit</option>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="monitor-cursor">
                Cursor (optional)
              </FieldLabel>
              <Textarea
                id="monitor-cursor"
                name="cursor"
                placeholder="Provide a cursor to resume scraping from a specific post."
                value={cursor}
                onChange={(event) => setCursor(event.target.value)}
                rows={2}
              />
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

