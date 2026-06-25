import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const webhooksTable = pgTable("webhooks", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  event: text("event").notNull().default("job.all"),
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastFiredAt: timestamp("last_fired_at"),
  lastStatusCode: integer("last_status_code"),
});

export const insertWebhookSchema = createInsertSchema(webhooksTable).omit({
  createdAt: true,
  lastFiredAt: true,
  lastStatusCode: true,
});

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooksTable.$inferSelect;
