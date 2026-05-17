ALTER TABLE "usage_event" DROP CONSTRAINT "usage_event_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "usage_event" DROP CONSTRAINT "usage_event_conversation_id_conversation_id_fk";
--> statement-breakpoint
ALTER TABLE "usage_event" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_event" ALTER COLUMN "conversation_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE set null ON UPDATE no action;