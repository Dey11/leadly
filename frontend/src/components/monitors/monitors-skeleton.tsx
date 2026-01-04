import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export function MonitorsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Monitors"
        description="Monitors listen to specific communities, subreddits, or keywords. Leadly enforces tier limits automatically and keeps the ten most recent scrape jobs for each monitor."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MonitorCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <CreateMonitorFormSkeleton />
        </aside>
      </div>
    </div>
  );
}

function MonitorCardSkeleton() {
  return (
    <Card className="border-border/40 bg-card/40 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-8" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-border/40 flex justify-between gap-2 border-t pt-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-12 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

function CreateMonitorFormSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
