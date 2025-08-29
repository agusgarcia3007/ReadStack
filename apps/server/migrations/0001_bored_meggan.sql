CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_books_id" text,
	"title" text NOT NULL,
	"authors" json DEFAULT '[]'::json NOT NULL,
	"publisher" text,
	"published_date" text,
	"description" text,
	"isbn10" text,
	"isbn13" text,
	"thumbnail" text,
	"cover_image" text,
	"categories" json DEFAULT '[]'::json NOT NULL,
	"page_count" integer,
	"language" text DEFAULT 'unknown' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;