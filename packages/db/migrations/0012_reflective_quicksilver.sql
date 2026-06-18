CREATE TABLE "campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" uuid NOT NULL,
	"title" text,
	"environment_key" text NOT NULL,
	"supervised" boolean DEFAULT false NOT NULL,
	"scramble_seed" integer,
	"hide_names" boolean DEFAULT false NOT NULL,
	"max_iterations" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiment_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"iteration" integer NOT NULL,
	"params" jsonb NOT NULL,
	"predicted_value" numeric NOT NULL,
	"measured_value" numeric NOT NULL,
	"shown_value" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_run" ADD CONSTRAINT "experiment_run_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_campaign_user_updated" ON "campaign" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_campaign_conversation" ON "campaign" USING btree ("conversation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_experiment_run_campaign_iteration" ON "experiment_run" USING btree ("campaign_id","iteration");--> statement-breakpoint
CREATE INDEX "idx_experiment_run_campaign_created" ON "experiment_run" USING btree ("campaign_id","created_at");