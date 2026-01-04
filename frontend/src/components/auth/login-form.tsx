"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

function sanitizeReturnUrl(value?: string) {
  if (!value) {
    return "/dashboard";
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (error) {
    console.warn("Failed to decode returnUrl", value, error);
  }

  if (decoded.startsWith("//")) {
    return "/dashboard";
  }
  if (!decoded.startsWith("/")) {
    return "/dashboard";
  }
  return decoded;
}

const COOKIE_NAME = "next_redirect";

function clearNextRedirectCookie() {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const fallbackReturnUrl = sanitizeReturnUrl(
    searchParams.get("next") ?? undefined,
  );
  const resolvedReturnUrl = returnUrl ?? fallbackReturnUrl;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.requiresVerification) {
          router.replace(
            `/verify-email?email=${encodeURIComponent(data.email)}`,
          );
          return;
        }
        throw new Error(data.error || "Login failed");
      }
      return data;
    },
    onSuccess: (data) => {
      if (!data) return;
      setFormError(null);
      clearNextRedirectCookie();
      router.replace(resolvedReturnUrl ?? "/dashboard");
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof Error ? error.message : "Unable to sign in.",
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
              className="text-primary hover:text-primary/80 text-sm font-medium transition"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        New to Leadly?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-primary/80 font-semibold transition"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
