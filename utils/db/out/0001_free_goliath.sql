ALTER TABLE "challenges" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "expires_at" timestamp DEFAULT NOW() + INTERVAL '5 minutes' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "defeated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenges" ADD CONSTRAINT "challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
