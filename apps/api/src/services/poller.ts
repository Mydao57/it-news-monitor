import { Feed } from "../models/Feed.js";
import { ingestFeed } from "./ingest.js";

export function startPoller(intervalMinutes: number): NodeJS.Timeout {
  const run = async () => {
    const feeds = await Feed.find();
    for (const feed of feeds) {
      try {
        await ingestFeed(feed);
      } catch (err) {
        console.error(`Poller failed for feed ${feed.url}:`, err);
      }
    }
  };

  void run();
  return setInterval(run, intervalMinutes * 60 * 1000);
}
