"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
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

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailPending, setEmailPending] = useState(false);

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
      setErrorMessage(error instanceof Error ? error.message : "Unable to update.");
    },
  });

  const emailChangeMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail || !emailPassword) {
        throw new Error("Please fill in all fields.");
      }
      return clientApi.requestEmailChange({ newEmail, password: emailPassword });
    },
    onSuccess: () => {
      setEmailError(null);
      setEmailPending(true);
      setNewEmail("");
      setEmailPassword("");
    },
    onError: (error: unknown) => {
      setEmailError(error instanceof Error ? error.message : "Failed to request change.");
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: () => clientApi.forgotPassword({ email: defaultEmail }),
    onSuccess: () => setPasswordResetSent(true),
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to send reset email.");
    },
  });

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(); }} className="space-y-4">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="account-name">Full name</FieldLabel>
                <Input
                  id="account-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </Field>
            </FieldGroup>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="success">
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

      {/* Email Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Email address</CardTitle>
          <CardDescription>Change your account email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{defaultEmail}</p>
                <p className="text-xs text-muted-foreground">Current email</p>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">Verified</span>
            </div>

            {emailPending ? (
              <Alert variant="success">
                <AlertTitle>Confirmation email sent!</AlertTitle>
                <AlertDescription>
                  Check your new email inbox and click the confirmation link.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); emailChangeMutation.mutate(); }} className="space-y-4">
                <FieldGroup className="gap-4">
                  <Field data-invalid={!!emailError}>
                    <FieldLabel htmlFor="new-email">New email address</FieldLabel>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="newemail@example.com"
                    />
                  </Field>
                  <Field data-invalid={!!emailError}>
                    <FieldLabel htmlFor="email-password">Confirm your password</FieldLabel>
                    <Input
                      id="email-password"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>
                </FieldGroup>

                {emailError && <FieldError>{emailError}</FieldError>}

                <Button type="submit" variant="outline" disabled={emailChangeMutation.isPending}>
                  {emailChangeMutation.isPending ? "Sending..." : "Change email"}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordResetSent ? (
            <Alert variant="success">
              <AlertTitle>Reset link sent!</AlertTitle>
              <AlertDescription>
                Check your email ({defaultEmail}) for a link to reset your password.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We&apos;ll send a password reset link to your email address.
              </p>
              <Button
                variant="outline"
                onClick={() => passwordResetMutation.mutate()}
                disabled={passwordResetMutation.isPending}
              >
                {passwordResetMutation.isPending ? "Sending..." : "Send password reset email"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
