"use client";

import { useState } from "react";
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

export function CreateServiceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [leadDescription, setLeadDescription] = useState("");
  const [platform, setPlatform] = useState("REDDIT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !leadDescription) {
        throw new Error("Please complete all required fields.");
      }
      return clientApi.createService({ name, leadDescription, platform });
    },
    onSuccess: () => {
      setError(null);
      setSuccess("Service created. Add monitors to start collecting leads.");
      setName("");
      setLeadDescription("");
      setPlatform("REDDIT");
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the service."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Card className="bg-background/80">
      <CardHeader>
        <CardTitle>Create new service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FieldGroup>
            <Field data-invalid={!!error && !name}>
              <FieldLabel htmlFor="service-name">Service name</FieldLabel>
              <Input
                id="service-name"
                name="name"
                placeholder="Reddit SaaS Leads"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!!error && !name}
                required
              />
              {!name && error && <FieldError>Enter a name.</FieldError>}
            </Field>

            <Field data-invalid={!!error && !leadDescription}>
              <FieldLabel htmlFor="service-description">
                Lead description
              </FieldLabel>
              <Textarea
                id="service-description"
                name="leadDescription"
                placeholder="Describe the buyer profile or problem you solve to help Leadly score relevance."
                value={leadDescription}
                onChange={(event) => setLeadDescription(event.target.value)}
                aria-invalid={!!error && !leadDescription}
                rows={4}
                required
              />
              {!leadDescription && error && (
                <FieldError>Describe the lead you want.</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="service-platform">Platform</FieldLabel>
              <Select
                id="service-platform"
                name="platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="REDDIT">Reddit</option>
              </Select>
            </Field>
          </FieldGroup>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to create the service</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertTitle>Service created</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating service..." : "Create service"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
