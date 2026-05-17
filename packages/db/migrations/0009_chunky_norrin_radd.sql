CREATE TABLE "usage_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" uuid NOT NULL,
	"generation_id" text NOT NULL,
	"gateway_model_id" text NOT NULL,
	"cost_usd" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_event_generationId_unique" UNIQUE("generation_id")
);
--> statement-breakpoint
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usage_event_user_created" ON "usage_event" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_usage_event_user_conversation" ON "usage_event" USING btree ("user_id","conversation_id");