export type FeedStatus = "pending" | "live" | "stale" | "dead";

export interface FeedSummary {
  id: string;
  url: string;
  name: string;
  siteUrl?: string;
  description?: string;
  status: FeedStatus;
  lastFetchedAt: string | null;
  lastFetchError: string | null;
  lastPublishedAt: string | null;
  itemCount: number;
  unreadCount: number;
}
