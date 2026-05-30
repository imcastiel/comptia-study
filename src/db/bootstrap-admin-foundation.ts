import { db } from './index'
import { questions, flashcards, generationProfiles } from './schema'
import { sql } from 'drizzle-orm'

const DEFAULT_PROFILES = [
  {
    contentType: 'questions',
    masterPrompt:
      'You are a CompTIA A+ exam question author. Write exam-accurate multiple-choice questions with one unambiguous correct answer, plausible distractors, and a concise explanation of why the answer is correct. Never duplicate concepts already provided in the existing-items context.',
  },
  {
    contentType: 'flashcards',
    masterPrompt:
      'You are a CompTIA A+ flashcard author. Cards must be exam-accurate and concise. When asked, include a vivid mnemonic and a concrete memory method (chunking, association, story). Never duplicate concepts already provided in the existing-items context.',
  },
] as const

async function run() {
  const now = new Date().toISOString()

  // Backfill: existing content is published seed content.
  await db.update(questions).set({ published: true, source: 'seed' }).where(sql`${questions.source} = 'seed'`)
  await db.update(flashcards).set({ published: true, source: 'seed' }).where(sql`${flashcards.source} = 'seed'`)

  for (const p of DEFAULT_PROFILES) {
    await db.insert(generationProfiles)
      .values({ ...p, defaultOptions: '{}', updatedAt: now })
      .onConflictDoNothing({ target: generationProfiles.contentType })
  }

  console.log('✅ Admin foundation bootstrap complete')
  process.exit(0)
}

run().catch((e) => { console.error('Bootstrap failed:', e); process.exit(1) })
