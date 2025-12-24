"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length === 6) {
            setOtp(pastedData.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const mutation = useMutation({
        mutationFn: async () => {
            const code = otp.join("");
            if (!emailFromParams) {
                throw new Error("Email is missing. Please go back and register again.");
            }
            if (code.length !== 6) {
                throw new Error("Please enter the complete 6-digit code.");
            }
            return clientApi.verifyEmail({ email: emailFromParams, otp: code });
        },
        onSuccess: () => {
            setFormError(null);
            setSuccess(true);
            setTimeout(() => {
                router.replace("/dashboard");
                router.refresh();
            }, 2000);
        },
        onError: (error: unknown) => {
            setFormError(
                error instanceof Error ? error.message : "Verification failed."
            );
        },
    });

    const resendMutation = useMutation({
        mutationFn: async () => {
            if (!emailFromParams) {
                throw new Error("Email is missing.");
            }
            return clientApi.resendVerificationEmail({ email: emailFromParams });
        },
        onSuccess: () => {
            setResendSuccess(true);
            setFormError(null);
            setTimeout(() => setResendSuccess(false), 5000);
        },
        onError: (error: unknown) => {
            setFormError(
                error instanceof Error ? error.message : "Failed to resend code."
            );
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate();
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        setResendTimer(30);
        resendMutation.mutate();
    };

    if (success) {
        return (
            <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground">Email Verified!</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Redirecting you to the dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Verify your email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    We sent a 6-digit code to
                </p>
                <p className="mt-1 font-medium text-foreground">{emailFromParams}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="h-14 w-12 rounded-lg border-2 border-border bg-background text-center text-2xl font-bold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            aria-label={`Digit ${index + 1}`}
                        />
                    ))}
                </div>

                {formError && (
                    <Alert variant="destructive">
                        <AlertTitle>Verification failed</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                {resendSuccess && (
                    <Alert className="border-green-500/50 text-green-600 dark:border-green-500/30 dark:text-green-400">
                        <AlertTitle>Code sent!</AlertTitle>
                        <AlertDescription>Please check your email for the new code.</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={mutation.isPending || otp.join("").length !== 6}>
                    {mutation.isPending ? "Verifying..." : "Verify email"}
                </Button>

                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive a code?{" "}
                        <button 
                            type="button" 
                            onClick={handleResend}
                            disabled={resendMutation.isPending || resendTimer > 0}
                            className="font-semibold text-primary transition hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendMutation.isPending ? "Resending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                        </button>
                    </p>
                    <Link
                        href="/login"
                        className="inline-block text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
