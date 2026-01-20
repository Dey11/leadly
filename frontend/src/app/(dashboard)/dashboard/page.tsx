import { Suspense } from "react";
import { OverviewSkeleton } from "@/components/dashboard/overview/overview-skeleton";
import { OverviewContent } from "@/components/dashboard/overview/overview-content";
import { KeywordOverviewContent } from "@/components/keywords/keyword-overview-content";
import { OverviewSwitcher } from "@/components/dashboard/overview/overview-switcher";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Dashboard · ${siteConfig.name}`,
};

export default function DashboardHome() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewSwitcher
        leadGenContent={<OverviewContent />}
        keywordContent={<KeywordOverviewContent />}
      />
    </Suspense>
  );
}
