import { db } from '../index'
import { questions } from '../schema'
import { BATCH17_QUESTIONS } from './questions-batch17'

async function run() {
  await db.insert(questions).values(BATCH17_QUESTIONS).onConflictDoNothing()
  console.log(`✓ Inserted batch17 questions (${BATCH17_QUESTIONS.length} rows, duplicates skipped)`)
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
