import { sqliteTable, text, integer, real, index, unique, primaryKey } from 'drizzle-orm/sqlite-core'

// ─── 0. users ────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  code: text('code').primaryKey(),          // 16-digit string, e.g. "1234567890123456"
  createdAt: text('created_at').notNull(),
  lastActiveAt: text('last_active_at'),
  targetExamDate: text('target_exam_date'), // nullable ISO date, e.g. "2026-08-15"
})

// ─── 1. exams ─────────────────────────────────────────────────────────────────

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

// ─── 2. domains ───────────────────────────────────────────────────────────────

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

// ─── 3. topics ────────────────────────────────────────────────────────────────

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

// ─── 4. questions ─────────────────────────────────────────────────────────────

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  type: text('type').notNull(),
  stem: text('stem').notNull(),
  choices: text('choices').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  difficulty: integer('difficulty').notNull(),
  tags: text('tags'),
  createdAt: text('created_at').notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('seed'),
  updatedAt: text('updated_at'),
}, (t) => [
  index('idx_questions_topic_id').on(t.topicId),
  index('idx_questions_difficulty').on(t.difficulty),
])

// ─── 5. exam_attempts ─────────────────────────────────────────────────────────

export const examAttempts = sqliteTable('exam_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  examId: text('exam_id').notNull().references(() => exams.id),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  scorePercent: real('score_percent'),
  scaledScore: real('scaled_score'),
  totalQuestions: integer('total_questions').notNull(),
  correctCount: integer('correct_count'),
  timeSpentSeconds: integer('time_spent_seconds'),
  domainFilter: text('domain_filter'),
  isTimed: integer('is_timed', { mode: 'boolean' }).notNull().default(true),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('idx_exam_attempts_user_exam').on(t.userId, t.examId),
])

// ─── 6. question_attempts ─────────────────────────────────────────────────────

export const questionAttempts = sqliteTable('question_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  examAttemptId: text('exam_attempt_id').notNull().references(() => examAttempts.id),
  questionId: text('question_id').notNull().references(() => questions.id),
  topicId: text('topic_id').notNull(),
  domainId: text('domain_id').notNull(),
  selectedAnswer: text('selected_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  timeSpentSeconds: integer('time_spent_seconds'),
  isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('idx_qa_user_topic').on(t.userId, t.topicId),
  index('idx_qa_user_question').on(t.userId, t.questionId),
  index('idx_qa_exam_attempt').on(t.examAttemptId),
])

// ─── 7. flashcards ────────────────────────────────────────────────────────────

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  front: text('front').notNull(),
  back: text('back').notNull(),
  tags: text('tags'),
  difficulty: integer('difficulty').notNull().default(2),
  createdAt: text('created_at').notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('seed'),
  updatedAt: text('updated_at'),
}, (t) => [
  index('idx_flashcards_topic_id').on(t.topicId),
])

// ─── generation_profiles — editable master prompts per content type ───────────

export const generationProfiles = sqliteTable('generation_profiles', {
  contentType: text('content_type').primaryKey(),
  masterPrompt: text('master_prompt').notNull(),
  defaultOptions: text('default_options').notNull().default('{}'),
  updatedAt: text('updated_at').notNull(),
})

export type GenerationProfile = typeof generationProfiles.$inferSelect

// ─── cheat_sheets + pbq_scenarios — static content migrated to DB (JSON blobs) ─

export const cheatSheets = sqliteTable('cheat_sheets', {
  id: text('id').primaryKey(),            // = topicSlug
  title: text('title').notNull(),
  exam: text('exam').notNull(),           // 'core1' | 'core2'
  domainSlug: text('domain_slug').notNull(),
  data: text('data').notNull(),           // JSON of the full CheatSheet object
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('seed'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
})

export const pbqScenarios = sqliteTable('pbq_scenarios', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  examCode: text('exam_code').notNull(),
  data: text('data').notNull(),           // JSON of the full PBQScenario object
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  source: text('source').notNull().default('seed'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
})

export type CheatSheetRow = typeof cheatSheets.$inferSelect
export type PbqScenarioRow = typeof pbqScenarios.$inferSelect

// ─── 8. flashcard_reviews — SM-2 current state (per user per card) ────────────

export const flashcardReviews = sqliteTable('flashcard_reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  flashcardId: text('flashcard_id').notNull().references(() => flashcards.id),
  easeFactor: real('ease_factor').notNull().default(2.5),
  intervalDays: integer('interval_days').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  quality: integer('quality').notNull().default(0),
  nextReviewAt: text('next_review_at').notNull(),
  reviewedAt: text('reviewed_at').notNull(),
}, (t) => [
  unique('uq_flashcard_reviews_user_card').on(t.userId, t.flashcardId),
  index('idx_fr_user_next').on(t.userId, t.nextReviewAt),
])

// ─── 9. flashcard_review_log — append-only SM-2 history ─────────────────────

export const flashcardReviewLog = sqliteTable('flashcard_review_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  flashcardId: text('flashcard_id').notNull().references(() => flashcards.id),
  quality: integer('quality').notNull(),
  easeFactor: real('ease_factor').notNull(),
  intervalDays: integer('interval_days').notNull(),
  reviewedAt: text('reviewed_at').notNull(),
}, (t) => [
  index('idx_frl_user_card').on(t.userId, t.flashcardId),
])

// ─── 10. study_progress ────────────────────────────────────────────────────────

