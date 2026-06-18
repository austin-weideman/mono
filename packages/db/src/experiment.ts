import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth-schema";
import { conversation } from "./conversation";

// One optimization run. The campaign IS a conversation: every iteration is a
// chat turn, every experiment a tool call. Anything derivable (best-so-far,
// completion) is computed from experiment_run rows, not stored here.
export const campaign = pgTable(
  "campaign",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),

    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // The campaign always has exactly one conversation backing it.
    conversationId: t
      .uuid()
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),

    title: t.text(),

    // Determines the objective + parameter space. Only "reductive_amination"
    // exists in core; kept as text so future environments need no migration.
    environmentKey: t.text().notNull(),

    // Selects the system-prompt variant (per-iteration stop vs. full autonomy).
    supervised: t.boolean().notNull().default(false),

    // null = intact feedback; set = scrambled feedback. The seed IS the mode
    // flag for the "does it use the results?" control.
    scrambleSeed: t.integer(),

    // Strips parameter names/options to x1/option_1.. for the "does it use
    // prior knowledge?" control. The UI always shows the real names.
    hideNames: t.boolean().notNull().default(false),

    // The experiment budget, stated in the system prompt. Capped below
    // MAX_AGENT_STEPS at creation time so a step is left for the summary.
    maxIterations: t.integer().notNull().default(20),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (table) => [
    index("idx_campaign_user_updated").on(table.userId, table.updatedAt.desc()),
    // One campaign per conversation; also makes the chat-route lookup unique.
    uniqueIndex("uniq_campaign_conversation").on(table.conversationId),
  ],
);

export const selectCampaignSchema = createSelectSchema(campaign);
export const insertCampaignSchema = createInsertSchema(campaign);
export type Campaign = typeof campaign.$inferSelect;
export type NewCampaign = typeof campaign.$inferInsert;

// One experiment. Written complete by the run_experiment tool in a single
// insert — the row exists iff the experiment ran. Numbers live here; the
// agent's prose lives in message.parts. Nothing parses the transcript for data.
export const experimentRun = pgTable(
  "experiment_run",
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    campaignId: t
      .uuid()
      .notNull()
      .references(() => campaign.id, { onDelete: "cascade" }),

    iteration: t.integer().notNull(),

    params: t.jsonb().notNull(),

    // Committed in the same tool call, before the result exists.
    predictedValue: t.numeric().notNull(),
    // The TRUE measurement (used for scoring).
    measuredValue: t.numeric().notNull(),
    // What the agent saw (differs from measuredValue only under scrambled
    // feedback).
    shownValue: t.numeric().notNull(),

    createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  }),
  (table) => [
    uniqueIndex("uniq_experiment_run_campaign_iteration").on(
      table.campaignId,
      table.iteration,
    ),
    index("idx_experiment_run_campaign_created").on(
      table.campaignId,
      table.createdAt,
    ),
  ],
);

export const selectExperimentRunSchema = createSelectSchema(experimentRun);
export const insertExperimentRunSchema = createInsertSchema(experimentRun);
export type ExperimentRun = typeof experimentRun.$inferSelect;
export type NewExperimentRun = typeof experimentRun.$inferInsert;
