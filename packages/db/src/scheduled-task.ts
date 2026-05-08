import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth-schema";

export const scheduledTaskActorTypeEnum = pgEnum("scheduled_task_actor_type", [
  "USER",
  "SYSTEM",
]);

export const scheduledTaskStatusEnum = pgEnum("scheduled_task_status", [
  "active",
  "paused",
  "completed",
  "failed",
]);

export const scheduledTaskRunStatusEnum = pgEnum("scheduled_task_run_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
]);

export const scheduledTaskActorTypeSchema = z.enum(
  scheduledTaskActorTypeEnum.enumValues,
);
export type ScheduledTaskActorType = z.infer<
  typeof scheduledTaskActorTypeSchema
>;

export const scheduledTaskStatusSchema = z.enum(
  scheduledTaskStatusEnum.enumValues,
);
export type ScheduledTaskStatus = z.infer<typeof scheduledTaskStatusSchema>;

export const scheduledTaskRunStatusSchema = z.enum(
  scheduledTaskRunStatusEnum.enumValues,
);
export type ScheduledTaskRunStatus = z.infer<
  typeof scheduledTaskRunStatusSchema
>;

export const scheduledTask = pgTable(
  "scheduled_task",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),

    userId: t.text().references(() => user.id, { onDelete: "cascade" }),
    actorType: scheduledTaskActorTypeEnum().notNull(),

    taskType: t.text().notNull(),
    payload: t.jsonb().notNull(),

    rrule: t.text().notNull(),
    dtstart: t.timestamp({ withTimezone: true }).notNull(),
    timezone: t.text().notNull(),

    status: scheduledTaskStatusEnum().notNull().default("active"),
    nextRunAt: t.timestamp({ withTimezone: true }).notNull(),

    lastRunId: t.uuid(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    archivedAt: t.timestamp({ withTimezone: true }),
  }),
  (table) => [
    index("idx_scheduled_task_due")
      .on(table.nextRunAt)
      .where(sql`${table.status} = 'active'`),
    index("idx_scheduled_task_user").on(table.userId, table.createdAt.desc()),
  ],
);

export const selectScheduledTaskSchema = createSelectSchema(scheduledTask);
export const insertScheduledTaskSchema = createInsertSchema(scheduledTask);
export type ScheduledTask = typeof scheduledTask.$inferSelect;
export type NewScheduledTask = typeof scheduledTask.$inferInsert;

export const scheduledTaskRun = pgTable(
  "scheduled_task_run",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    scheduledTaskId: t
      .uuid()
      .notNull()
      .references(() => scheduledTask.id, { onDelete: "cascade" }),

    scheduledFor: t.timestamp({ withTimezone: true }).notNull(),
    completedAt: t.timestamp({ withTimezone: true }),

    status: scheduledTaskRunStatusEnum().notNull().default("pending"),
    error: t.jsonb(),
    inngestEventId: t.text(),
  }),
  (table) => [
    uniqueIndex("uniq_scheduled_task_run_task_for").on(
      table.scheduledTaskId,
      table.scheduledFor,
    ),
    index("idx_scheduled_task_run_emit_pending")
      .on(table.scheduledFor)
      .where(
        sql`${table.status} = 'pending' AND ${table.inngestEventId} IS NULL`,
      ),
  ],
);

export const selectScheduledTaskRunSchema =
  createSelectSchema(scheduledTaskRun);
export const insertScheduledTaskRunSchema =
  createInsertSchema(scheduledTaskRun);
export type ScheduledTaskRun = typeof scheduledTaskRun.$inferSelect;
export type NewScheduledTaskRun = typeof scheduledTaskRun.$inferInsert;
