import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";

export const jobAttemptsTable = pgTable("job_attempts", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
  result: text("result"),
  errorMessage: text("error_message"),
});

export type JobAttempt = typeof jobAttemptsTable.$inferSelect;
