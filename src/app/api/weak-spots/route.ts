import { NextResponse } from 'next/server'
import { db } from '@/db'
import { topicMastery, topics, domains, exams } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'

export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json([], { status: 401 })

  try {
    const rows = await db
      .select({
        topicId: topics.id,
        topicTitle: topics.title,
        topicSlug: topics.slug,
        domainSlug: domains.slug,
        examId: exams.id,
        masteryScore: topicMastery.masteryScore,
        questionsSeen: topicMastery.questionsSeen,
        questionsCorrect: topicMastery.questionsCorrect,
      })
      .from(topicMastery)
      .innerJoin(topics, eq(topicMastery.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .innerJoin(exams, eq(domains.examId, exams.id))
      .where(and(eq(topicMastery.userId, userId), sql`${topicMastery.questionsSeen} >= 3`))
      .orderBy(topicMastery.masteryScore)
      .limit(20)

    return NextResponse.json(rows.map((r: { topicId: string; topicTitle: string; topicSlug: string; domainSlug: string; examId: string; masteryScore: number; questionsSeen: number; questionsCorrect: number }) => ({
      topicId: r.topicId,
      topicTitle: r.topicTitle,
      topicSlug: r.topicSlug,
      domainSlug: r.domainSlug,
      examId: r.examId,
      correct: r.questionsCorrect,
      total: r.questionsSeen,
      pct: Math.round((r.questionsCorrect / r.questionsSeen) * 100),
      masteryScore: r.masteryScore,
    })))
  } catch (err) {
    console.error('[/api/weak-spots]', err)
    return NextResponse.json([])
  }
}
