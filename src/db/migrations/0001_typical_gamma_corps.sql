CREATE TABLE `study_activity_log` (
	`date` text PRIMARY KEY NOT NULL,
	`minutes_active` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_topic_visits` (
	`date` text NOT NULL,
	`topic_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_topic_visits_date_topic_id_unique` ON `study_topic_visits` (`date`,`topic_id`);