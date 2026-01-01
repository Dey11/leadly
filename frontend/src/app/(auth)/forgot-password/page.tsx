"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("Please enter your email address.");
      }
      return clientApi.forgotPassword({ email });
    },
    onSuccess: () => {
      setFormError(null);
      setSuccess(true);
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof Error ? error.message : "Failed to send reset email."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  if (success) {
    return (
      <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a password reset link.
          </p>
        </div>
        <div className="rounded-xl bg-secondary/40 p-4 text-sm text-secondary-foreground">
          <p className="font-medium">Didn&apos;t receive the email?</p>
          <p className="mt-1 leading-relaxed">
            Check your spam folder, or try again with a different email address.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-primary transition hover:text-primary/80"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <FieldGroup>
          <Field data-invalid={!!formError && !email}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
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
        </FieldGroup>

        {formError && (
          <Alert variant="destructive">
            <AlertTitle>Reset failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
