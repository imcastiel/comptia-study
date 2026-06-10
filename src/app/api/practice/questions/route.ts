import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, topics, domains, exams, topicMastery, questionAttempts, examAttempts } from '@/db/schema'
import { and, eq, sql, inArray } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import { selectAdaptive } from '@/lib/adaptive-select'

const EXAM_CODE: Record<string, string> = { core1: '220-1201', core2: '220-1202' }
const RECENT_DAYS = 3

/**
 * Weak-spot selection: weight candidates by low topic mastery and question
 * recency instead of uniform RANDOM(). Returns null when there is no
 * session user (caller falls back to random selection).
 */
async function selectWeakSpotIds(examCode: string | undefined, count: number): Promise<string[] | null> {
  const userId = await getUserCode()
  if (!userId) return null

  const candidateQuery = db
    .select({ id: questions.id, topicId: questions.topicId })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .innerJoin(exams, eq(domains.examId, exams.id))
  const candidates = await (examCode
    ? candidateQuery.where(and(eq(exams.code, examCode), eq(questions.published, true)))
    : candidateQuery.where(eq(questions.published, true)))
  if (candidates.length === 0) return []

  const mastery = await db
    .select({ topicId: topicMastery.topicId, masteryScore: topicMastery.masteryScore })
    .from(topicMastery)
    .where(eq(topicMastery.userId, userId))
  const masteryByTopic = Object.fromEntries(mastery.map((m) => [m.topicId, m.masteryScore]))

  // question_attempts has no timestamp of its own — recency comes from the
  // parent exam attempt's startedAt.
  const recentCutoff = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString()
  const attempts = await db
    .select({ questionId: questionAttempts.questionId, startedAt: examAttempts.startedAt })
    .from(questionAttempts)
    .innerJoin(examAttempts, eq(questionAttempts.examAttemptId, examAttempts.id))
    .where(eq(questionAttempts.userId, userId))
  const seenQuestionIds = new Set(attempts.map((a) => a.questionId))
  const recentQuestionIds = new Set(attempts.filter((a) => a.startedAt >= recentCutoff).map((a) => a.questionId))

  return selectAdaptive({ candidates, masteryByTopic, recentQuestionIds, seenQuestionIds, count })
}

export async function GET(req: NextRequest) {
  const count = Math.min(parseInt(req.nextUrl.searchParams.get('count') ?? '20'), 90)
  const isStudy = req.nextUrl.searchParams.get('study') === 'true'
  const examKey = req.nextUrl.searchParams.get('exam') ?? ''
  const examCode = EXAM_CODE[examKey]
  const retryParam = req.nextUrl.searchParams.get('retryIds') ?? ''
  const retryIds = retryParam ? retryParam.split(',').filter(Boolean) : []
  const focusWeak = req.nextUrl.searchParams.get('focus') === 'weak'

  try {
    const weakIds = focusWeak && retryIds.length === 0 ? await selectWeakSpotIds(examCode, count) : null
    const baseQuery = db
      .select({
        id: questions.id,
        type: questions.type,
        stem: questions.stem,
        choices: questions.choices,
        explanation: questions.explanation,
        objectiveId: topics.objectiveId,
        topicTitle: topics.title,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .innerJoin(exams, eq(domains.examId, exams.id))

    const rows = await (
      retryIds.length > 0
        ? baseQuery.where(and(inArray(questions.id, retryIds), eq(questions.published, true)))
        : weakIds !== null
        ? (weakIds.length > 0 ? baseQuery.where(inArray(questions.id, weakIds)) : Promise.resolve([]))
        : examCode
        ? baseQuery.where(and(eq(exams.code, examCode), eq(questions.published, true))).orderBy(sql`RANDOM()`).limit(count)
        : baseQuery.where(eq(questions.published, true)).orderBy(sql`RANDOM()`).limit(count)
    )

    const result = rows.map((q) => {
      const parsed = JSON.parse(q.choices) as Array<{ id: string; text: string; isCorrect?: boolean }>
      return {
        ...q,
        explanation: isStudy ? q.explanation : undefined,
        choices: parsed.map(({ id, text, isCorrect }) =>
          isStudy ? { id, text, isCorrect: !!isCorrect } : { id, text }
        ),
      }
    })

    return NextResponse.json({ questions: result })
  } catch (err) {
    console.error('Failed to load questions:', err)
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
