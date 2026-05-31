import { NextResponse } from 'next/server'
import {
  users, examAttempts, questionAttempts, flashcardReviews, studyActivityLog,
  passProbability, exams,
} from '@/db/schema'
import { db } from '@/db'
import { sql, gte, eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

  const [
    [{ totalAccounts }],
    [{ activeAccounts }],
    [{ attempts }],
    [{ answered }],
    [{ reviews }],
    growthRows,
    activityRows,
    readinessRows,
    examRows,
  ] = await Promise.all([
    db.select({ totalAccounts: sql<number>`count(*)` }).from(users),
    db.select({ activeAccounts: sql<number>`count(distinct ${users.code})` }).from(users).where(gte(users.lastActiveAt, sevenDaysAgo)),
    db.select({ attempts: sql<number>`count(*)` }).from(examAttempts).where(eq(examAttempts.isCompleted, true)),
    db.select({ answered: sql<number>`count(*)` }).from(questionAttempts),
    db.select({ reviews: sql<number>`count(*)` }).from(flashcardReviews),
    db.select({ day: sql<string>`substr(${users.createdAt}, 1, 10)`, n: sql<number>`count(*)` })
      .from(users).groupBy(sql`substr(${users.createdAt}, 1, 10)`).orderBy(sql`substr(${users.createdAt}, 1, 10)`),
    db.select({ day: studyActivityLog.date, minutes: sql<number>`sum(${studyActivityLog.minutesActive})`, users: sql<number>`count(distinct ${studyActivityLog.userId})` })
      .from(studyActivityLog).groupBy(studyActivityLog.date).orderBy(studyActivityLog.date),
    db.select({ examId: passProbability.examId, probability: passProbability.probability, predictedScore: passProbability.predictedScore, userId: passProbability.userId, computedAt: passProbability.computedAt })
      .from(passProbability).orderBy(desc(passProbability.computedAt)),
    db.select({ id: exams.id, code: exams.code, name: exams.name }).from(exams),
  ])

  const latest = new Map<string, { examId: string; probability: number; predictedScore: number | null }>()
  for (const r of readinessRows) {
    const key = `${r.userId}:${r.examId}`
    if (!latest.has(key)) latest.set(key, { examId: r.examId, probability: r.probability, predictedScore: r.predictedScore })
  }
  const readiness = examRows.map((ex) => {
    const vals = [...latest.values()].filter((v) => v.examId === ex.id)
    const buckets = { low: 0, mid: 0, high: 0 }
    let scoreSum = 0
    for (const v of vals) {
      if (v.probability < 0.45) buckets.low++
      else if (v.probability < 0.7) buckets.mid++
      else buckets.high++
      scoreSum += v.predictedScore ?? 0
    }
    return { examId: ex.id, code: ex.code, name: ex.name, count: vals.length, buckets, avgPredictedScore: vals.length ? Math.round(scoreSum / vals.length) : 0 }
  })

  return NextResponse.json({
    audience: { totalAccounts: Number(totalAccounts), activeAccounts: Number(activeAccounts) },
    engagement: { attempts: Number(attempts), questionsAnswered: Number(answered), flashcardReviews: Number(reviews) },
    growth: growthRows.map((r) => ({ day: r.day, accounts: Number(r.n) })),
    activity: activityRows.map((r) => ({ day: r.day, minutes: Number(r.minutes), users: Number(r.users) })),
    readiness,
  })
}
