DELETE FROM "message";--> statement-breakpoint
DELETE FROM "conversation";--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "parts" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "message" DROP COLUMN "content";