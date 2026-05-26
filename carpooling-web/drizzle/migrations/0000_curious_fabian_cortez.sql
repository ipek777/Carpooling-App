CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."seat_position" AS ENUM('front', 'back_left', 'back_middle', 'back_right');--> statement-breakpoint
CREATE TABLE "trip_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"passenger_id" integer NOT NULL,
	"seat_position" "seat_position" NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"comment_date" timestamp DEFAULT now() NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"review_date" timestamp DEFAULT now() NOT NULL,
	"rating" integer NOT NULL,
	"text" text
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"driver_id" integer NOT NULL,
	"origin" varchar(200) NOT NULL,
	"destination" varchar(200) NOT NULL,
	"date" date NOT NULL,
	"departure_time" time NOT NULL,
	"price_per_seat" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"canceled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(150) NOT NULL,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "trip_bookings" ADD CONSTRAINT "trip_bookings_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_bookings" ADD CONSTRAINT "trip_bookings_passenger_id_users_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_comments" ADD CONSTRAINT "trip_comments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_comments" ADD CONSTRAINT "trip_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_reviews" ADD CONSTRAINT "trip_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trip_bookings_trip_id_seat_position_unique" ON "trip_bookings" USING btree ("trip_id","seat_position") WHERE "trip_bookings"."status" != 'canceled';--> statement-breakpoint
CREATE INDEX "trip_bookings_trip_id_passenger_id_idx" ON "trip_bookings" USING btree ("trip_id","passenger_id");--> statement-breakpoint
CREATE INDEX "trip_comments_trip_id_idx" ON "trip_comments" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_comments_user_id_idx" ON "trip_comments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_reviews_trip_id_reviewer_id_unique" ON "trip_reviews" USING btree ("trip_id","reviewer_id");--> statement-breakpoint
CREATE INDEX "trip_reviews_trip_id_idx" ON "trip_reviews" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trips_origin_idx" ON "trips" USING btree ("origin");--> statement-breakpoint
CREATE INDEX "trips_destination_idx" ON "trips" USING btree ("destination");--> statement-breakpoint
CREATE INDEX "trips_date_idx" ON "trips" USING btree ("date");--> statement-breakpoint
CREATE INDEX "trips_driver_id_idx" ON "trips" USING btree ("driver_id");