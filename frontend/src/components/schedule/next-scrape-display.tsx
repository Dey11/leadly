"use client";

import {
  formatMinutesUntil,
  formatUtcHourAsLocal,
  getMinutesUntilNextScrape,
} from "@/lib/format";

interface NextScrapeDisplayProps {
  scheduledHours: number[];
}

/**
 * Client component that displays next scrape countdown and schedule hours in local time.
 * Must be client-side to access the browser's timezone offset.
 */
export function NextScrapeDisplay({ scheduledHours }: NextScrapeDisplayProps) {
  const minutesUntilNext = getMinutesUntilNextScrape(scheduledHours);
  const nextScrapeLabel =
    minutesUntilNext !== null
      ? `Next scrape in ${formatMinutesUntil(minutesUntilNext)}`
      : "No schedule set";

  const primeHoursLabel =
    scheduledHours.length > 0
      ? scheduledHours
          .slice(0, 4)
          .map((h) => formatUtcHourAsLocal(h))
          .join(" · ")
      : "No hours scheduled";

  const windowsText = `${scheduledHours.length} window${scheduledHours.length !== 1 ? "s" : ""} scheduled`;

  return {
    nextScrapeLabel,
    primeHoursLabel,
    windowsText,
  };
}

/**
 * Get next scrape label as a string
 */
export function useNextScrapeLabel(scheduledHours: number[]): string {
  const minutesUntilNext = getMinutesUntilNextScrape(scheduledHours);
  return minutesUntilNext !== null
    ? `Next scrape in ${formatMinutesUntil(minutesUntilNext)}`
    : "No schedule set";
}

/**
 * Format schedule hours for display in local time
 */
export function useLocalScheduleHours(scheduledHours: number[]): string[] {
  return scheduledHours.map((h) => formatUtcHourAsLocal(h));
}
