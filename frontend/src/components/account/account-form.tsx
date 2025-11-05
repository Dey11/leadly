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

type AccountFormProps = {
  defaultName: string;
  defaultEmail: string;
};

export function AccountForm({ defaultName, defaultEmail }: AccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (name === defaultName) {
        throw new Error("Update at least one field before saving.");
      }

      return clientApi.updateAccount({ name });
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage("Profile updated. Changes are now live.");
      router.refresh();
    },
    onError: (error: unknown) => {
      setSuccessMessage(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your account.",
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
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="account-name">Name</FieldLabel>
              <Input
                id="account-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <p className="rounded-lg border border-dashed border-border/60 bg-card/60 px-3 py-2 text-sm text-muted-foreground">
                {defaultEmail}
              </p>
              <FieldError>
                Email and password changes are temporarily managed by support.
              </FieldError>
            </Field>
          </FieldGroup>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Unable to update profile</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success">
              <AlertTitle>Profile updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving changes..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
