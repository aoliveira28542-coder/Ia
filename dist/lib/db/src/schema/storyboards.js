"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertStoryboardSchema = exports.storyboardsTable = exports.SCENE_STATUSES = exports.CAMERA_ANGLES = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.CAMERA_ANGLES = [
    "close-up",
    "wide-shot",
    "medium-shot",
    "tracking-shot",
    "overhead",
    "dutch-angle",
    "pov",
    "two-shot",
];
exports.SCENE_STATUSES = ["pending", "processing", "done", "failed"];
exports.storyboardsTable = (0, pg_core_1.pgTable)("storyboards", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    jobId: (0, pg_core_1.text)("job_id").notNull(),
    sceneNumber: (0, pg_core_1.integer)("scene_number").notNull(),
    scenePrompt: (0, pg_core_1.text)("scene_prompt").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull().default(5),
    camera: (0, pg_core_1.text)("camera").notNull().default("medium-shot"),
    lighting: (0, pg_core_1.text)("lighting").notNull().default("natural daylight"),
    characters: (0, pg_core_1.json)("characters").$type().default([]),
    style: (0, pg_core_1.json)("style").$type().default({}),
    status: (0, pg_core_1.text)("status").notNull().default("pending").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.insertStoryboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.storyboardsTable).omit({
    createdAt: true,
});
