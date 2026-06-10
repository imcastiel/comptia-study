/**
 * AI accuracy sweep — fact-checks published questions and files suspect
 * items into the content_flags review queue (worked in /admin/health).
 *
 *   npm run review:accuracy -- --domain hardware          # one domain (slug)
 *   npm run review:accuracy -- --exam 220-1201            # whole exam
 *   npm run review:accuracy -- --limit 20 --dry-run       # taste it first
 *
 * Each batch is one model call; a full exam costs real API money, so scope
 * runs deliberately (domain by domain, highest exam weight first).
 * Items with an existing pending accuracy flag are skipped, making the
 * sweep resumable and re-runnable without duplicate flags.
 */
import { randomUUID } from 'crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../src/db'
import { questions, topics, domains, exams, contentFlags } from '../src/db/schema'
import { reviewAccuracyBatch, type ReviewQuestion } from '../src/lib/admin/accuracy-review'

const BATCH_SIZE = 10

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  return idx >= 0 ? process.argv[idx + 1] : undefined
}
const has = (name: string) => process.argv.includes(`--${name}`)

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set.')
    process.exit(1)
  }

  const examCode = arg('exam')
  const domainSlug = arg('domain')
  const limit = arg('limit') ? Number(arg('limit')) : undefined
  const dryRun = has('dry-run')

  let rows = await db
    .select({
      id: questions.id, stem: questions.stem, choices: questions.choices,
      correctAnswer: questions.correctAnswer, explanation: questions.explanation,
      domainSlug: domains.slug, examCode: exams.code,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .innerJoin(exams, eq(domains.examId, exams.id))
    .where(eq(questions.published, true))

  if (examCode) rows = rows.filter((r) => r.examCode === examCode)
  if (domainSlug) rows = rows.filter((r) => r.domainSlug === domainSlug)

  // Resumability: skip anything already pending review.
  const ids = rows.map((r) => r.id)
  const existing = ids.length
    ? await db.select({ itemId: contentFlags.itemId }).from(contentFlags)
        .where(and(
          eq(contentFlags.source, 'accuracy_review'),
          eq(contentFlags.status, 'pending'),
          inArray(contentFlags.itemId, ids),
        ))
    : []
  const alreadyFlagged = new Set(existing.map((e) => e.itemId))
  let queue = rows.filter((r) => !alreadyFlagged.has(r.id))
  if (limit) queue = queue.slice(0, limit)

  console.log(`Reviewing ${queue.length} questions (${alreadyFlagged.size} already pending)${dryRun ? ' [dry run]' : ''}…`)

  let flagCount = 0
  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    const batch: ReviewQuestion[] = queue.slice(i, i + BATCH_SIZE)
    const flags = await reviewAccuracyBatch(batch)
    for (const f of flags) {
      flagCount++
      console.log(`[${f.severity}] ${f.itemId} — ${f.code}: ${f.detail}`)
      if (!dryRun) {
        await db.insert(contentFlags).values({
          id: randomUUID(),
          itemType: 'question',
          itemId: f.itemId,
          source: 'accuracy_review',
          severity: f.severity,
          code: f.code,
          detail: f.detail,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      }
    }
    console.log(`…${Math.min(i + BATCH_SIZE, queue.length)}/${queue.length}`)
  }

  console.log(`\nDone: ${flagCount} flag(s)${dryRun ? ' (not written — dry run)' : ' filed to the review queue'}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Accuracy review failed:', err)
  process.exit(1)
})
