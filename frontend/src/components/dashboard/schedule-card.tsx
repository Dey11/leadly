"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUtcHourAsLocal } from "@/lib/format";

interface DashboardScheduleCardProps {
  schedule: { scheduledHours: number[] } | null;
  productMode?: "lead_gen" | "keyword";
}

/**
 * Client component that displays the schedule card with local timezone hours.
 * Must be client-side to access the browser's timezone offset.
 */
export function DashboardScheduleCard({
  schedule,
  productMode,
}: DashboardScheduleCardProps) {
  const scheduledHours = schedule?.scheduledHours ?? [];

  const formatHour = (h: number) => {
    const date = new Date();
    date.setUTCHours(h, 0, 0, 0);
    if (productMode === "keyword") {
      date.setMinutes(date.getMinutes() + 30);
    }
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // Select prime hours (first 4 hours sorted)
  const primeHours = [...scheduledHours].sort((a, b) => a - b).slice(0, 4);
  const primeHoursLabel =
    primeHours.length > 0 ? primeHours.map(formatHour).join(" · ") : "";

  // Format schedule hour badges
  const scheduleHourBadges = scheduledHours.slice(0, 8).map(formatHour);

  return (
    <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>
          Upcoming scrape windows for your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-4 text-sm">
        {schedule ? (
          <>
            <div className="border-primary/20 bg-primary/10 text-primary rounded-2xl border p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <Target className="size-4" aria-hidden />
                Prime hours
              </div>
              <p className="text-primary/80 mt-1 text-xs">
                {primeHours.length
                  ? primeHoursLabel
                  : "Dial in a handful of windows to maximise Reddit visibility."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {scheduleHourBadges.length > 0 ? (
                scheduleHourBadges.map((hour) => (
                  <Badge
                    key={hour}
                    variant="outline"
                    className="border-border/70 bg-background/95 text-foreground rounded-full text-xs"
                  >
                    {hour}
                  </Badge>
                ))
              ) : (
                <span className="text-xs">
                  No hours selected yet. Add monitoring windows to begin
                  scraping.
                </span>
              )}
              {scheduledHours.length > scheduleHourBadges.length ? (
                <Badge
                  variant="outline"
                  className="border-border/70 bg-background/95 text-foreground rounded-full text-xs"
                >
                  +{scheduledHours.length - scheduleHourBadges.length} more
                </Badge>
              ) : null}
            </div>
            <p className="text-xs">
              Need more cadences? Paid plans unlock higher frequencies once
              billing is live.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/dashboard/schedule">Adjust schedule</Link>
            </Button>
          </>
        ) : (
          <div className="border-border/60 bg-background/85 rounded-2xl border p-4 text-sm">
            No schedule yet. We will create one automatically after your first
            monitor is live.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
