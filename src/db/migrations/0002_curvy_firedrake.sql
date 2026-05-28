-- New tables
CREATE TABLE `users` (
	`code` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`last_active_at` text,
	`target_exam_date` text
);
--> statement-breakpoint
CREATE TABLE `flashcard_review_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`flashcard_id` text NOT NULL,
	`quality` integer NOT NULL,
	`ease_factor` real NOT NULL,
	`interval_days` integer NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_frl_user_card` ON `flashcard_review_log` (`user_id`,`flashcard_id`);
--> statement-breakpoint
CREATE TABLE `mastery_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`domain_id` text,
	`snapshot_date` text NOT NULL,
	`mastery_score` real NOT NULL,
	`questions_seen` integer NOT NULL,
	`accuracy` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ms_user_exam_date` ON `mastery_snapshots` (`user_id`,`exam_id`,`snapshot_date`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_snapshots_user_exam_domain_date` ON `mastery_snapshots` (`user_id`,`exam_id`,`domain_id`,`snapshot_date`);
--> statement-breakpoint
CREATE TABLE `pass_probability` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`probability` real NOT NULL,
	`predicted_score` real,
	`confidence` real NOT NULL,
	`domain_breakdown` text NOT NULL,
	`sample_size` integer NOT NULL,
	`computed_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pp_user_exam_date` ON `pass_probability` (`user_id`,`exam_id`,`computed_at`);
--> statement-breakpoint
CREATE TABLE `question_distractors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`times_chosen` integer DEFAULT 1 NOT NULL,
	`last_chosen_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_qd_user` ON `question_distractors` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_distractors_user_q_choice` ON `question_distractors` (`user_id`,`question_id`,`choice_id`);
--> statement-breakpoint
CREATE TABLE `topic_mastery` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`questions_seen` integer DEFAULT 0 NOT NULL,
	`questions_correct` integer DEFAULT 0 NOT NULL,
	`ewma_accuracy` real DEFAULT 0 NOT NULL,
	`last_seen_at` text,
	`last_correct_at` text,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`total_time_seconds` integer DEFAULT 0 NOT NULL,
	`avg_time_seconds` real,
	`mastery_score` real DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tm_user` ON `topic_mastery` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_topic_mastery_user_topic` ON `topic_mastery` (`user_id`,`topic_id`);
--> statement-breakpoint
-- Recreate wiped user-data tables with new schema
CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`score_percent` real,
	`scaled_score` real,
	`total_questions` integer NOT NULL,
	`correct_count` integer,
	`time_spent_seconds` integer,
	`domain_filter` text,
	`is_timed` integer DEFAULT true NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_exam_attempts_user_exam` ON `exam_attempts` (`user_id`,`exam_id`);
--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`question_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`domain_id` text NOT NULL,
	`selected_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`time_spent_seconds` integer,
	`is_flagged` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_qa_user_topic` ON `question_attempts` (`user_id`,`topic_id`);
--> statement-breakpoint
CREATE INDEX `idx_qa_user_question` ON `question_attempts` (`user_id`,`question_id`);
--> statement-breakpoint
CREATE INDEX `idx_qa_exam_attempt` ON `question_attempts` (`exam_attempt_id`);
--> statement-breakpoint
CREATE TABLE `flashcard_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`flashcard_id` text NOT NULL,
	`ease_factor` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`quality` integer DEFAULT 0 NOT NULL,
	`next_review_at` text NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_flashcard_reviews_user_card` ON `flashcard_reviews` (`user_id`,`flashcard_id`);
--> statement-breakpoint
CREATE INDEX `idx_fr_user_next` ON `flashcard_reviews` (`user_id`,`next_review_at`);
--> statement-breakpoint
CREATE TABLE `study_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`time_spent_seconds` integer DEFAULT 0 NOT NULL,
	`last_studied_at` text,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_study_progress_user_topic` ON `study_progress` (`user_id`,`topic_id`);
--> statement-breakpoint
CREATE INDEX `idx_study_progress_user` ON `study_progress` (`user_id`);
--> statement-breakpoint
CREATE TABLE `study_activity_log` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`minutes_active` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `date`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `study_topic_visits` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`topic_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_topic_visits_user_date_topic` ON `study_topic_visits` (`user_id`,`date`,`topic_id`);
