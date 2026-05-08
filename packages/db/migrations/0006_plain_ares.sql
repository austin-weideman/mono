CREATE TYPE "public"."scheduled_task_actor_type" AS ENUM('USER', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."scheduled_task_run_status" AS ENUM('pending', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."scheduled_task_status" AS ENUM('active', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "scheduled_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"actor_type" "scheduled_task_actor_type" NOT NULL,
	"task_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"rrule" text NOT NULL,
	"dtstart" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"status" "scheduled_task_status" DEFAULT 'active' NOT NULL,
	"next_run_at" timestamp with time zone NOT NULL,
	"last_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "scheduled_task_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheduled_task_id" uuid NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"status" "scheduled_task_run_status" DEFAULT 'pending' NOT NULL,
	"error" jsonb,
	"inngest_event_id" text
);
--> statement-breakpoint
ALTER TABLE "scheduled_task" ADD CONSTRAINT "scheduled_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_task_run" ADD CONSTRAINT "scheduled_task_run_scheduled_task_id_scheduled_task_id_fk" FOREIGN KEY ("scheduled_task_id") REFERENCES "public"."scheduled_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_scheduled_task_due" ON "scheduled_task" USING btree ("next_run_at") WHERE "scheduled_task"."status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_scheduled_task_user" ON "scheduled_task" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_scheduled_task_run_task_for" ON "scheduled_task_run" USING btree ("scheduled_task_id","scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_scheduled_task_run_emit_pending" ON "scheduled_task_run" USING btree ("scheduled_for") WHERE "scheduled_task_run"."status" = 'pending' AND "scheduled_task_run"."inngest_event_id" IS NULL;