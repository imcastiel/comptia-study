import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { questions, flashcards, topics, contentFlags } from '@/db/schema'
import { requireAdmin } from '@/lib/auth'
import { lintQuestion, lintFlashcard, findDuplicates, type LintIssue } from '@/lib/content-lint'
import { extractKeywords, findUncovered } from '@/lib/objective-keywords'

export interface FlaggedItem {
  id: string
  topicId: string
  published: boolean
  excerpt: string
  issues: LintIssue[]
}

export interface ReviewFlag {
  id: string
  itemType: string
  itemId: string
  severity: string
  code: string
  detail: string
  createdAt: string
  excerpt: string
}

export interface TopicGap {
  topicId: string
  topicTitle: string
  missing: string[]
}

export interface ContentHealthResponse {
  scanned: { questions: number; flashcards: number }
  errorCount: number
  warningCount: number
  questions: FlaggedItem[]
  flashcards: FlaggedItem[]
  duplicateQuestionGroups: string[][]
  duplicateFlashcardGroups: string[][]
  reviewQueue: ReviewFlag[]
  gaps: TopicGap[]
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

  // Pending review-queue flags (from the AI accuracy sweep et al.), with the
  // flagged item's text so the admin can judge without leaving the page.
  const pending = await db.select().from(contentFlags).where(eq(contentFlags.status, 'pending'))
  const qById = new Map(qRows.map((q) => [q.id, q.stem]))
  const fById = new Map(fRows.map((f) => [f.id, f.front]))
  const reviewQueue: ReviewFlag[] = pending.map((p) => ({
    id: p.id,
    itemType: p.itemType,
    itemId: p.itemId,
    severity: p.severity,
    code: p.code,
    detail: p.detail,
    createdAt: p.createdAt,
    excerpt: (p.itemType === 'question' ? qById.get(p.itemId) : fById.get(p.itemId))?.slice(0, 120) ?? '(item not found)',
  }))

  // Objective coverage gaps: topic descriptions carry the official objective
  // bullet keywords — find ones no published item exercises.
  const topicRows = await db.select({ id: topics.id, title: topics.title, description: topics.description }).from(topics)
  const textsByTopic = new Map<string, string[]>()
  for (const q of qScan) {
    const texts = textsByTopic.get(q.topicId) ?? []
    texts.push(`${q.stem} ${q.choices} ${q.explanation}`)
    textsByTopic.set(q.topicId, texts)
  }
  for (const f of fScan) {
    const texts = textsByTopic.get(f.topicId) ?? []
    texts.push(`${f.front} ${f.back}`)
    textsByTopic.set(f.topicId, texts)
  }
  const gaps: TopicGap[] = []
  for (const t of topicRows) {
    if (!t.description) continue
    const missing = findUncovered(extractKeywords(t.description), textsByTopic.get(t.id) ?? [])
    if (missing.length) gaps.push({ topicId: t.id, topicTitle: t.title, missing })
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
    reviewQueue,
    gaps,
  }
  return NextResponse.json(body)
}
