CREATE TABLE `content_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`source` text NOT NULL,
	`severity` text NOT NULL,
	`code` text NOT NULL,
	`detail` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_content_flags_status` ON `content_flags` (`status`);--> statement-breakpoint
CREATE INDEX `idx_content_flags_item` ON `content_flags` (`item_type`,`item_id`);