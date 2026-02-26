"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";

interface OnboardingWrapperProps {
  hasCompletedOnboarding: boolean;
}

export function OnboardingWrapper({
  hasCompletedOnboarding,
}: OnboardingWrapperProps) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check both backend flag and local storage
    const localCompleted =
      window.localStorage.getItem("leadly-onboarding-completed") === "true";

    setShowOnboarding(!hasCompletedOnboarding && !localCompleted);
  }, [hasCompletedOnboarding]);

  const handleComplete = () => {
    window.localStorage.setItem("leadly-onboarding-completed", "true");
    setShowOnboarding(false);
    // Refresh server components so Walkthrough receives updated hasCompletedOnboarding
    router.refresh();
  };

  if (!showOnboarding) {
    return null;
  }

  return <OnboardingModal onComplete={handleComplete} />;
}
