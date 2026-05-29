import { NextResponse } from 'next/server'
import { db } from '@/db'
import { exams, domains, passProbability, masterySnapshots } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import type { DomainBreakdownEntry } from '@/lib/pass-probability'

export interface AnalyticsDomain {
  domainId: string
  number: number
  name: string
  slug: string
  weightPercent: number
}

export interface AnalyticsProbabilityPoint {
  computedAt: string
  probability: number
  predictedScore: number | null
  confidence: number
  sampleSize: number
}

export interface AnalyticsSnapshotPoint {
  snapshotDate: string
  domainId: string | null
  masteryScore: number
  accuracy: number
  questionsSeen: number
}

export interface AnalyticsExam {
  examId: string
  code: string
  name: string
  passingScore: number
  latest: (AnalyticsProbabilityPoint & { domainBreakdown: DomainBreakdownEntry[] }) | null
  history: AnalyticsProbabilityPoint[]
  domains: AnalyticsDomain[]
  snapshots: AnalyticsSnapshotPoint[]
}

export interface AnalyticsResponse {
  exams: AnalyticsExam[]
}

function parseBreakdown(json: string): DomainBreakdownEntry[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ exams: [] } satisfies AnalyticsResponse, { status: 401 })

  try {
    const [examRows, domainRows, probRows, snapshotRows] = await Promise.all([
      db.select({
        id: exams.id,
        code: exams.code,
        name: exams.name,
        passingScore: exams.passingScore,
      }).from(exams).orderBy(asc(exams.code)),

      db.select({
        id: domains.id,
        examId: domains.examId,
        number: domains.number,
        name: domains.name,
        slug: domains.slug,
        weightPercent: domains.weightPercent,
      }).from(domains).orderBy(asc(domains.orderIndex)),

      db.select({
        examId: passProbability.examId,
        computedAt: passProbability.computedAt,
        probability: passProbability.probability,
        predictedScore: passProbability.predictedScore,
        confidence: passProbability.confidence,
        sampleSize: passProbability.sampleSize,
        domainBreakdown: passProbability.domainBreakdown,
      }).from(passProbability)
        .where(eq(passProbability.userId, userId))
        .orderBy(asc(passProbability.computedAt)),

      db.select({
        examId: masterySnapshots.examId,
        snapshotDate: masterySnapshots.snapshotDate,
        domainId: masterySnapshots.domainId,
        masteryScore: masterySnapshots.masteryScore,
        accuracy: masterySnapshots.accuracy,
        questionsSeen: masterySnapshots.questionsSeen,
      }).from(masterySnapshots)
        .where(eq(masterySnapshots.userId, userId))
        .orderBy(asc(masterySnapshots.snapshotDate)),
    ])

    const result: AnalyticsExam[] = examRows.map((exam) => {
      const examProbs = probRows.filter((p) => p.examId === exam.id)
      const history: AnalyticsProbabilityPoint[] = examProbs.map((p) => ({
        computedAt: p.computedAt,
        probability: p.probability,
        predictedScore: p.predictedScore,
        confidence: p.confidence,
        sampleSize: p.sampleSize,
      }))
      const latestRow = examProbs[examProbs.length - 1] ?? null

      return {
        examId: exam.id,
        code: exam.code,
        name: exam.name,
        passingScore: exam.passingScore,
        latest: latestRow
          ? {
              computedAt: latestRow.computedAt,
              probability: latestRow.probability,
              predictedScore: latestRow.predictedScore,
              confidence: latestRow.confidence,
              sampleSize: latestRow.sampleSize,
              domainBreakdown: parseBreakdown(latestRow.domainBreakdown),
            }
          : null,
        history,
        domains: domainRows
          .filter((d) => d.examId === exam.id)
          .map((d) => ({
            domainId: d.id,
            number: d.number,
            name: d.name,
            slug: d.slug,
            weightPercent: d.weightPercent,
          })),
        snapshots: snapshotRows
          .filter((s) => s.examId === exam.id)
          .map((s) => ({
            snapshotDate: s.snapshotDate,
            domainId: s.domainId,
            masteryScore: s.masteryScore,
            accuracy: s.accuracy,
            questionsSeen: s.questionsSeen,
          })),
      }
    })

    return NextResponse.json({ exams: result } satisfies AnalyticsResponse)
  } catch (err) {
    console.error('[/api/analytics]', err)
    return NextResponse.json({ exams: [] } satisfies AnalyticsResponse)
  }
}
