"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !email || !password) {
        throw new Error("Please fill every field to continue.");
      }
      return clientApi.register({ name, email, password });
    },
    onSuccess: () => {
      setFormError(null);
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={!!formError && !name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ada Lovelace"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={!!formError && !name}
            required
          />
          {!name && formError && (
            <FieldError>Name is required.</FieldError>
          )}
        </Field>
        <Field data-invalid={!!formError && !email}>
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!formError && !email}
            required
          />
          {!email && formError && (
            <FieldError>Email is required.</FieldError>
          )}
        </Field>
        <Field data-invalid={!!formError && !password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!formError && !password}
            required
          />
          {!password && formError && (
            <FieldError>Password is required.</FieldError>
          )}
        </Field>
      </FieldGroup>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to create your account</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
