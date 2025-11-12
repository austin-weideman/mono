import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const conversation = pgTable(
  "conversation",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    title: t.text(),

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

export const message = pgTable(
  "message",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    conversationId: t
      .uuid()
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),

    role: messageRoleEnum().notNull(),
    content: t.text().notNull(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),

    archivedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("idx_message_conversation").on(table.conversationId, table.createdAt),
  ],
);
