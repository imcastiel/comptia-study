import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, topics, domains, exams } from '@/db/schema'
import { eq, sql, inArray } from 'drizzle-orm'

const EXAM_CODE: Record<string, string> = { core1: '220-1201', core2: '220-1202' }

export async function GET(req: NextRequest) {
  const count = Math.min(parseInt(req.nextUrl.searchParams.get('count') ?? '20'), 90)
  const isStudy = req.nextUrl.searchParams.get('study') === 'true'
  const examKey = req.nextUrl.searchParams.get('exam') ?? ''
  const examCode = EXAM_CODE[examKey]
  const retryParam = req.nextUrl.searchParams.get('retryIds') ?? ''
  const retryIds = retryParam ? retryParam.split(',').filter(Boolean) : []

  try {
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
        ? baseQuery.where(inArray(questions.id, retryIds))
        : examCode
        ? baseQuery.where(eq(exams.code, examCode)).orderBy(sql`RANDOM()`).limit(count)
        : baseQuery.orderBy(sql`RANDOM()`).limit(count)
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
