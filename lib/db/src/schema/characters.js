"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCharacterSchema = exports.charactersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.charactersTable = (0, pg_core_1.pgTable)("characters", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    referenceImage: (0, pg_core_1.text)("reference_image"),
    description: (0, pg_core_1.text)("description"),
    embedding: (0, pg_core_1.text)("embedding"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.insertCharacterSchema = (0, drizzle_zod_1.createInsertSchema)(exports.charactersTable).omit({
    createdAt: true,
    updatedAt: true,
});
