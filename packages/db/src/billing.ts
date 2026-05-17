import { index, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth-schema";
import { conversation } from "./conversation";

export const usageEvent = pgTable(
  "usage_event",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    userId: t.text().references(() => user.id, { onDelete: "set null" }),
    conversationId: t
      .uuid()
      .references(() => conversation.id, { onDelete: "set null" }),

    generationId: t.text().notNull().unique(),
    gatewayModelId: t.text().notNull(),

    costUsd: t.numeric(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (t) => [
    index("idx_usage_event_user_created").on(t.userId, t.createdAt.desc()),
    index("idx_usage_event_user_conversation").on(t.userId, t.conversationId),
  ],
);

export const selectUsageEventSchema = createSelectSchema(usageEvent);
export const insertUsageEventSchema = createInsertSchema(usageEvent);
export type UsageEvent = typeof usageEvent.$inferSelect;
export type NewUsageEvent = typeof usageEvent.$inferInsert;
