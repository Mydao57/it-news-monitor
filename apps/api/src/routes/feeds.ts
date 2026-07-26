import { Router, type Request, type Response, type NextFunction } from "express";
import type { HydratedDocument } from "mongoose";
import { Feed, type FeedDocument } from "../models/Feed.js";
import { Item } from "../models/Item.js";
import { ingestFeed } from "../services/ingest.js";
import { computeFeedStatus } from "../services/status.js";
import type { FeedSummary } from "../types.js";

export const feedsRouter = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function toSummary(feed: HydratedDocument<FeedDocument>): Promise<FeedSummary> {
  const [itemCount, unreadCount] = await Promise.all([
    Item.countDocuments({ feedId: feed._id }),
    Item.countDocuments({
      feedId: feed._id,
      createdAt: { $gt: feed.lastViewedAt ?? feed.createdAt },
    }),
  ]);

  return {
    id: feed._id.toString(),
    url: feed.url,
    name: feed.name,
    siteUrl: feed.siteUrl ?? undefined,
    description: feed.description ?? undefined,
    status: computeFeedStatus(feed),
    lastFetchedAt: feed.lastFetchedAt?.toISOString() ?? null,
    lastFetchError: feed.lastFetchError ?? null,
    lastPublishedAt: feed.lastPublishedAt?.toISOString() ?? null,
    itemCount,
    unreadCount,
  };
}

feedsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    const summaries = await Promise.all(feeds.map(toSummary));
    res.json(summaries);
  }),
);

feedsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const url = typeof req.body.url === "string" ? req.body.url.trim() : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!url || !isValidUrl(url)) {
      res.status(400).json({ error: "A valid feed URL is required." });
      return;
    }

    const existing = await Feed.findOne({ url });
    if (existing) {
      res.status(409).json({ error: "This feed is already being monitored." });
      return;
    }

    const feed = new Feed({ url, name: name || url });
    await feed.save();

    const parsed = await ingestFeed(feed);
    if (!name && parsed?.title) {
      feed.name = parsed.title;
      await feed.save();
    }

    res.status(201).json(await toSummary(feed));
  }),
);

feedsRouter.post(
  "/:id/refresh",
  asyncHandler(async (req, res) => {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      res.status(404).json({ error: "Feed not found." });
      return;
    }

    await ingestFeed(feed);
    res.json(await toSummary(feed));
  }),
);

feedsRouter.get(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      res.status(404).json({ error: "Feed not found." });
      return;
    }

    const items = await Item.find({ feedId: feed._id })
      .sort({ isoDate: -1, createdAt: -1 })
      .limit(200);

    feed.lastViewedAt = new Date();
    await feed.save();

    res.json({
      feed: await toSummary(feed),
      items: items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        link: item.link ?? null,
        contentSnippet: item.contentSnippet ?? null,
        author: item.author ?? null,
        isoDate: item.isoDate?.toISOString() ?? null,
      })),
    });
  }),
);

feedsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const feed = await Feed.findByIdAndDelete(req.params.id);
    if (!feed) {
      res.status(404).json({ error: "Feed not found." });
      return;
    }

    await Item.deleteMany({ feedId: feed._id });
    res.status(204).send();
  }),
);
