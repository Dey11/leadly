import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Base card skeleton with customizable content
export function CardSkeleton({
  className = "",
  headerHeight = "h-6",
  contentLines = 3,
}: {
  className?: string;
  headerHeight?: string;
  contentLines?: number;
}) {
  return (
    <Card className={`border-border/60 bg-background/85 ${className}`}>
      <CardHeader className="pb-4">
        <Skeleton className={`${headerHeight} w-2/3`} />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${85 - i * 10}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// Stat card skeleton matching DashboardStatCard layout
export function StatCardSkeleton() {
  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </CardContent>
    </Card>
  );
}

// Table skeleton for recent activity and similar tables
export function TableSkeleton({
  rows = 6,
  columns = 7,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <Card className="border-border/60 bg-card/95 overflow-hidden rounded-3xl border shadow-sm">
      <CardHeader className="border-border/50 border-b pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="w-full min-w-[720px]">
          {/* Header row */}
          <div className="border-border/60 flex gap-4 border-b py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="border-border/40 flex gap-4 border-b py-4 last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className="h-4 flex-1"
                  style={{ opacity: 1 - rowIdx * 0.1 }}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Lead quality mix card skeleton
export function LeadQualityMixSkeleton() {
  return (
    <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Score circle */}
        <div className="border-border/60 bg-background/85 flex items-center justify-between rounded-2xl border px-4 py-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        {/* Progress bar */}
        <Skeleton className="h-2 w-full rounded-full" />
        {/* Breakdown items */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border/60 bg-background/85 flex items-center justify-between rounded-2xl border px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// Schedule card skeleton
export function ScheduleCardSkeleton() {
  return (
    <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// Recent leads skeleton
export function RecentLeadsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
      <CardHeader className="border-border/50 border-b pb-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 bg-background/85 rounded-2xl border p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// Sessions skeleton
export function SessionsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 bg-background/85 rounded-2xl border px-4 py-3"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// Spotlight cards skeleton
export function SpotlightCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="border-border/50 bg-card/80 rounded-2xl border backdrop-blur-sm"
        >
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="mb-2 h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
