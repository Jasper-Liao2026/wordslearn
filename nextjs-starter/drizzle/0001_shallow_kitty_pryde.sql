CREATE TABLE "user_book_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bookld" text NOT NULL,
	"last_word_rank" integer DEFAULT 0 NOT NULL,
	"learned_count" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_studied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_word_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bookld" text NOT NULL,
	"word_rank" integer NOT NULL,
	"learned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_book_progress" ADD CONSTRAINT "user_book_progress_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_book_progress" ADD CONSTRAINT "user_book_progress_bookld_books_bookld_fk" FOREIGN KEY ("bookld") REFERENCES "public"."books"("bookld") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_progress" ADD CONSTRAINT "user_word_progress_bookld_books_bookld_fk" FOREIGN KEY ("bookld") REFERENCES "public"."books"("bookld") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_book_progress_user_book_unique" ON "user_book_progress" USING btree ("user_id","bookld");--> statement-breakpoint
CREATE INDEX "user_book_progress_user_recent_idx" ON "user_book_progress" USING btree ("user_id","last_studied_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_word_progress_user_book_word_unique" ON "user_word_progress" USING btree ("user_id","bookld","word_rank");--> statement-breakpoint
CREATE INDEX "user_word_progress_user_book_idx" ON "user_word_progress" USING btree ("user_id","bookld");