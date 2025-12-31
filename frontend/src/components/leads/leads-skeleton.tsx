import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export function LeadsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="Leads"
        description="Manage and track leads surfaced from your monitors."
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="ml-auto h-10 w-24 rounded-md" />
      </div>

      {/* Leads table */}
      <Card className="border-border/60 bg-card/95 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {/* Table header */}
          <div className="border-border/60 bg-muted/30 flex items-center gap-4 border-b px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 max-w-[300px] flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-border/40 flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
              style={{ opacity: 1 - i * 0.08 }}
            >
              <Skeleton className="h-4 w-4" />
              <div className="max-w-[300px] flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}
