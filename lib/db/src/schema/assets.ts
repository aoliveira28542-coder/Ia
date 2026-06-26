import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ASSET_TYPES = [
  "input_image",
  "generated_video",
  "thumbnail",
  "audio",
  "subtitle",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const assetsTable = pgTable("assets", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  type: text("type").notNull().$type<AssetType>(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull().default(0),
  mime: text("mime").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({
  createdAt: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
