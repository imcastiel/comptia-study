import { NextResponse } from 'next/server'
import { db } from '@/db'
import { questionAttempts, questions, topics, domains, exams } from '@/db/schema'
import { eq, sql, count } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select({
        topicId: topics.id,
        topicTitle: topics.title,
        topicSlug: topics.slug,
        domainSlug: domains.slug,
        examId: exams.id,
        correct: sql<number>`sum(case when ${questionAttempts.isCorrect} = 1 then 1 else 0 end)`,
        total: count(),
      })
      .from(questionAttempts)
      .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .innerJoin(exams, eq(domains.examId, exams.id))
      .groupBy(topics.id)
      .having(sql`count(*) >= 3`)
      .orderBy(sql`CAST(sum(case when ${questionAttempts.isCorrect} = 1 then 1 else 0 end) AS REAL) / count(*) ASC`)
      .limit(20)

    const result = rows.map((r) => ({
      topicId: r.topicId,
      topicTitle: r.topicTitle,
      topicSlug: r.topicSlug,
      domainSlug: r.domainSlug,
      examId: r.examId,
      correct: Number(r.correct),
      total: Number(r.total),
      pct: Math.round((Number(r.correct) / Number(r.total)) * 100),
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/weak-spots]', err)
    return NextResponse.json([])
  }
}
