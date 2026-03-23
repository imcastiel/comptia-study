import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

// 1. exams
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  totalTimeMinutes: integer('total_time_minutes').notNull().default(90),
  passingScore: integer('passing_score').notNull(),
  maxQuestions: integer('max_questions').notNull().default(90),
  createdAt: text('created_at').notNull(),
})

// 2. domains
export const domains = sqliteTable('domains', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id),
  number: integer('number').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  weightPercent: integer('weight_percent').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull(),
}, (t) => [
  index('idx_domains_exam_id').on(t.examId),
])

// 3. topics
export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  domainId: text('domain_id').notNull().references(() => domains.id),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  objectiveId: text('objective_id').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull(),
}, (t) => [
  index('idx_topics_domain_id').on(t.domainId),
])

// 4. questions
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  type: text('type').notNull(), // 'single_choice' | 'multiple_choice' | 'drag_drop' | 'scenario' | 'fill_blank' | 'ordered_list' | 'hot_spot'
  stem: text('stem').notNull(),
  choices: text('choices').notNull(),       // JSON: [{id, text, isCorrect}]
  correctAnswer: text('correct_answer').notNull(), // JSON
  explanation: text('explanation').notNull(),
  difficulty: integer('difficulty').notNull(), // 1=easy, 2=medium, 3=hard
  tags: text('tags'),                          // JSON array
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_questions_topic_id').on(t.topicId),
  index('idx_questions_difficulty').on(t.difficulty),
])

// 5. exam_attempts
export const examAttempts = sqliteTable('exam_attempts', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  scorePercent: real('score_percent'),
  totalQuestions: integer('total_questions').notNull(),
  correctCount: integer('correct_count'),
  timeSpentSeconds: integer('time_spent_seconds'),
  domainFilter: text('domain_filter'), // JSON array of domain IDs, null = all
  isTimed: integer('is_timed', { mode: 'boolean' }).notNull().default(true),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('idx_exam_attempts_exam_id').on(t.examId),
])

// 6. question_attempts
export const questionAttempts = sqliteTable('question_attempts', {
  id: text('id').primaryKey(),
  examAttemptId: text('exam_attempt_id').notNull().references(() => examAttempts.id),
  questionId: text('question_id').notNull().references(() => questions.id),
  selectedAnswer: text('selected_answer').notNull(), // JSON
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  timeSpentSeconds: integer('time_spent_seconds'),
  isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('idx_question_attempts_exam_attempt_id').on(t.examAttemptId),
  index('idx_question_attempts_question_id').on(t.questionId),
])

// 7. flashcards
export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  front: text('front').notNull(),
  back: text('back').notNull(),
  tags: text('tags'),          // JSON array
  difficulty: integer('difficulty').notNull().default(2),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_flashcards_topic_id').on(t.topicId),
])

// 8. flashcard_reviews — SM-2 spaced repetition state
export const flashcardReviews = sqliteTable('flashcard_reviews', {
  id: text('id').primaryKey(),
  flashcardId: text('flashcard_id').notNull().references(() => flashcards.id).unique(),
  easeFactor: real('ease_factor').notNull().default(2.5),
  intervalDays: integer('interval_days').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  quality: integer('quality').notNull().default(0), // 0-5 SM-2 rating
  nextReviewAt: text('next_review_at').notNull(),
  reviewedAt: text('reviewed_at').notNull(),
}, (t) => [
  index('idx_flashcard_reviews_flashcard_id').on(t.flashcardId),
  index('idx_flashcard_reviews_next_review').on(t.nextReviewAt),
])

// 9. study_progress
export const studyProgress = sqliteTable('study_progress', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id).unique(),
  status: text('status').notNull().default('not_started'), // 'not_started' | 'in_progress' | 'completed' | 'needs_review'
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  lastStudiedAt: text('last_studied_at'),
  notes: text('notes'),
}, (t) => [
  index('idx_study_progress_topic_id').on(t.topicId),
])

// Inferred TypeScript types
export type Exam = typeof exams.$inferSelect
export type Domain = typeof domains.$inferSelect
export type Topic = typeof topics.$inferSelect
export type Question = typeof questions.$inferSelect
export type ExamAttempt = typeof examAttempts.$inferSelect
export type QuestionAttempt = typeof questionAttempts.$inferSelect
export type Flashcard = typeof flashcards.$inferSelect
export type FlashcardReview = typeof flashcardReviews.$inferSelect
export type StudyProgress = typeof studyProgress.$inferSelect

export type NewExam = typeof exams.$inferInsert
export type NewDomain = typeof domains.$inferInsert
export type NewTopic = typeof topics.$inferInsert
export type NewQuestion = typeof questions.$inferInsert
export type NewFlashcard = typeof flashcards.$inferInsert
export type NewFlashcardReview = typeof flashcardReviews.$inferInsert
export type NewStudyProgress = typeof studyProgress.$inferInsert
