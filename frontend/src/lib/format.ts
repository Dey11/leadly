const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function formatDate(date: string | number | Date) {
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | number | Date) {
  return dateTimeFormatter.format(new Date(date));
}

export function formatRelative(date: string | number | Date) {
  const target = new Date(date).getTime();
  const now = Date.now();
  const diff = target - now;
  const diffMinutes = Math.round(diff / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return relativeFormatter.format(diffDays, "day");
}

export function formatHour(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatHourList(hours: number[]) {
  return hours.map(formatHour).join(", ");
}

/**
 * Format a UTC hour (0-23) as a local time string.
 * Properly handles half-hour timezone offsets like GMT+5:30.
 */
export function formatUtcHourAsLocal(utcHour: number): string {
  // Create a date at the specified UTC hour
  const date = new Date();
  date.setUTCHours(utcHour, 0, 0, 0);

  // Format in local time - this automatically handles all timezone offsets
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format a list of UTC hours as local time strings.
 */
export function formatUtcHourListAsLocal(utcHours: number[]): string {
  return utcHours.map(formatUtcHourAsLocal).join(", ");
}

/**
 * Calculate minutes until the next scheduled scrape.
 * Returns null if no hours are scheduled.
 */
export function getMinutesUntilNextScrape(
  scheduledUtcHours: number[],
  minuteOffset = 0,
): number | null {
  if (scheduledUtcHours.length === 0) return null;

  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  const currentMinutes = now.getUTCMinutes();

  const sortedHours = [...scheduledUtcHours].sort((a, b) => a - b);

  // Check if current hour is scheduled and we haven't passed the offset minute
  if (sortedHours.includes(currentUtcHour) && currentMinutes < minuteOffset) {
    return minuteOffset - currentMinutes;
  }

  // Find next upcoming hour
  let nextHour = sortedHours.find((h) => h > currentUtcHour);

  if (nextHour !== undefined) {
    // Diff in hours converted to minutes, minus current minutes, plus offset
    return (nextHour - currentUtcHour) * 60 - currentMinutes + minuteOffset;
  }

  // Wrap to first hour tomorrow
  nextHour = sortedHours[0];
  return (24 - currentUtcHour + nextHour) * 60 - currentMinutes + minuteOffset;
}

/**
 * Format minutes until next scrape into a human-readable string.
 */
export function formatMinutesUntil(minutes: number): string {
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
