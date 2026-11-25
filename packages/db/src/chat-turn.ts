import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth-schema";
import { conversation, message } from "./conversation";

export const chatTurnStatusEnum = pgEnum("chat_turn_status", [
  "queued",
  "streaming",
  "completed",
  "failed",
  "cancelled",
]);
export const chatTurnStatusSchema = z.enum(chatTurnStatusEnum.enumValues);
export type ChatTurnStatus = z.infer<typeof chatTurnStatusSchema>;

export const chatTurnAgentEnum = pgEnum("chat_turn_agent", [
  "assistant",
  "scientist",
]);
export const chatTurnAgentSchema = z.enum(chatTurnAgentEnum.enumValues);
export type ChatTurnAgent = z.infer<typeof chatTurnAgentSchema>;

export const chatTurnFailureKindEnum = pgEnum("chat_turn_failure_kind", [
  "agent_error",
  "stalled",
  "never_started",
]);
export const chatTurnFailureKindSchema = z.enum(
  chatTurnFailureKindEnum.enumValues,
);
export type ChatTurnFailureKind = z.infer<typeof chatTurnFailureKindSchema>;

// One assistant reply: the user message that asked for it, the assistant
// message it fills in, and its lifecycle.
export const chatTurn = pgTable(
  "chat_turn",
  (t) => ({
    id: t.uuid().primaryKey(),
    conversationId: t
      .uuid()
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    agent: chatTurnAgentEnum().notNull(),
    gatewayModelId: t.text().notNull(),

    userMessageId: t
      .uuid()
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    assistantMessageId: t
      .uuid()
      .notNull()
      .unique()
      .references(() => message.id, { onDelete: "cascade" }),

    status: chatTurnStatusEnum().notNull().default("queued"),
    failureKind: chatTurnFailureKindEnum(),
    failureReason: t.text(),

    // Last stream event whose content is saved in the assistant message.
    persistedEventId: t.text(),
    // Model calls whose output is saved; a retried step skips past these.
    completedModelSteps: t.integer().notNull().default(0),

    cancelRequestedAt: t.timestamp({ withTimezone: true }),
    heartbeatAt: t.timestamp({ withTimezone: true }),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    startedAt: t.timestamp({ withTimezone: true }),
    finishedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    uniqueIndex("uniq_chat_turn_active_per_conversation")
      .on(table.conversationId)
      .where(sql`${table.status} IN ('queued', 'streaming')`),
    index("idx_chat_turn_conversation_created").on(
      table.conversationId,
      table.createdAt.desc(),
    ),
    index("idx_chat_turn_active_status")
      .on(table.status, table.heartbeatAt)
      .where(sql`${table.status} IN ('queued', 'streaming')`),
    check(
      "chk_chat_turn_failure_iff_failed",
      sql`(${table.status} = 'failed') = (${table.failureKind} IS NOT NULL AND ${table.failureReason} IS NOT NULL)`,
    ),
    check(
      "chk_chat_turn_finished_iff_terminal",
      sql`(${table.status} IN ('completed', 'failed', 'cancelled')) = (${table.finishedAt} IS NOT NULL)`,
    ),
    check(
      "chk_chat_turn_started_unless_queued",
      sql`${table.status} = 'queued' OR ${table.status} = 'failed' OR ${table.status} = 'cancelled' OR ${table.startedAt} IS NOT NULL`,
    ),
    check(
      "chk_chat_turn_queued_not_started",
      sql`${table.status} <> 'queued' OR ${table.startedAt} IS NULL`,
    ),
  ],
);

export const selectChatTurnSchema = createSelectSchema(chatTurn);
export type ChatTurn = typeof chatTurn.$inferSelect;
export type NewChatTurn = typeof chatTurn.$inferInsert;
