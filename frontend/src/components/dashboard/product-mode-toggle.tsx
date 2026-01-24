"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductMode = "leadgen" | "keyword";

type ProductModeToggleProps = {
  mode: ProductMode;
  onModeChange: (mode: ProductMode) => void;
  className?: string;
};

export function ProductModeToggle({
  mode,
  onModeChange,
  className,
}: ProductModeToggleProps) {
  return (
    <div
      className={cn(
        "border-border/60 bg-muted/50 flex items-center gap-1 rounded-xl border p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange("leadgen")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          mode === "leadgen"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Sparkles className="size-4" />
        <span>Lead Gen</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("keyword")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          mode === "keyword"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Search className="size-4" />
        <span>Keyword</span>
      </button>
    </div>
  );
}

// Hook for managing product mode state with localStorage persistence
export function useProductMode(): [ProductMode, (mode: ProductMode) => void] {
  const [mode, setMode] = useState<ProductMode>("leadgen");
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem(
      "leadly-product-mode",
    ) as ProductMode | null;
    if (stored === "leadgen" || stored === "keyword") {
      setMode(stored);
    }
    setIsHydrated(true);
  }, []);

  const updateMode = (newMode: ProductMode) => {
    if (newMode === mode) return; // No change
    setMode(newMode);
    localStorage.setItem("leadly-product-mode", newMode);

    // Dispatch custom event for same-tab listeners (like OverviewSwitcher)
    window.dispatchEvent(new Event("leadly-mode-change"));

    // Always navigate to dashboard when switching modes
    if (pathname === "/dashboard") {
      router.refresh();
    } else {
      router.push("/dashboard");
    }
  };

  return [isHydrated ? mode : "leadgen", updateMode];
}
