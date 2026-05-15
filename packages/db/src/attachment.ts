import { index, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth-schema";
import { conversation, message } from "./conversation";

export const attachment = pgTable(
  "attachment",
  (t) => ({
    id: t.uuid().primaryKey(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    conversationId: t
      .uuid()
      .references(() => conversation.id, { onDelete: "cascade" }),
    messageId: t.uuid().references(() => message.id, { onDelete: "cascade" }),

    filename: t.text().notNull(),
    contentType: t.text().notNull(),
    sizeBytes: t.integer().notNull(),

    blobUrl: t.text().notNull(),
    pathname: t.text().notNull().unique(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (table) => [
    index("idx_attachment_user_created").on(
      table.userId,
      table.createdAt.desc(),
    ),
    index("idx_attachment_message").on(table.messageId),
    index("idx_attachment_conversation").on(table.conversationId),
  ],
);

export const selectAttachmentSchema = createSelectSchema(attachment);
export const insertAttachmentSchema = createInsertSchema(attachment);
export type Attachment = typeof attachment.$inferSelect;
export type NewAttachment = typeof attachment.$inferInsert;
