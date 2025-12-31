import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero section */}
      <section className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm md:p-8">
        <div className="bg-primary/5 pointer-events-none absolute top-0 -right-10 h-64 w-64 rounded-full blur-[100px]" />
        <div className="relative z-10 flex flex-col gap-6">
          <DashboardPageHeader
            title="Billing & Subscription"
            description="Manage your plan, track usage quotas, and unlock more capacity."
          />
          <Skeleton className="h-4 w-96 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </section>

      {/* Main content */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <BillingPanelSkeleton />
        <AvailablePlansSkeleton />
      </section>
    </div>
  );
}

function BillingPanelSkeleton() {
  return (
    <Card className="border-border bg-card rounded-3xl border shadow-sm">
      <CardHeader className="border-border/50 border-b pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Usage meters */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border/60 bg-muted/20 rounded-2xl border p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-6 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AvailablePlansSkeleton() {
  return (
    <Card className="border-border bg-card h-fit rounded-3xl border shadow-sm">
      <CardHeader className="border-border/50 border-b pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-44" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-border/60 rounded-2xl border p-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="border-border/40 mt-3 space-y-2 border-t pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
