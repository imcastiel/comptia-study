CREATE TABLE `generation_profiles` (
	`content_type` text PRIMARY KEY NOT NULL,
	`master_prompt` text NOT NULL,
	`default_options` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `flashcards` ADD `published` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `flashcards` ADD `source` text DEFAULT 'seed' NOT NULL;--> statement-breakpoint
ALTER TABLE `flashcards` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `published` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `source` text DEFAULT 'seed' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `updated_at` text;