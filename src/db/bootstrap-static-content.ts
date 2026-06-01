import { db } from './index'
import { cheatSheets, pbqScenarios } from './schema'
import { CHEAT_SHEETS } from '../data/cheat-sheets'
import { PBQ_SCENARIOS } from '../data/pbq-scenarios'

async function run() {
  const now = new Date().toISOString()

  for (const cs of CHEAT_SHEETS) {
    await db.insert(cheatSheets).values({
      id: cs.topicSlug, title: cs.title, exam: cs.exam, domainSlug: cs.domainSlug,
      data: JSON.stringify(cs), published: true, source: 'seed', createdAt: now, updatedAt: now,
    }).onConflictDoNothing({ target: cheatSheets.id })
  }
  console.log(`  ✓ ${CHEAT_SHEETS.length} cheat sheets`)

  for (const s of PBQ_SCENARIOS) {
    await db.insert(pbqScenarios).values({
      id: s.id, title: s.title, category: s.category, examCode: s.examCode,
      data: JSON.stringify(s), published: true, source: 'seed', createdAt: now, updatedAt: now,
    }).onConflictDoNothing({ target: pbqScenarios.id })
  }
  console.log(`  ✓ ${PBQ_SCENARIOS.length} PBQ scenarios`)

  console.log('✅ Static content bootstrap complete')
  process.exit(0)
}
run().catch((e) => { console.error('Bootstrap failed:', e); process.exit(1) })
