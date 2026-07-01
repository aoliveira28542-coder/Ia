"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPresetSchema = exports.presetsTable = exports.PRESET_STYLES = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.PRESET_STYLES = ["cinematic", "anime", "realistic", "cartoon", "documentary"];
exports.presetsTable = (0, pg_core_1.pgTable)("generation_presets", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    resolution: (0, pg_core_1.text)("resolution").notNull().default("1080p"),
    fps: (0, pg_core_1.integer)("fps").notNull().default(24),
    style: (0, pg_core_1.text)("style").notNull().default("cinematic").$type(),
    description: (0, pg_core_1.text)("description"),
    isDefault: (0, pg_core_1.boolean)("is_default").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.insertPresetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.presetsTable).omit({
    createdAt: true,
    updatedAt: true,
});
