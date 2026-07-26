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

/** Formats a timestamp as a wire-code, e.g. "07.26 14:32Z" (UTC). */
export function wireCode(iso: string | null): string {
  if (!iso) return "--.-- --:--Z";

  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}Z`;
}
