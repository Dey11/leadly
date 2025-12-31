import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  StatCardSkeleton,
  SpotlightCardsSkeleton,
  TableSkeleton,
  LeadQualityMixSkeleton,
  RecentLeadsSkeleton,
  SessionsSkeleton,
  ScheduleCardSkeleton,
} from "@/components/shared/page-skeletons";

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero section */}
      <section className="border-border/40 bg-card/60 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-md md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute top-0 -right-10 h-64 w-64 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-6">
          <DashboardPageHeader
            title="Workspace overview"
            description="Monitor high-signal conversations, review scheduled scrapes, and jump back into leads that need attention."
            action={
              <Button asChild className="shadow-primary/20 shadow-lg">
                <Link href="/dashboard/leads">Open leads workspace</Link>
              </Button>
            }
          />
          <SpotlightCardsSkeleton />
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      {/* Activity and Lead Mix */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <TableSkeleton rows={6} columns={7} />
        <div className="flex flex-col gap-6">
          <LeadQualityMixSkeleton />
          <ScheduleCardSkeleton />
        </div>
      </section>

      {/* Recent leads and sessions */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <RecentLeadsSkeleton count={5} />
        <SessionsSkeleton count={2} />
      </section>
    </div>
  );
}
