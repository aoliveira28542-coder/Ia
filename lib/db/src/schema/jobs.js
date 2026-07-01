"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertJobSchema = exports.jobsTable = exports.PIPELINE_STAGES = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.PIPELINE_STAGES = [
    "parsing",
    "storyboard",
    "frames",
    "encoding",
    "finalizing",
];
exports.jobsTable = (0, pg_core_1.pgTable)("jobs", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    prompt: (0, pg_core_1.text)("prompt").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull().default(5),
    resolutionWidth: (0, pg_core_1.integer)("resolution_width").notNull().default(720),
    resolutionHeight: (0, pg_core_1.integer)("resolution_height").notNull().default(1280),
    status: (0, pg_core_1.text)("status").notNull().default("queued"),
    progress: (0, pg_core_1.integer)("progress").notNull().default(0),
    currentStage: (0, pg_core_1.text)("current_stage").$type(),
    errorMessage: (0, pg_core_1.text)("error_message"),
    retryCount: (0, pg_core_1.integer)("retry_count").notNull().default(0),
    maxRetries: (0, pg_core_1.integer)("max_retries").notNull().default(3),
    priority: (0, pg_core_1.integer)("priority").notNull().default(0),
    lockedAt: (0, pg_core_1.timestamp)("locked_at"),
    lockedBy: (0, pg_core_1.text)("locked_by"),
    presetName: (0, pg_core_1.text)("preset_name"),
    referenceImages: (0, pg_core_1.json)("reference_images").$type().default([]),
    characterIds: (0, pg_core_1.json)("character_ids").$type().default([]),
    // Visual style
    visualStyle: (0, pg_core_1.text)("visual_style"),
    colorGrade: (0, pg_core_1.text)("color_grade"),
    camera: (0, pg_core_1.text)("camera"),
    quality: (0, pg_core_1.text)("quality").default("standard"),
    // Scene orchestration
    sceneCount: (0, pg_core_1.integer)("scene_count"),
    currentScene: (0, pg_core_1.integer)("current_scene"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.insertJobSchema = (0, drizzle_zod_1.createInsertSchema)(exports.jobsTable).omit({
    createdAt: true,
    updatedAt: true,
});
