"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSceneMemorySchema = exports.sceneMemoryTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.sceneMemoryTable = (0, pg_core_1.pgTable)("scene_memory", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    jobId: (0, pg_core_1.text)("job_id").notNull(),
    sceneNumber: (0, pg_core_1.integer)("scene_number").notNull(),
    characterStates: (0, pg_core_1.json)("character_states").$type().default({}),
    environment: (0, pg_core_1.text)("environment").notNull().default(""),
    camera: (0, pg_core_1.text)("camera").notNull().default("medium-shot"),
    lighting: (0, pg_core_1.text)("lighting").notNull().default("natural daylight"),
    style: (0, pg_core_1.json)("style").$type().default({}),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.insertSceneMemorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.sceneMemoryTable).omit({
    createdAt: true,
});
