import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth-schema";

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const messageRoleSchema = z.enum(messageRoleEnum.enumValues);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const conversation = pgTable(
  "conversation",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    title: t.text(),

    activeStreamId: t.uuid(),

    lastTotalTokens: t.integer().notNull().default(0),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),

    archivedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("idx_conversation_user_updated").on(
      table.userId,
      table.updatedAt.desc(),
    ),
  ],
);

export const selectConversationSchema = createSelectSchema(conversation);
export const insertConversationSchema = createInsertSchema(conversation);
export type Conversation = typeof conversation.$inferSelect;
export type NewConversation = typeof conversation.$inferInsert;

export const message = pgTable(
  "message",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    conversationId: t
      .uuid()
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),

    role: messageRoleEnum().notNull(),
    parts: t.jsonb().notNull(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),

    archivedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("idx_message_conversation").on(table.conversationId, table.createdAt),
  ],
);

export const selectMessageSchema = createSelectSchema(message);
export const insertMessageSchema = createInsertSchema(message);
export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
