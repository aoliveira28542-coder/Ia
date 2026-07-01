"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertWebhookSchema = exports.webhooksTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.webhooksTable = (0, pg_core_1.pgTable)("webhooks", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    url: (0, pg_core_1.text)("url").notNull(),
    event: (0, pg_core_1.text)("event").notNull().default("job.all"),
    label: (0, pg_core_1.text)("label"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    lastFiredAt: (0, pg_core_1.timestamp)("last_fired_at"),
    lastStatusCode: (0, pg_core_1.integer)("last_status_code"),
});
exports.insertWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhooksTable).omit({
    createdAt: true,
    lastFiredAt: true,
    lastStatusCode: true,
});
