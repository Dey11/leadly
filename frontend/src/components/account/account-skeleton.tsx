import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Account settings"
        description="Update your profile, manage sessions, and view billing status & usage."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <AccountFormSkeleton />
          <SessionsSkeleton />
        </section>

        <aside className="space-y-4">
          <WorkspaceStatusSkeleton />
          <BillingPanelMiniSkeleton />
          <DangerZoneSkeleton />
        </aside>
      </div>
    </div>
  );
}

function AccountFormSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}

function SessionsSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-52" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 bg-card/80 rounded-2xl border p-4"
          >
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-2 h-3 w-36" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WorkspaceStatusSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-44" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function BillingPanelMiniSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-4 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DangerZoneSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-2 h-4 w-52" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}
