import { NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, questionAttempts, questionDistractors, topicMastery } from '@/db/schema'
import { sql, eq, and, inArray } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { scoreSuspect } from '@/lib/admin/analytics/suspect'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard

  const attemptStats = await db.select({
    questionId: questionAttempts.questionId,
    total: sql<number>`count(*)`,
    correct: sql<number>`sum(case when ${questionAttempts.isCorrect} then 1 else 0 end)`,
  }).from(questionAttempts).groupBy(questionAttempts.questionId).having(sql`count(*) >= 8`)

  if (attemptStats.length === 0) return NextResponse.json({ suspects: [] })
  const ids = attemptStats.map((r) => r.questionId)

  const distractorRows = await db.select({
    questionId: questionDistractors.questionId,
    choiceId: questionDistractors.choiceId,
    times: sql<number>`sum(${questionDistractors.timesChosen})`,
  }).from(questionDistractors).groupBy(questionDistractors.questionId, questionDistractors.choiceId)
  const wrongByQuestion = new Map<string, Record<string, number>>()
  for (const r of distractorRows) {
    const m = wrongByQuestion.get(r.questionId) ?? {}
    m[r.choiceId] = Number(r.times)
    wrongByQuestion.set(r.questionId, m)
  }

  const wrongMastery = await db.select({
    questionId: questionAttempts.questionId,
    avgMastery: sql<number>`avg(${topicMastery.masteryScore})`,
  }).from(questionAttempts)
    .innerJoin(topicMastery, and(eq(topicMastery.userId, questionAttempts.userId), eq(topicMastery.topicId, questionAttempts.topicId)))
    .where(eq(questionAttempts.isCorrect, false))
    .groupBy(questionAttempts.questionId)
  const wrongMasteryMap = new Map(wrongMastery.map((r) => [r.questionId, r.avgMastery == null ? null : Number(r.avgMastery)]))

  const stems = await db.select({ id: questions.id, stem: questions.stem, topicId: questions.topicId })
    .from(questions).where(inArray(questions.id, ids))
  const stemMap = new Map(stems.map((s) => [s.id, s]))

  const suspects = attemptStats.map((a) => {
    const result = scoreSuspect({
      totalAttempts: Number(a.total),
      correctCount: Number(a.correct),
      wrongChoiceCounts: wrongByQuestion.get(a.questionId) ?? {},
      wrongUserAvgMastery: wrongMasteryMap.get(a.questionId) ?? null,
    })
    const q = stemMap.get(a.questionId)
    return {
      questionId: a.questionId,
      stem: q?.stem ?? '(unknown)',
      topicId: q?.topicId ?? '',
      totalAttempts: Number(a.total),
      correctRate: Math.round(result.correctRate * 100),
      score: result.score,
      reasons: result.reasons,
      suspect: result.suspect,
    }
  })
    .filter((s) => s.suspect)
    .sort((x, y) => y.score - x.score)

  return NextResponse.json({ suspects })
}
