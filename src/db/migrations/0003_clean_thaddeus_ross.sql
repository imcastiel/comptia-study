CREATE TABLE `drill_facts` (
	`id` text PRIMARY KEY NOT NULL,
	`drill_set_id` text NOT NULL,
	`term` text NOT NULL,
	`value` text NOT NULL,
	`hint` text,
	`aliases` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`drill_set_id`) REFERENCES `drill_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_drill_facts_set` ON `drill_facts` (`drill_set_id`);--> statement-breakpoint
CREATE TABLE `drill_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text DEFAULT '🧠' NOT NULL,
	`exam_code` text NOT NULL,
	`description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'seed' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_drill_sets_slug` ON `drill_sets` (`slug`);--> statement-breakpoint
CREATE TABLE `flashcard_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`daily_goal` integer DEFAULT 20 NOT NULL,
	`new_card_cap` integer DEFAULT 10 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flashcard_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`card_type` text DEFAULT 'flashcard' NOT NULL,
	`flashcard_id` text,
	`drill_fact_id` text,
	`ease_factor` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`quality` integer DEFAULT 0 NOT NULL,
	`next_review_at` text NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`drill_fact_id`) REFERENCES `drill_facts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flashcard_reviews`("id", "user_id", "card_type", "flashcard_id", "drill_fact_id", "ease_factor", "interval_days", "repetitions", "quality", "next_review_at", "reviewed_at") SELECT "id", "user_id", 'flashcard', "flashcard_id", NULL, "ease_factor", "interval_days", "repetitions", "quality", "next_review_at", "reviewed_at" FROM `flashcard_reviews`;--> statement-breakpoint
DROP TABLE `flashcard_reviews`;--> statement-breakpoint
ALTER TABLE `__new_flashcard_reviews` RENAME TO `flashcard_reviews`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_fr_user_flashcard` ON `flashcard_reviews` (`user_id`,`flashcard_id`) WHERE "flashcard_reviews"."card_type" = 'flashcard';--> statement-breakpoint
CREATE UNIQUE INDEX `uq_fr_user_drill` ON `flashcard_reviews` (`user_id`,`drill_fact_id`) WHERE "flashcard_reviews"."card_type" = 'drill';--> statement-breakpoint
CREATE INDEX `idx_fr_user_next` ON `flashcard_reviews` (`user_id`,`next_review_at`);--> statement-breakpoint
CREATE TABLE `__new_flashcard_review_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`card_type` text DEFAULT 'flashcard' NOT NULL,
	`flashcard_id` text,
	`drill_fact_id` text,
	`quality` integer NOT NULL,
	`ease_factor` real NOT NULL,
	`interval_days` integer NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`drill_fact_id`) REFERENCES `drill_facts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flashcard_review_log`("id", "user_id", "card_type", "flashcard_id", "drill_fact_id", "quality", "ease_factor", "interval_days", "reviewed_at") SELECT "id", "user_id", 'flashcard', "flashcard_id", NULL, "quality", "ease_factor", "interval_days", "reviewed_at" FROM `flashcard_review_log`;--> statement-breakpoint
DROP TABLE `flashcard_review_log`;--> statement-breakpoint
ALTER TABLE `__new_flashcard_review_log` RENAME TO `flashcard_review_log`;--> statement-breakpoint
CREATE INDEX `idx_frl_user_card` ON `flashcard_review_log` (`user_id`,`flashcard_id`);--> statement-breakpoint
CREATE INDEX `idx_frl_user_drill` ON `flashcard_review_log` (`user_id`,`drill_fact_id`);--> statement-breakpoint
CREATE INDEX `idx_frl_user_date` ON `flashcard_review_log` (`user_id`,`reviewed_at`);