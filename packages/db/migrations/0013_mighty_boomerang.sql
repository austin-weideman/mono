CREATE TYPE "public"."chat_turn_agent" AS ENUM('assistant', 'scientist');--> statement-breakpoint
CREATE TYPE "public"."chat_turn_failure_kind" AS ENUM('agent_error', 'stalled', 'never_started');--> statement-breakpoint
CREATE TYPE "public"."chat_turn_status" AS ENUM('queued', 'streaming', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "chat_turn" (
	"id" uuid PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"agent" "chat_turn_agent" NOT NULL,
	"gateway_model_id" text NOT NULL,
	"user_message_id" uuid NOT NULL,
	"assistant_message_id" uuid NOT NULL,
	"status" "chat_turn_status" DEFAULT 'queued' NOT NULL,
	"failure_kind" "chat_turn_failure_kind",
	"failure_reason" text,
	"persisted_event_id" text,
	"completed_model_steps" integer DEFAULT 0 NOT NULL,
	"cancel_requested_at" timestamp with time zone,
	"heartbeat_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	CONSTRAINT "chat_turn_assistantMessageId_unique" UNIQUE("assistant_message_id"),
	CONSTRAINT "chk_chat_turn_failure_iff_failed" CHECK (("chat_turn"."status" = 'failed') = ("chat_turn"."failure_kind" IS NOT NULL AND "chat_turn"."failure_reason" IS NOT NULL)),
	CONSTRAINT "chk_chat_turn_finished_iff_terminal" CHECK (("chat_turn"."status" IN ('completed', 'failed', 'cancelled')) = ("chat_turn"."finished_at" IS NOT NULL)),
	CONSTRAINT "chk_chat_turn_started_unless_queued" CHECK ("chat_turn"."status" = 'queued' OR "chat_turn"."status" = 'failed' OR "chat_turn"."status" = 'cancelled' OR "chat_turn"."started_at" IS NOT NULL),
	CONSTRAINT "chk_chat_turn_queued_not_started" CHECK ("chat_turn"."status" <> 'queued' OR "chat_turn"."started_at" IS NULL)
);
--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "created_at" SET DEFAULT clock_timestamp();--> statement-breakpoint
ALTER TABLE "experiment_run" ADD COLUMN "tool_call_id" text;--> statement-breakpoint
UPDATE "experiment_run" SET "tool_call_id" = 'legacy-' || "id"::text WHERE "tool_call_id" IS NULL;--> statement-breakpoint
ALTER TABLE "experiment_run" ALTER COLUMN "tool_call_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_turn" ADD CONSTRAINT "chat_turn_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_turn" ADD CONSTRAINT "chat_turn_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_turn" ADD CONSTRAINT "chat_turn_user_message_id_message_id_fk" FOREIGN KEY ("user_message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_turn" ADD CONSTRAINT "chat_turn_assistant_message_id_message_id_fk" FOREIGN KEY ("assistant_message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_chat_turn_active_per_conversation" ON "chat_turn" USING btree ("conversation_id") WHERE "chat_turn"."status" IN ('queued', 'streaming');--> statement-breakpoint
CREATE INDEX "idx_chat_turn_conversation_created" ON "chat_turn" USING btree ("conversation_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_chat_turn_active_status" ON "chat_turn" USING btree ("status","heartbeat_at") WHERE "chat_turn"."status" IN ('queued', 'streaming');--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_experiment_run_campaign_tool_call" ON "experiment_run" USING btree ("campaign_id","tool_call_id");--> statement-breakpoint
ALTER TABLE "conversation" DROP COLUMN "active_stream_id";