import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./db.js";
import { startPoller } from "./services/poller.js";

const PORT = Number(process.env.PORT ?? 4000);
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/it-news-monitor";
const POLL_INTERVAL_MINUTES = Number(process.env.POLL_INTERVAL_MINUTES ?? 15);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

async function main() {
  await connectDB(MONGO_URI);
  console.log("Connected to MongoDB");

  const app = createApp(CORS_ORIGIN);
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });

  startPoller(POLL_INTERVAL_MINUTES);
}

main().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
