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

