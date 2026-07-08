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

// Hook for managing product mode state, backed by a cookie (read on the
// server via `initialMode`) with localStorage kept in sync as a fallback.
export function useProductMode(
  initialMode?: ProductMode,
): [ProductMode, (mode: ProductMode) => void] {
  const [mode, setMode] = useState<ProductMode>(initialMode ?? "leadgen");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reconcile with localStorage in case it disagrees with the
    // server-provided initialMode. This covers two cases: the cookie was
    // blocked/cleared, and — importantly — the one-time migration for users
    // who had a localStorage mode set before the cookie existed. In that case
    // the server rendered content for the (absent) cookie, so we persist the
    // cookie from localStorage and refresh once so SSR content matches the
    // nav. After the refresh the cookie == initialMode and this is a no-op.
    const stored = localStorage.getItem(
      "leadly-product-mode",
    ) as ProductMode | null;
    if (
      (stored === "leadgen" || stored === "keyword") &&
      stored !== (initialMode ?? "leadgen")
    ) {
      setMode(stored);
      document.cookie = `leadly-product-mode=${stored}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMode = (newMode: ProductMode) => {
    if (newMode === mode) return; // No change
    setMode(newMode);
    localStorage.setItem("leadly-product-mode", newMode);
    document.cookie = `leadly-product-mode=${newMode}; path=/; max-age=31536000; samesite=lax`;

    // Dispatch custom event for same-tab listeners (like OverviewSwitcher)
    window.dispatchEvent(new Event("leadly-mode-change"));

    // Always navigate to dashboard when switching modes
    if (pathname === "/dashboard") {
      router.refresh();
    } else {
      router.push("/dashboard");
    }
  };

  return [mode, updateMode];
}
