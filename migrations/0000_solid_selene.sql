CREATE TYPE "public"."ad_status" AS ENUM('pending', 'approved', 'rejected', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."ad_type" AS ENUM('banner', 'sidebar', 'inline', 'popup');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('period', 'view');--> statement-breakpoint
CREATE TYPE "public"."slot_position" AS ENUM('top', 'bottom', 'right', 'middle');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('advertiser', 'admin');--> statement-breakpoint
CREATE TABLE "ad_slot_bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" varchar NOT NULL,
	"slot_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_ad_slot" UNIQUE("ad_id","slot_id")
);
--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"ad_type" "ad_type" NOT NULL,
	"position" "slot_position" NOT NULL,
	"location" varchar NOT NULL,
	"is_available" integer DEFAULT 1 NOT NULL,
	"price_per_day" numeric(10, 2) NOT NULL,
	"price_per_view" numeric(10, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" varchar NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar,
	"user_agent" varchar,
	"referrer" varchar
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"image_url" varchar,
	"ad_type" "ad_type" NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"budget" numeric(12, 2) NOT NULL,
	"target_views" integer,
	"current_views" integer DEFAULT 0 NOT NULL,
	"status" "ad_status" DEFAULT 'pending' NOT NULL,
	"estimated_cost" numeric(12, 2) NOT NULL,
	"actual_cost" numeric(12, 2) DEFAULT '0',
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" "user_role" DEFAULT 'advertiser' NOT NULL,
	"company_name" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ad_slot_bookings" ADD CONSTRAINT "ad_slot_bookings_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_slot_bookings" ADD CONSTRAINT "ad_slot_bookings_slot_id_ad_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_advertiser_id_users_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ad_slot_bookings_ad_id" ON "ad_slot_bookings" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX "idx_ad_slot_bookings_slot_id" ON "ad_slot_bookings" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "idx_ad_views_ad_id" ON "ad_views" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX "idx_ad_views_viewed_at" ON "ad_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");