"use client";

import { ArrowRight, Search, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/shared/cards";

export function NextBestAction() {
  // This would ideally be dynamic based on account state
  // For now, we prioritize: 1. Set up monitor, 2. Review leads, 3. Connect channels

  return (
    <DashboardCard className="bg-primary/5 border-primary/20">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex gap-4">
          <div className="bg-primary/10 text-primary hidden h-12 w-12 shrink-0 items-center justify-center rounded-full md:flex">
            <Zap className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-foreground text-lg font-semibold">
              Review 5 new high-intent leads
            </h3>
            <p className="text-muted-foreground max-w-xl text-sm">
              Your monitor for "CRM recommendations" picked up fresh signals.
              Review them now while they are warm.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="shadow-primary/20 w-full shadow-lg md:w-auto"
        >
          <Link href="/dashboard/leads">
            Review Leads <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </DashboardCard>
  );
}

export function EmptyNextBestAction() {
  return (
    <DashboardCard className="bg-muted/30 border-dashed">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex gap-4">
          <div className="bg-muted text-muted-foreground hidden h-12 w-12 shrink-0 items-center justify-center rounded-full md:flex">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-foreground text-lg font-semibold">
              No active monitors
            </h3>
            <p className="text-muted-foreground max-w-xl text-sm">
              Start monitoring subreddits to find your first leads.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full md:w-auto"
        >
          <Link href="/dashboard/monitors">Create Monitor</Link>
        </Button>
      </div>
    </DashboardCard>
  );
}
