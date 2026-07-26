import type { HydratedDocument } from "mongoose";
import type { FeedDocument } from "../models/Feed.js";
import type { FeedStatus } from "../types.js";

const LIVE_WITHIN_DAYS = 3;
const STALE_WITHIN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export function computeFeedStatus(feed: HydratedDocument<FeedDocument>): FeedStatus {
  if (!feed.lastFetchedAt) return "pending";
  if (feed.lastFetchStatus === "error") return "dead";
  if (!feed.lastPublishedAt) return "stale";

  const ageDays = (Date.now() - feed.lastPublishedAt.getTime()) / DAY_MS;
  if (ageDays <= LIVE_WITHIN_DAYS) return "live";
  if (ageDays <= STALE_WITHIN_DAYS) return "stale";
  return "dead";
}
