CREATE TABLE `cheat_sheets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`exam` text NOT NULL,
	`domain_slug` text NOT NULL,
	`data` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'seed' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `pbq_scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`exam_code` text NOT NULL,
	`data` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'seed' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
