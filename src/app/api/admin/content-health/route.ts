import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards } from '@/db/schema'
import { requireAdmin } from '@/lib/auth'
import { lintQuestion, lintFlashcard, findDuplicates, type LintIssue } from '@/lib/content-lint'

export interface FlaggedItem {
  id: string
  topicId: string
  published: boolean
  excerpt: string
  issues: LintIssue[]
}

export interface ContentHealthResponse {
  scanned: { questions: number; flashcards: number }
  errorCount: number
  warningCount: number
  questions: FlaggedItem[]
  flashcards: FlaggedItem[]
  duplicateQuestionGroups: string[][]
  duplicateFlashcardGroups: string[][]
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if (guard) return guard

  const includeDrafts = req.nextUrl.searchParams.get('all') === '1'

  const qRows = await db.select().from(questions)
  const fRows = await db.select().from(flashcards)
  const qScan = includeDrafts ? qRows : qRows.filter((q) => q.published)
  const fScan = includeDrafts ? fRows : fRows.filter((f) => f.published)

  const flaggedQuestions: FlaggedItem[] = []
  for (const q of qScan) {
    const issues = lintQuestion({
      id: q.id, type: q.type, stem: q.stem,
      choices: q.choices, correctAnswer: q.correctAnswer, explanation: q.explanation,
    })
    if (issues.length) {
      flaggedQuestions.push({ id: q.id, topicId: q.topicId, published: q.published, excerpt: q.stem.slice(0, 120), issues })
    }
  }

  const flaggedFlashcards: FlaggedItem[] = []
  for (const f of fScan) {
    const issues = lintFlashcard({ id: f.id, front: f.front, back: f.back })
    if (issues.length) {
      flaggedFlashcards.push({ id: f.id, topicId: f.topicId, published: f.published, excerpt: f.front.slice(0, 120), issues })
    }
  }

  const all = [...flaggedQuestions, ...flaggedFlashcards]
  const body: ContentHealthResponse = {
    scanned: { questions: qScan.length, flashcards: fScan.length },
    errorCount: all.reduce((n, x) => n + x.issues.filter((i) => i.severity === 'error').length, 0),
    warningCount: all.reduce((n, x) => n + x.issues.filter((i) => i.severity === 'warning').length, 0),
    questions: flaggedQuestions,
    flashcards: flaggedFlashcards,
    duplicateQuestionGroups: findDuplicates(qScan.map((q) => ({ id: q.id, text: q.stem }))),
    duplicateFlashcardGroups: findDuplicates(fScan.map((f) => ({ id: f.id, text: f.front }))),
  }
  return NextResponse.json(body)
}
