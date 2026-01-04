import { Suspense } from "react";
import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";
import { ScheduleContent } from "@/components/schedule/schedule-content";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Schedule · ${siteConfig.name}`,
};

export default function SchedulePage() {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <ScheduleContent />
    </Suspense>
  );
}
