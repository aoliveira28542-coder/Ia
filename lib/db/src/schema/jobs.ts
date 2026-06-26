import { pgTable, text, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const PIPELINE_STAGES = [
  "parsing",
  "storyboard",
  "frames",
  "encoding",
  "finalizing",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  duration: integer("duration").notNull().default(5),
  resolutionWidth: integer("resolution_width").notNull().default(720),
  resolutionHeight: integer("resolution_height").notNull().default(1280),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  currentStage: text("current_stage").$type<PipelineStage | null>(),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  priority: integer("priority").notNull().default(0),
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by"),
  presetName: text("preset_name"),
  referenceImages: json("reference_images").$type<string[]>().default([]),
  characterIds: json("character_ids").$type<string[]>().default([]),
  // Visual style
  visualStyle: text("visual_style"),
  colorGrade: text("color_grade"),
  camera: text("camera"),
  quality: text("quality").default("standard"),
  // Scene orchestration
  sceneCount: integer("scene_count"),
  currentScene: integer("current_scene"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
