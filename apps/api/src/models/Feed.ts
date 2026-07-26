import { Schema, model, type InferSchemaType } from "mongoose";

const feedSchema = new Schema({
  url: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  siteUrl: { type: String },
  description: { type: String },
  lastFetchedAt: { type: Date, default: null },
  lastFetchStatus: { type: String, enum: ["ok", "error"], default: null },
  lastFetchError: { type: String, default: null },
  lastPublishedAt: { type: Date, default: null },
  lastViewedAt: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: () => new Date() },
});

export type FeedDocument = InferSchemaType<typeof feedSchema>;

export const Feed = model("Feed", feedSchema);
