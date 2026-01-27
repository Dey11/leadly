"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building2, Briefcase, Users, MessageSquare, ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { toast } from "sonner";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OCCUPATION_OPTIONS = [
  { value: "founder", label: "Founder / CEO" },
  { value: "marketer", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "developer", label: "Developer" },
  { value: "freelancer", label: "Freelancer" },
  { value: "agency", label: "Agency" },
  { value: "other", label: "Other" },
];

const REFERRER_OPTIONS = [
  { value: "google", label: "Google Search" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "friend", label: "Friend / Referral" },
  { value: "reddit", label: "Reddit" },
  { value: "other", label: "Other" },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

interface ProfileData {
  company: string;
  occupation: string;
  referrer: string;
  sampleDm: string;
}

const STEPS = [
  {
    title: "What's your company or business?",
    description: "This helps us personalize your cold DMs with your brand.",
    icon: Building2,
  },
  {
    title: "What's your role?",
    description: "We'll tailor the experience based on how you work.",
    icon: Briefcase,
  },
  {
    title: "How did you hear about us?",
    description: "Just curious! This helps us improve.",
    icon: Users,
  },
  {
    title: "Share a sample cold DM",
    description: "Paste a DM you've sent before. We'll match this tone when generating messages.",
    icon: MessageSquare,
  },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    company: "",
    occupation: "",
    referrer: "",
    sampleDm: "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProfileData> & { hasCompletedOnboarding: boolean }) =>
      clientApi.updateProfile(data),
    onSuccess: () => {
      setOpen(false);
      onComplete();
    },
    onError: (error) => {
      toast.error("Failed to save profile", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    updateMutation.mutate({ hasCompletedOnboarding: true });
  };

  const handleFinish = () => {
    updateMutation.mutate({
      ...profileData,
      hasCompletedOnboarding: true,
    });
  };

  const CurrentIcon = STEPS[step].icon;
  const isLastStep = step === STEPS.length - 1;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger on Enter in textarea (step 3)
    if (e.key === "Enter" && step !== 3 && !updateMutation.isPending) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleSkip();
      }
    }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CurrentIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{STEPS[step].title}</DialogTitle>
          <DialogDescription className="text-sm">
            {STEPS[step].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="company">Company / Business name</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={profileData.company}
                onChange={(e) =>
                  setProfileData({ ...profileData, company: e.target.value })
                }
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>Your role</Label>
              <Select
                value={profileData.occupation}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, occupation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>How did you find us?</Label>
              <Select
                value={profileData.referrer}
                onValueChange={(value) =>
                  setProfileData({ ...profileData, referrer: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="sampleDm">Sample cold DM (optional)</Label>
              <Textarea
                id="sampleDm"
                placeholder="Hey! Saw your post about... I run a [product] that helps with..."
                className="min-h-[120px] resize-none"
                value={profileData.sampleDm}
                onChange={(e) =>
                  setProfileData({ ...profileData, sampleDm: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                We'll use this as a reference for generating personalized DMs.
              </p>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 pb-2">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                index <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={updateMutation.isPending}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={updateMutation.isPending}
            >
              {isLastStep ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
