export function relativeTime(iso: string | null): string {
  if (!iso) return "never";

  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

const MONTH_ABBREV = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a timestamp as a wire-code in local time, e.g. "26 Jul · 14:32".
 * Uses a day + month-name order (never DD.MM or MM.DD) so it can't be
 * misread as the other date order, and shows the reader's own local time
 * rather than UTC.
 */
export function wireCode(iso: string | null): string {
  if (!iso) return "-- --- · --:--";

  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const yearSuffix = year !== new Date().getFullYear() ? ` ${year}` : "";

  return `${date.getDate()} ${MONTH_ABBREV[date.getMonth()]}${yearSuffix} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
