import { Suspense } from "react";
import { cookies } from "next/headers";
import { OverviewSkeleton } from "@/components/dashboard/overview/overview-skeleton";
import { OverviewContent } from "@/components/dashboard/overview/overview-content";
import { KeywordOverviewContent } from "@/components/keywords/keyword-overview-content";
import { OverviewSwitcher } from "@/components/dashboard/overview/overview-switcher";
import type { ProductMode } from "@/components/dashboard/product-mode-toggle";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardHome() {
  const cookieStore = await cookies();
  const mode: ProductMode =
    cookieStore.get("leadly-product-mode")?.value === "keyword"
      ? "keyword"
      : "leadgen";

  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewSwitcher initialMode={mode}>
        {mode === "keyword" ? <KeywordOverviewContent /> : <OverviewContent />}
      </OverviewSwitcher>
    </Suspense>
  );
}
