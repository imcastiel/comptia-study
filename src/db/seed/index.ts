import { db } from '../index'
import { exams, domains, topics, questions, flashcards, flashcardReviews, flashcardReviewLog, studyProgress, examAttempts, questionAttempts, drillSets, drillFacts, questionDistractors, topicMastery, masterySnapshots, passProbability } from '../schema'
import { SEED_EXAMS, SEED_DOMAINS, SEED_TOPICS } from './exam-structure'
import { SEED_QUESTIONS } from './questions'
import { SEED_FLASHCARDS } from './flashcards'
import { SEED_DRILL_SETS, SEED_DRILL_FACTS } from './drill-sets'

// SQLite has a SQLITE_MAX_VARIABLE_NUMBER limit (~32766). For large seed arrays,
// chunk inserts to stay well under that limit.
async function batchInsert<T extends Record<string, unknown>>(
  table: Parameters<typeof db.insert>[0],
  rows: T[],
  chunkSize = 200,
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    await db.insert(table).values(rows.slice(i, i + chunkSize) as T[])
  }
}

async function seed() {
  // Guard: db:seed DELETEs all content. Never let it run against a remote
  // (Turso/libsql/http) database by accident — that's a production wipe.
  const url = process.env.DATABASE_URL ?? ''
  if (/^(libsql|wss?|https?):/i.test(url) && process.env.ALLOW_REMOTE_SEED !== '1') {
    console.error(`✋ Refusing to seed a remote database (${url.split(':')[0]}://…).`)
    console.error('   db:seed wipes ALL content. Run it only against a local file DB.')
    console.error('   Override intentionally with ALLOW_REMOTE_SEED=1 if you truly mean it.')
    process.exit(1)
  }

  console.log('🌱 Seeding database...')

  // Clear existing data in FK-safe order (children before parents)
  await db.delete(questionAttempts)
  await db.delete(questionDistractors)
  await db.delete(examAttempts)
  await db.delete(flashcardReviewLog)
  await db.delete(flashcardReviews)
  await db.delete(drillFacts)
  await db.delete(drillSets)
  await db.delete(studyProgress)
  await db.delete(topicMastery)
  await db.delete(masterySnapshots)
  await db.delete(passProbability)
  await db.delete(flashcards)
  await db.delete(questions)
  await db.delete(topics)
  await db.delete(domains)
  await db.delete(exams)

  // Insert exams
  await db.insert(exams).values(SEED_EXAMS)
  console.log(`  ✓ ${SEED_EXAMS.length} exams`)

  // Insert domains
  await db.insert(domains).values(SEED_DOMAINS)
  console.log(`  ✓ ${SEED_DOMAINS.length} domains`)

  // Insert topics
  await db.insert(topics).values(SEED_TOPICS)
  console.log(`  ✓ ${SEED_TOPICS.length} topics`)

  // Insert questions (batch to stay under SQLite variable limit).
  // Seed content is published so a fresh DB has visible content immediately.
  await batchInsert(questions, SEED_QUESTIONS.map((q) => ({ ...q, published: true })))
  console.log(`  ✓ ${SEED_QUESTIONS.length} questions`)

  // Insert flashcards (batch to stay under SQLite variable limit).
  await batchInsert(flashcards, SEED_FLASHCARDS.map((f) => ({ ...f, published: true })))
  console.log(`  ✓ ${SEED_FLASHCARDS.length} flashcards`)

  // Insert drill sets
  await db.insert(drillSets).values(SEED_DRILL_SETS)
  console.log(`  ✓ ${SEED_DRILL_SETS.length} drill sets`)
  await db.insert(drillFacts).values(SEED_DRILL_FACTS)
  console.log(`  ✓ ${SEED_DRILL_FACTS.length} drill facts`)

  console.log('✅ Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
