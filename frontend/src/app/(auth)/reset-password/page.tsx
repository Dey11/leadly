"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!token) {
                throw new Error("Invalid reset link. Please request a new password reset.");
            }
            if (!password) {
                throw new Error("Please enter a new password.");
            }
            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters.");
            }
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }
            return clientApi.resetPassword({ token, password });
        },
        onSuccess: () => {
            setFormError(null);
            setSuccess(true);
        },
        onError: (error: unknown) => {
            setFormError(
                error instanceof Error ? error.message : "Password reset failed."
            );
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate();
    };

    if (!token) {
        return (
            <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Invalid reset link</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This password reset link is invalid or has expired.
                    </p>
                </div>
                <Link href="/forgot-password" className="block">
                    <Button className="w-full">Request new reset link</Button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground">Password reset!</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your password has been successfully reset.
                    </p>
                </div>
                <Link href="/login" className="block">
                    <Button className="w-full">Sign in with new password</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Set new password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6">
                <FieldGroup>
                    <Field data-invalid={!!formError && !password}>
                        <FieldLabel htmlFor="password">New password</FieldLabel>
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
                        {!password && formError && <FieldError>Password is required.</FieldError>}
                    </Field>
                    <Field data-invalid={!!formError && password !== confirmPassword}>
                        <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            aria-invalid={!!formError && password !== confirmPassword}
                            required
                        />
                    </Field>
                </FieldGroup>

                {formError && (
                    <Alert variant="destructive">
                        <AlertTitle>Reset failed</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Resetting..." : "Reset password"}
                </Button>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
