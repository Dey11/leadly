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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      return clientApi.login({ email, password });
    },
    onSuccess: () => {
      setFormError(null);
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={!!formError && !email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
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
          {!email && formError && <FieldError>Email is required.</FieldError>}
        </Field>
        <Field data-invalid={!!formError && !password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary transition hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!formError && !password}
            required
          />
          {!password && formError && <FieldError>Password is required.</FieldError>}
        </Field>
      </FieldGroup>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to Leadly?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
