import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charactersTable = pgTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  referenceImage: text("reference_image"),
  description: text("description"),
  embedding: text("embedding"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
