"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProductMode } from "@/components/dashboard/product-mode-toggle";

interface ScheduleSwitcherProps {
  initialMode: ProductMode;
  children: React.ReactNode;
}

// Server renders the correct schedule content for `initialMode` up front
// (no skeleton flash, no double-mount). This wrapper only exists to catch
// a mode change that happens without a navigation already handling it,
// e.g. another tab flipping the mode via localStorage.
export function ScheduleSwitcher({
  initialMode,
  children,
}: ScheduleSwitcherProps) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfStale = (nextMode: ProductMode) => {
      if (nextMode !== initialMode) {
        router.refresh();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "leadly-product-mode") {
        refreshIfStale(event.newValue === "keyword" ? "keyword" : "leadgen");
      }
    };

    const handleModeChange = () => {
      const stored = localStorage.getItem(
        "leadly-product-mode",
      ) as ProductMode | null;
      refreshIfStale(stored === "keyword" ? "keyword" : "leadgen");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leadly-mode-change", handleModeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leadly-mode-change", handleModeChange);
    };
  }, [initialMode, router]);

  return <>{children}</>;
}
