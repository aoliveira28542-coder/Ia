"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobAttemptsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const jobs_1 = require("./jobs");
exports.jobAttemptsTable = (0, pg_core_1.pgTable)("job_attempts", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    jobId: (0, pg_core_1.text)("job_id")
        .notNull()
        .references(() => jobs_1.jobsTable.id, { onDelete: "cascade" }),
    attemptNumber: (0, pg_core_1.integer)("attempt_number").notNull(),
    startedAt: (0, pg_core_1.timestamp)("started_at").notNull().defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    durationMs: (0, pg_core_1.integer)("duration_ms"),
    result: (0, pg_core_1.text)("result"),
    errorMessage: (0, pg_core_1.text)("error_message"),
});
