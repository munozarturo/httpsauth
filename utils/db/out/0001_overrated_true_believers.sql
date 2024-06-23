CREATE TABLE IF NOT EXISTS "authentication"."decomissioned_passwords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" text NOT NULL,
	"decomissined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authentication"."decomissioned_passwords" ADD CONSTRAINT "decomissioned_passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "authentication"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
