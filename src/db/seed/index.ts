import { db } from '../index'
import { exams, domains, topics, questions, flashcards, flashcardReviews, studyProgress, examAttempts, questionAttempts } from '../schema'
import { SEED_EXAMS, SEED_DOMAINS, SEED_TOPICS } from './exam-structure'
import { SEED_QUESTIONS } from './questions'
import { SEED_FLASHCARDS } from './flashcards'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data in FK-safe order (children before parents)
  await db.delete(questionAttempts)
  await db.delete(examAttempts)
  await db.delete(flashcardReviews)
  await db.delete(studyProgress)
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

  // Insert questions
  await db.insert(questions).values(SEED_QUESTIONS)
  console.log(`  ✓ ${SEED_QUESTIONS.length} questions`)

  // Insert flashcards
  await db.insert(flashcards).values(SEED_FLASHCARDS)
  console.log(`  ✓ ${SEED_FLASHCARDS.length} flashcards`)

  console.log('✅ Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
