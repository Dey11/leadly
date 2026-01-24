import { Suspense } from "react";
import { ScheduleSkeleton } from "@/components/schedule/schedule-skeleton";
import { ScheduleContent } from "@/components/schedule/schedule-content";
import { KeywordScheduleContent } from "@/components/schedule/keyword-schedule-content";
import { ScheduleSwitcher } from "@/components/schedule/schedule-switcher";
export const metadata = {
  title: "Schedule",
};

export default function SchedulePage() {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <ScheduleSwitcher
        leadGenContent={<ScheduleContent />}
        keywordContent={<KeywordScheduleContent />}
      />
    </Suspense>
  );
}
