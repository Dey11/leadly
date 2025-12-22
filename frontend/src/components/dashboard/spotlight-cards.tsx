"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarClock, Layers, Radar, Target } from "lucide-react";
import {
  formatMinutesUntil,
  formatUtcHourAsLocal,
  getMinutesUntilNextScrape,
} from "@/lib/format";

interface DashboardSpotlightCardsProps {
  schedule: { scheduledHours: number[] } | null;
  lastCompletedLabel: string;
  jobVolumeLabel: string;
  activeMonitorCount: number;
  icpCount: number;
  monitorCount: number;
}

interface SpotlightCard {
  label: string;
  icon: LucideIcon;
  primary: string;
  secondary: string;
}

export function DashboardSpotlightCards({
  schedule,
  lastCompletedLabel,
  jobVolumeLabel,
  activeMonitorCount,
  icpCount,
  monitorCount,
}: DashboardSpotlightCardsProps) {
  const scheduledHours = schedule?.scheduledHours ?? [];

  // Calculate timezone-sensitive values on client
  const minutesUntilNext = getMinutesUntilNextScrape(scheduledHours);
  const nextScrapeLabel =
    minutesUntilNext !== null
      ? `Next scrape in ${formatMinutesUntil(minutesUntilNext)}`
      : "No schedule set";

  const primeHoursLabel =
    scheduledHours.length > 0
      ? scheduledHours
          .slice(0, 4)
          .sort((a, b) => a - b)
          .map((h) => formatUtcHourAsLocal(h))
          .join(" · ")
      : "Aim for late morning, lunchtime, and early evening scrapes.";

  const spotlightCards: SpotlightCard[] = [
    {
      label: "Next scrape",
      icon: CalendarClock,
      primary: nextScrapeLabel,
      secondary: schedule
        ? `${scheduledHours.length} window${scheduledHours.length !== 1 ? "s" : ""} scheduled today`
        : "Set up your scrape schedule to automate lead discovery.",
    },
    {
      label: "Last scrape",
      icon: Radar,
      primary: lastCompletedLabel,
      secondary: jobVolumeLabel,
    },
    {
      label: "Cadence",
      icon: Target,
      primary: schedule ? primeHoursLabel : "Select scrape windows",
      secondary: schedule
        ? "Lean on these windows to catch peak community momentum."
        : "Choose hours to start automated scrapes.",
    },
    {
      label: "Coverage",
      icon: Layers,
      primary: `${activeMonitorCount} active monitors`,
      secondary:
        icpCount > 0
          ? `${icpCount} ICPs managed · ${monitorCount} monitors total`
          : "Spin up your first ICP to begin tracking.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {spotlightCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="border-border/50 bg-background/50 hover:border-primary/20 rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition-colors"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <Icon className="text-primary size-4" aria-hidden />
              {card.label}
            </div>
            <p className="text-foreground mt-3 text-sm leading-tight font-semibold">
              {card.primary}
            </p>
            <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
              {card.secondary}
            </p>
          </div>
        );
      })}
    </div>
  );
}
