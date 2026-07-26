import Parser from "rss-parser";
import type { HydratedDocument, Types } from "mongoose";
import { Item } from "../models/Item.js";
import type { FeedDocument } from "../models/Feed.js";

const parser = new Parser();

type ParsedFeed = Awaited<ReturnType<typeof parser.parseURL>>;
type ParsedItem = ParsedFeed["items"][number];

function itemGuid(item: ParsedItem): string {
  return item.guid ?? item.id ?? item.link ?? item.title ?? "";
}

function itemDate(item: ParsedItem): Date | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function upsertItems(feedId: Types.ObjectId, items: ParsedItem[]): Promise<Date | null> {
  let latest: Date | null = null;

  for (const item of items) {
    const guid = itemGuid(item);
    if (!guid || !item.title) continue;

    const isoDate = itemDate(item);
    if (isoDate && (!latest || isoDate > latest)) latest = isoDate;

    await Item.findOneAndUpdate(
      { feedId, guid },
      {
        $set: {
          title: item.title,
          link: item.link ?? null,
          contentSnippet: item.contentSnippet ?? null,
          author: item.creator ?? item.author ?? null,
          categories: item.categories ?? [],
          isoDate,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  return latest;
}

export async function ingestFeed(
  feed: HydratedDocument<FeedDocument>,
): Promise<ParsedFeed | null> {
  try {
    const parsed = await parser.parseURL(feed.url);
    const latestItemDate = await upsertItems(feed._id, parsed.items);

    feed.siteUrl = parsed.link ?? feed.siteUrl;
    feed.description = parsed.description ?? feed.description;
    feed.lastFetchedAt = new Date();
    feed.lastFetchStatus = "ok";
    feed.lastFetchError = null;
    feed.lastPublishedAt = latestItemDate ?? feed.lastPublishedAt;
    await feed.save();

    return parsed;
  } catch (err) {
    feed.lastFetchedAt = new Date();
    feed.lastFetchStatus = "error";
    feed.lastFetchError = err instanceof Error ? err.message : "Unknown fetch error";
    await feed.save();
    return null;
  }
}
