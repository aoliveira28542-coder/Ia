import { pgTable, text, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sceneMemoryTable = pgTable("scene_memory", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  sceneNumber: integer("scene_number").notNull(),
  characterStates: json("character_states").$type<Record<string, string>>().default({}),
  environment: text("environment").notNull().default(""),
  camera: text("camera").notNull().default("medium-shot"),
  lighting: text("lighting").notNull().default("natural daylight"),
  style: json("style").$type<Record<string, string>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSceneMemorySchema = createInsertSchema(sceneMemoryTable).omit({
  createdAt: true,
});

export type InsertSceneMemory = z.infer<typeof insertSceneMemorySchema>;
export type SceneMemory = typeof sceneMemoryTable.$inferSelect;
