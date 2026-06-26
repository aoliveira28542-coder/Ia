import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PRESET_STYLES = ["cinematic", "anime", "realistic", "cartoon", "documentary"] as const;
export type PresetStyle = (typeof PRESET_STYLES)[number];

export const presetsTable = pgTable("generation_presets", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  resolution: text("resolution").notNull().default("1080p"),
  fps: integer("fps").notNull().default(24),
  style: text("style").notNull().default("cinematic").$type<PresetStyle>(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPresetSchema = createInsertSchema(presetsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof presetsTable.$inferSelect;
