"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountFormProps = {
  defaultName: string;
  defaultEmail: string;
};

export function AccountForm({ defaultName, defaultEmail }: AccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (name === defaultName) {
        throw new Error("Update at least one field before saving.");
      }
      return clientApi.updateAccount({ name });
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage("Profile updated successfully.");
      router.refresh();
    },
    onError: (error: unknown) => {
      setSuccessMessage(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update.",
      );
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: () => clientApi.forgotPassword({ email: defaultEmail }),
    onSuccess: () => setPasswordResetSent(true),
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send reset email.",
      );
    },
  });

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profileMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="account-name">Full name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Section - Read Only */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Email address</CardTitle>
          <CardDescription>Your account email</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-foreground text-sm font-medium">
                {defaultEmail}
              </p>
              <p className="text-muted-foreground text-xs">Current email</p>
            </div>
            <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
              Verified
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {passwordResetSent ? (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <AlertTitle>Reset link sent!</AlertTitle>
              <AlertDescription>
                Check your email ({defaultEmail}) for a link to reset your
                password.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                We&apos;ll send a password reset link to your email address.
              </p>
              <Button
                variant="outline"
                onClick={() => passwordResetMutation.mutate()}
                disabled={passwordResetMutation.isPending}
              >
                {passwordResetMutation.isPending
                  ? "Sending..."
                  : "Send password reset email"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
