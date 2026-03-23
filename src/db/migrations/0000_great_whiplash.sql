CREATE TABLE `domains` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`weight_percent` integer NOT NULL,
	`description` text,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_domains_exam_id` ON `domains` (`exam_id`);--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`score_percent` real,
	`total_questions` integer NOT NULL,
	`correct_count` integer,
	`time_spent_seconds` integer,
	`domain_filter` text,
	`is_timed` integer DEFAULT true NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_exam_attempts_exam_id` ON `exam_attempts` (`exam_id`);--> statement-breakpoint
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`total_time_minutes` integer DEFAULT 90 NOT NULL,
	`passing_score` integer NOT NULL,
	`max_questions` integer DEFAULT 90 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exams_code_unique` ON `exams` (`code`);--> statement-breakpoint
CREATE TABLE `flashcard_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`flashcard_id` text NOT NULL,
	`ease_factor` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`quality` integer DEFAULT 0 NOT NULL,
	`next_review_at` text NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `flashcard_reviews_flashcard_id_unique` ON `flashcard_reviews` (`flashcard_id`);--> statement-breakpoint
CREATE INDEX `idx_flashcard_reviews_flashcard_id` ON `flashcard_reviews` (`flashcard_id`);--> statement-breakpoint
CREATE INDEX `idx_flashcard_reviews_next_review` ON `flashcard_reviews` (`next_review_at`);--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`tags` text,
	`difficulty` integer DEFAULT 2 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_flashcards_topic_id` ON `flashcards` (`topic_id`);--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_attempt_id` text NOT NULL,
	`question_id` text NOT NULL,
	`selected_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`time_spent_seconds` integer,
	`is_flagged` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_question_attempts_exam_attempt_id` ON `question_attempts` (`exam_attempt_id`);--> statement-breakpoint
CREATE INDEX `idx_question_attempts_question_id` ON `question_attempts` (`question_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`type` text NOT NULL,
	`stem` text NOT NULL,
	`choices` text NOT NULL,
	`correct_answer` text NOT NULL,
	`explanation` text NOT NULL,
	`difficulty` integer NOT NULL,
	`tags` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_questions_topic_id` ON `questions` (`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_questions_difficulty` ON `questions` (`difficulty`);--> statement-breakpoint
CREATE TABLE `study_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`time_spent_seconds` integer DEFAULT 0 NOT NULL,
	`last_studied_at` text,
	`notes` text,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_progress_topic_id_unique` ON `study_progress` (`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_study_progress_topic_id` ON `study_progress` (`topic_id`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`objective_id` text NOT NULL,
	`description` text,
	`order_index` integer NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_topics_domain_id` ON `topics` (`domain_id`);