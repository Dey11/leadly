"use client";

import { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";

interface OnboardingWrapperProps {
  hasCompletedOnboarding: boolean;
}

export function OnboardingWrapper({ hasCompletedOnboarding }: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check both backend flag and local storage
    const localCompleted = window.localStorage.getItem("leadly-onboarding-completed") === "true";
    
    if (!hasCompletedOnboarding && !localCompleted) {
      setShowOnboarding(true);
    }
  }, [hasCompletedOnboarding]);

  const handleComplete = () => {
    window.localStorage.setItem("leadly-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  if (!showOnboarding) {
    return null;
  }

  return <OnboardingModal onComplete={handleComplete} />;
}
