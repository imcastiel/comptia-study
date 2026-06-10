/**
 * Content lint CLI — runs the structural linter over every published
 * question and flashcard in the configured database.
 *
 *   npm run lint:content            # report + exit 1 if any errors
 *   npm run lint:content -- --all   # include unpublished drafts
 *
 * Exit code 1 means actively broken content (unscoreable questions,
 * disagreeing answer keys, empty cards) is live for learners.
 */
import { eq } from 'drizzle-orm'
import { db } from '../src/db'
import { questions, flashcards } from '../src/db/schema'
import { lintQuestion, lintFlashcard, findDuplicates, type LintIssue } from '../src/lib/content-lint'

const includeDrafts = process.argv.includes('--all')

interface Flagged {
  kind: 'question' | 'flashcard'
  id: string
  excerpt: string
  issues: LintIssue[]
}

async function main() {
  const qRows = includeDrafts
    ? await db.select().from(questions)
    : await db.select().from(questions).where(eq(questions.published, true))
  const fRows = includeDrafts
    ? await db.select().from(flashcards)
    : await db.select().from(flashcards).where(eq(flashcards.published, true))

  const flagged: Flagged[] = []

  for (const q of qRows) {
    const issues = lintQuestion({
      id: q.id, type: q.type, stem: q.stem,
      choices: q.choices, correctAnswer: q.correctAnswer, explanation: q.explanation,
    })
    if (issues.length) flagged.push({ kind: 'question', id: q.id, excerpt: q.stem.slice(0, 80), issues })
  }

  for (const f of fRows) {
    const issues = lintFlashcard({ id: f.id, front: f.front, back: f.back })
    if (issues.length) flagged.push({ kind: 'flashcard', id: f.id, excerpt: f.front.slice(0, 80), issues })
  }

  const dupeQuestions = findDuplicates(qRows.map((q) => ({ id: q.id, text: q.stem })))
  const dupeFlashcards = findDuplicates(fRows.map((f) => ({ id: f.id, text: f.front })))

  const errorCount = flagged.reduce((n, f) => n + f.issues.filter((i) => i.severity === 'error').length, 0)
  const warningCount = flagged.reduce((n, f) => n + f.issues.filter((i) => i.severity === 'warning').length, 0)

  for (const f of flagged) {
    for (const i of f.issues) {
      const tag = i.severity === 'error' ? 'ERROR' : 'warn '
      console.log(`[${tag}] ${f.kind} ${f.id} — ${i.code}: ${i.message}\n        “${f.excerpt}…”`)
    }
  }
  for (const group of dupeQuestions) console.log(`[warn ] duplicate question stems: ${group.join(', ')}`)
  for (const group of dupeFlashcards) console.log(`[warn ] duplicate flashcard fronts: ${group.join(', ')}`)

  console.log(`\nScanned ${qRows.length} questions, ${fRows.length} flashcards${includeDrafts ? ' (incl. drafts)' : ''}.`)
  console.log(`${errorCount} errors, ${warningCount + dupeQuestions.length + dupeFlashcards.length} warnings.`)

  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Content lint failed to run:', err)
  process.exit(1)
})
