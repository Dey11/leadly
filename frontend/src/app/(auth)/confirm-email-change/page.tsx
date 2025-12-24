"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

function ConfirmEmailChangeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const mutation = useMutation({
        mutationFn: () => clientApi.confirmEmailChange({ token }),
        onSuccess: () => setStatus("success"),
        onError: (error: unknown) => {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Failed to confirm email change.");
        },
    });

    useEffect(() => {
        if (token) {
            mutation.mutate();
        } else {
            setStatus("error");
            setErrorMessage("Invalid confirmation link.");
        }
    }, []);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Confirming your email change...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Email changed!</h1>
                <p className="text-sm text-muted-foreground">
                    Your email has been updated successfully. Please log in with your new email.
                </p>
                <Link href="/login">
                    <Button className="w-full">Sign in</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-8 shadow-sm backdrop-blur text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Confirmation failed</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Link href="/dashboard/account">
                <Button variant="outline" className="w-full">Back to account settings</Button>
            </Link>
        </div>
    );
}

export default function ConfirmEmailChangePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <ConfirmEmailChangeContent />
        </Suspense>
    );
}
