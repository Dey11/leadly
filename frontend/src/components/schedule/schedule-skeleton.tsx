import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Scrape schedule"
        description="Control when Leadly scrapes each monitor. Leadly respects plan limits so you stay compliant while covering the hours that matter."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <ScheduleFormSkeleton />
        </section>
        <aside className="space-y-4">
          <PlanLimitsSkeleton />
          <CurrentScheduleSkeleton />
        </aside>
      </div>
    </div>
  );
}

function ScheduleFormSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time slot grid */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

function PlanLimitsSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-4 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

function CurrentScheduleSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
