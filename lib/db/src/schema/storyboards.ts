import { pgTable, text, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const CAMERA_ANGLES = [
  "close-up",
  "wide-shot",
  "medium-shot",
  "tracking-shot",
  "overhead",
  "dutch-angle",
  "pov",
  "two-shot",
] as const;

export const SCENE_STATUSES = ["pending", "processing", "done", "failed"] as const;
export type SceneStatus = (typeof SCENE_STATUSES)[number];

export const storyboardsTable = pgTable("storyboards", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  sceneNumber: integer("scene_number").notNull(),
  scenePrompt: text("scene_prompt").notNull(),
  duration: integer("duration").notNull().default(5),
  camera: text("camera").notNull().default("medium-shot"),
  lighting: text("lighting").notNull().default("natural daylight"),
  characters: json("characters").$type<string[]>().default([]),
  style: json("style").$type<Record<string, string>>().default({}),
  status: text("status").notNull().default("pending").$type<SceneStatus>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoryboardSchema = createInsertSchema(storyboardsTable).omit({
  createdAt: true,
});

export type InsertStoryboard = z.infer<typeof insertStoryboardSchema>;
export type Storyboard = typeof storyboardsTable.$inferSelect;
