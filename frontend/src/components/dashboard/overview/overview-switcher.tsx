"use client";

import { useState, useEffect } from "react";
import { OverviewSkeleton } from "@/components/dashboard/overview/overview-skeleton";

interface OverviewSwitcherProps {
  leadGenContent: React.ReactNode;
  keywordContent: React.ReactNode;
}

type ProductMode = "leadgen" | "keyword";

export function OverviewSwitcher({
  leadGenContent,
  keywordContent,
}: OverviewSwitcherProps) {
  const [mode, setMode] = useState<ProductMode | null>(null);

  useEffect(() => {
    // Read mode from localStorage
    const stored = localStorage.getItem("leadly-product-mode") as ProductMode | null;
    setMode(stored === "keyword" ? "keyword" : "leadgen");

    // Listen for storage changes (when mode is toggled)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leadly-product-mode") {
        setMode(e.newValue === "keyword" ? "keyword" : "leadgen");
      }
    };

    // Also listen for custom event for same-tab updates
    const handleModeChange = () => {
      const newMode = localStorage.getItem("leadly-product-mode") as ProductMode | null;
      setMode(newMode === "keyword" ? "keyword" : "leadgen");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leadly-mode-change", handleModeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leadly-mode-change", handleModeChange);
    };
  }, []);

  // Show skeleton until mode is determined
  if (mode === null) {
    return <OverviewSkeleton />;
  }

  if (mode === "keyword") {
    return <>{keywordContent}</>;
  }

  return <>{leadGenContent}</>;
}
