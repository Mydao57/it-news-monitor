import cors from "cors";
import express from "express";
import { feedsRouter } from "./routes/feeds.js";

export function createApp(corsOrigin: string) {
  const app = express();

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/feeds", feedsRouter);

  return app;
}
