import { Suspense } from "react";
import { cookies } from "next/headers";
import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";
import { ScheduleContent } from "@/components/schedule/schedule-content";
import { KeywordScheduleContent } from "@/components/schedule/keyword-schedule-content";
import { ScheduleSwitcher } from "@/components/schedule/schedule-switcher";
import type { ProductMode } from "@/components/dashboard/product-mode-toggle";

export const metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const mode: ProductMode =
    cookieStore.get("leadly-product-mode")?.value === "keyword"
      ? "keyword"
      : "leadgen";

  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <ScheduleSwitcher initialMode={mode}>
        {mode === "keyword" ? <KeywordScheduleContent /> : <ScheduleContent />}
      </ScheduleSwitcher>
    </Suspense>
  );
}
