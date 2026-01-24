"use client";

import { useState, useEffect } from "react";
import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";

type ProductMode = "leadgen" | "keyword";

interface ScheduleSwitcherProps {
  leadGenContent: React.ReactNode;
  keywordContent: React.ReactNode;
}

export function ScheduleSwitcher({
  leadGenContent,
  keywordContent,
}: ScheduleSwitcherProps) {
  const [mode, setMode] = useState<ProductMode | null>(null);

  useEffect(() => {
    // Read mode from localStorage
    const stored = localStorage.getItem(
      "leadly-product-mode",
    ) as ProductMode | null;
    setMode(stored === "keyword" ? "keyword" : "leadgen");

    // Listen for mode changes
    const handleModeChange = () => {
      const newMode = localStorage.getItem(
        "leadly-product-mode",
      ) as ProductMode | null;
      setMode(newMode === "keyword" ? "keyword" : "leadgen");
    };

    window.addEventListener("leadly-mode-change", handleModeChange);
    return () =>
      window.removeEventListener("leadly-mode-change", handleModeChange);
  }, []);

  // Show skeleton until mode is determined
  if (mode === null) {
    return <ScheduleSkeleton />;
  }

  if (mode === "keyword") {
    return <>{keywordContent}</>;
  }

  return <>{leadGenContent}</>;
}
