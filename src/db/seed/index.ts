import { db } from '../index'
import { exams, domains, topics } from '../schema'
import { SEED_EXAMS, SEED_DOMAINS, SEED_TOPICS } from './exam-structure'

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data (order matters due to FK constraints)
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

  console.log('✅ Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
