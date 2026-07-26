import { Schema, model, Types, type InferSchemaType } from "mongoose";

const itemSchema = new Schema({
  feedId: { type: Schema.Types.ObjectId, ref: "Feed", required: true },
  guid: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String },
  contentSnippet: { type: String },
  author: { type: String },
  isoDate: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

itemSchema.index({ feedId: 1, guid: 1 }, { unique: true });
itemSchema.index({ feedId: 1, isoDate: -1 });

export type ItemDocument = InferSchemaType<typeof itemSchema> & {
  feedId: Types.ObjectId;
};

export const Item = model("Item", itemSchema);
