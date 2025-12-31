import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export function IcpsSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <DashboardPageHeader
        title="ICP library"
        description="Document detailed buyer definitions so Leadly can recognise the conversations that matter and qualify intent with confidence."
        action={
          <Button asChild className="shadow-primary/20 shadow-lg">
            <Link href="/dashboard/icps/create">
              <Plus className="mr-2 h-4 w-4" /> Create New ICP
            </Link>
          </Button>
        }
      />

      <section className="space-y-6">
        <div className="grid gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <IcpCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function IcpCardSkeleton() {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="bg-secondary/30 space-y-2 rounded-2xl p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="border-border/60 bg-card/80 space-y-4 rounded-2xl border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>

        {/* Monitors list */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="border-border/60 bg-card/80 flex items-center justify-between rounded-xl border px-4 py-2"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </CardFooter>
    </Card>
  );
}
