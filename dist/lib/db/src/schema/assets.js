"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAssetSchema = exports.assetsTable = exports.ASSET_TYPES = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.ASSET_TYPES = [
    "input_image",
    "generated_video",
    "thumbnail",
    "audio",
    "subtitle",
];
exports.assetsTable = (0, pg_core_1.pgTable)("assets", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    jobId: (0, pg_core_1.text)("job_id").notNull(),
    type: (0, pg_core_1.text)("type").notNull().$type(),
    path: (0, pg_core_1.text)("path").notNull(),
    url: (0, pg_core_1.text)("url").notNull(),
    size: (0, pg_core_1.integer)("size").notNull().default(0),
    mime: (0, pg_core_1.text)("mime").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.insertAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.assetsTable).omit({
    createdAt: true,
});