export const studyProgress = sqliteTable('study_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  topicId: text('topic_id').notNull().references(() => topics.id),
  status: text('status').notNull().default('not_started'),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  lastStudiedAt: text('last_studied_at'),
  notes: text('notes'),
}, (t) => [
  unique('uq_study_progress_user_topic').on(t.userId, t.topicId),
  index('idx_study_progress_user').on(t.userId),
])

// ─── 11. study_activity_log — one row per user per calendar day ───────────────

export const studyActivityLog = sqliteTable('study_activity_log', {
  userId: text('user_id').notNull().references(() => users.code),
  date: text('date').notNull(),
  minutesActive: integer('minutes_active').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.userId, t.date] }),
])

// ─── 12. study_topic_visits — dedup log ──────────────────────────────────────

export const studyTopicVisits = sqliteTable('study_topic_visits', {
  userId: text('user_id').notNull().references(() => users.code),
  date: text('date').notNull(),
  topicId: text('topic_id').notNull(),
}, (t) => [
  unique('uq_topic_visits_user_date_topic').on(t.userId, t.date, t.topicId),
])

// ─── 13. topic_mastery — rolling per-user per-topic analytics ────────────────

export const topicMastery = sqliteTable('topic_mastery', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  topicId: text('topic_id').notNull().references(() => topics.id),
  questionsSeen: integer('questions_seen').notNull().default(0),
  questionsCorrect: integer('questions_correct').notNull().default(0),
  ewmaAccuracy: real('ewma_accuracy').notNull().default(0),
  lastSeenAt: text('last_seen_at'),
  lastCorrectAt: text('last_correct_at'),
  currentStreak: integer('current_streak').notNull().default(0),
  totalTimeSeconds: integer('total_time_seconds').notNull().default(0),
  avgTimeSeconds: real('avg_time_seconds'),
  masteryScore: real('mastery_score').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
}, (t) => [
  unique('uq_topic_mastery_user_topic').on(t.userId, t.topicId),
  index('idx_tm_user').on(t.userId),
])

// ─── 14. question_distractors — wrong-answer frequency ───────────────────────

export const questionDistractors = sqliteTable('question_distractors', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  questionId: text('question_id').notNull().references(() => questions.id),
  choiceId: text('choice_id').notNull(),
  timesChosen: integer('times_chosen').notNull().default(1),
  lastChosenAt: text('last_chosen_at').notNull(),
}, (t) => [
  unique('uq_distractors_user_q_choice').on(t.userId, t.questionId, t.choiceId),
  index('idx_qd_user').on(t.userId),
])

// ─── 15. mastery_snapshots — daily point-in-time ─────────────────────────────

export const masterySnapshots = sqliteTable('mastery_snapshots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  examId: text('exam_id').notNull().references(() => exams.id),
  domainId: text('domain_id'),
  snapshotDate: text('snapshot_date').notNull(),
  masteryScore: real('mastery_score').notNull(),
  questionsSeen: integer('questions_seen').notNull(),
  accuracy: real('accuracy').notNull(),
}, (t) => [
  unique('uq_snapshots_user_exam_domain_date').on(t.userId, t.examId, t.domainId, t.snapshotDate),
  index('idx_ms_user_exam_date').on(t.userId, t.examId, t.snapshotDate),
])

// ─── 16. pass_probability — stored estimate per user per exam ─────────────────

export const passProbability = sqliteTable('pass_probability', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.code),
  examId: text('exam_id').notNull().references(() => exams.id),
  probability: real('probability').notNull(),
  predictedScore: real('predicted_score'),
  confidence: real('confidence').notNull(),
  domainBreakdown: text('domain_breakdown').notNull(),
  sampleSize: integer('sample_size').notNull(),
  computedAt: text('computed_at').notNull(),
}, (t) => [
  index('idx_pp_user_exam_date').on(t.userId, t.examId, t.computedAt),
])

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type Exam = typeof exams.$inferSelect
export type Domain = typeof domains.$inferSelect
export type Topic = typeof topics.$inferSelect
export type Question = typeof questions.$inferSelect
export type ExamAttempt = typeof examAttempts.$inferSelect
export type QuestionAttempt = typeof questionAttempts.$inferSelect
export type Flashcard = typeof flashcards.$inferSelect
export type FlashcardReview = typeof flashcardReviews.$inferSelect
export type FlashcardReviewLog = typeof flashcardReviewLog.$inferSelect
export type StudyProgress = typeof studyProgress.$inferSelect
export type TopicMastery = typeof topicMastery.$inferSelect
export type QuestionDistractor = typeof questionDistractors.$inferSelect
export type MasterySnapshot = typeof masterySnapshots.$inferSelect
export type PassProbabilityRow = typeof passProbability.$inferSelect

export type NewUser = typeof users.$inferInsert
export type NewExam = typeof exams.$inferInsert
export type NewDomain = typeof domains.$inferInsert
export type NewTopic = typeof topics.$inferInsert
export type NewQuestion = typeof questions.$inferInsert
export type NewFlashcard = typeof flashcards.$inferInsert
export type NewFlashcardReview = typeof flashcardReviews.$inferInsert
export type NewStudyProgress = typeof studyProgress.$inferInsert
export type StudyActivityLog = typeof studyActivityLog.$inferSelect
export type StudyTopicVisit = typeof studyTopicVisits.$inferSelect
