import { Suspense } from "react";
import { MonitorsSkeleton } from "@/components/monitors/monitors-skeleton";
import { MonitorsContent } from "@/components/monitors/monitors-content";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Monitors",
};

export default function MonitorsPage() {
  return (
    <Suspense fallback={<MonitorsSkeleton />}>
      <MonitorsContent />
    </Suspense>
  );
}
