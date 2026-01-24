"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface EmailVerificationFormProps {
  email: string;
}

export function EmailVerificationForm({ email }: EmailVerificationFormProps) {
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      return clientApi.resendVerificationEmail({ email });
    },
    onSuccess: () => {
      setFormError(null);
      setCodeSent(true);
      setResendTimer(30);
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to send verification email.",
      );
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const code = otp.join("");
      if (code.length !== 6) {
        throw new Error("Please enter the complete 6-digit code.");
      }
      return clientApi.verifyEmail({ email, otp: code });
    },
    onSuccess: () => {
      setFormError(null);
      setSuccess(true);
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["account"] });
      // Refresh the page after a short delay to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error: unknown) => {
      setFormError(
        error instanceof Error ? error.message : "Verification failed.",
      );
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verifyMutation.mutate();
  };

  const handleSendCode = () => {
    if (resendTimer > 0) return;
    sendOtpMutation.mutate();
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">
          Email verified successfully! Refreshing...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {codeSent ? (
          <>
            Enter the 6-digit code sent to{" "}
            <span className="text-foreground font-medium">{email}</span>
          </>
        ) : (
          <>
            Already have a code? Enter it below, or request a new one to be sent
            to <span className="text-foreground font-medium">{email}</span>
          </>
        )}
      </p>

      <div className="flex justify-start gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 h-12 w-10 rounded-lg border-2 text-center text-xl font-bold transition-all focus:ring-2 focus:outline-none"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={verifyMutation.isPending || otp.join("").length !== 6}
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify email"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSendCode}
          disabled={sendOtpMutation.isPending || resendTimer > 0}
        >
          {sendOtpMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : resendTimer > 0 ? (
            `Resend in ${resendTimer}s`
          ) : codeSent ? (
            "Resend code"
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send code
            </>
          )}
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        Check your spam folder if you don&apos;t see the email. Code is valid
        for 60 minutes.
      </p>
    </form>
  );
}
