export type FeedStatus = "pending" | "live" | "stale" | "dead";

export interface Feed {
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

export interface FeedItem {
  id: string;
  title: string;
  link: string | null;
  contentSnippet: string | null;
  author: string | null;
  isoDate: string | null;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function listFeeds(): Promise<Feed[]> {
  return request<Feed[]>("/api/feeds");
}

export function createFeed(input: { url: string; name?: string }): Promise<Feed> {
  return request<Feed>("/api/feeds", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteFeed(id: string): Promise<void> {
  return request<void>(`/api/feeds/${id}`, { method: "DELETE" });
}

export function refreshFeed(id: string): Promise<Feed> {
  return request<Feed>(`/api/feeds/${id}/refresh`, { method: "POST" });
}

export function getFeedItems(id: string): Promise<{ feed: Feed; items: FeedItem[] }> {
  return request(`/api/feeds/${id}/items`);
}

export { ApiError };
