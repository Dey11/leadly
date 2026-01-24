"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarClock, Layers, Radar, Target } from "lucide-react";
import {
  formatMinutesUntil,
  getMinutesUntilNextScrape,
  formatRelative,
} from "@/lib/format";

interface KeywordSpotlightCardsProps {
  schedule: { scheduledHours: number[] } | null;
  lastCompletedAt: string | null;
  lastJobMatches: number;
  activeMonitors: number;
  keywordSetsCount: number;
  monitorsCount: number;
}

interface SpotlightCard {
  label: string;
  icon: LucideIcon;
  primary: string;
  secondary: string;
}

export function KeywordSpotlightCards({
  schedule,
  lastCompletedAt,
  lastJobMatches,
  activeMonitors,
  keywordSetsCount,
  monitorsCount,
}: KeywordSpotlightCardsProps) {
  const scheduledHours = schedule?.scheduledHours ?? [];

  // Calculate timezone-sensitive values on client
  // Pass 30 as minuteOffset for Keyword Mode
  const minutesUntilNext = getMinutesUntilNextScrape(scheduledHours, 30);
  const nextScrapeLabel =
    minutesUntilNext !== null
      ? `Next scrape in ${formatMinutesUntil(minutesUntilNext)}`
      : "No schedule set";

  const primeHoursLabel =
    scheduledHours.length > 0
      ? scheduledHours
          .slice(0, 4)
          .sort((a, b) => a - b)
          .map((h) => {
            // Shift by 30 mins for keyword mode display
            const date = new Date();
            date.setUTCHours(h, 0, 0, 0);
            date.setMinutes(date.getMinutes() + 30);
            return new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }).format(date);
          })
          .join(" · ")
      : "Set scrape windows to automate keyword monitoring.";

  const lastCompletedLabel = lastCompletedAt
    ? formatRelative(lastCompletedAt)
    : "Awaiting first completion";

  const jobVolumeLabel = lastCompletedAt
    ? `${lastJobMatches} match${lastJobMatches !== 1 ? "es" : ""} in last job`
    : "No job volume yet.";

  const spotlightCards: SpotlightCard[] = [
    {
      label: "Next scrape",
      icon: CalendarClock,
      primary: nextScrapeLabel,
      secondary: schedule
        ? `${scheduledHours.length} window${scheduledHours.length !== 1 ? "s" : ""} scheduled today`
        : "Set up your scrape schedule to automate keyword monitoring.",
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
      primary: `${activeMonitors} active monitors`,
      secondary:
        keywordSetsCount > 0
          ? `${keywordSetsCount} keyword groups · ${monitorsCount} monitors total`
          : "Create keyword groups to begin tracking.",
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
