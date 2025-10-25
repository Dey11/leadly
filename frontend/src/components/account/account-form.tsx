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
  defaultImage?: string | null;
};

export function AccountForm({
  defaultName,
  defaultEmail,
  defaultImage,
}: AccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [image, setImage] = useState(defaultImage ?? "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: {
        name?: string;
        email?: string;
        image?: string;
        password?: string;
      } = {};

      if (name && name !== defaultName) payload.name = name;
      if (email && email !== defaultEmail) payload.email = email;
      if (image && image !== (defaultImage ?? "")) payload.image = image;
      if (password.trim()) payload.password = password.trim();

      if (Object.keys(payload).length === 0) {
        throw new Error("Update at least one field before saving.");
      }

      return clientApi.updateAccount(payload);
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage("Profile updated. Changes are now live.");
      setPassword("");
      router.refresh();
    },
    onError: (error: unknown) => {
      setSuccessMessage(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your account."
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
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <Input
                id="account-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="account-image">Avatar URL</FieldLabel>
              <Input
                id="account-image"
                name="image"
                type="url"
                value={image}
                placeholder="https://"
                onChange={(event) => setImage(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="account-password">Update password</FieldLabel>
              <Input
                id="account-password"
                name="password"
                type="password"
                value={password}
                placeholder="Leave blank to keep current"
                onChange={(event) => setPassword(event.target.value)}
              />
              {password && password.length < 8 && (
                <FieldError>Use at least 8 characters.</FieldError>
              )}
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

