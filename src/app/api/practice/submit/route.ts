import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import {
  examAttempts, questionAttempts, questions as questionsTable,
  topics, domains, topicMastery, questionDistractors, passProbability,
} from '@/db/schema'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getUserCode } from '@/lib/auth'
import { computePassProbability } from '@/lib/pass-probability'

function scoreAnswer(userAnswer: string | string[] | null | undefined, correctAnswerJson: string): boolean {
  if (userAnswer === null || userAnswer === undefined) return false
  const correct = JSON.parse(correctAnswerJson)
  const correctArr: string[] = Array.isArray(correct) ? correct : [String(correct)]
  const userArr: string[] = Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)]
  if (correctArr.length !== userArr.length) return false
  return correctArr.every((id) => userArr.includes(id))
}

function blendMastery(seen: number, correct: number, ewma: number, streak: number): number {
  const streakFactor = streak > 0 ? Math.min(streak / 5, 1) : 0
  return Math.round((ewma * 0.5 + (correct / seen) * 0.35 + streakFactor * 0.15) * 100)
}

const EWMA_ALPHA = 0.3

export async function POST(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { questions, answers, timeSpent, flagged, mode, totalTimeSeconds } = await req.json() as {
      questions: Array<{ id: string }>
      answers: Record<string, string | string[]>
      timeSpent: Record<string, number>
      flagged: string[]
      mode: string
      totalTimeSeconds: number
    }

    const flaggedSet = new Set(flagged ?? [])
    const questionIds = questions.map((q) => q.id)
    if (questionIds.length === 0) return NextResponse.json({ error: 'No questions submitted' }, { status: 400 })

    const dbQuestions = await db
      .select({ id: questionsTable.id, correctAnswer: questionsTable.correctAnswer, topicId: questionsTable.topicId })
      .from(questionsTable)
      .where(inArray(questionsTable.id, questionIds))

    if (dbQuestions.length === 0) return NextResponse.json({ error: 'Questions not found' }, { status: 404 })

    const topicIds = [...new Set(dbQuestions.map((q) => q.topicId))]
    const topicRows = await db
      .select({ id: topics.id, domainId: topics.domainId })
      .from(topics)
      .where(inArray(topics.id, topicIds))

    const topicToDomain = Object.fromEntries(topicRows.map((t) => [t.id, t.domainId]))

    const domainIds = [...new Set(topicRows.map((t) => t.domainId))]
    const domainRows = await db
      .select({ id: domains.id, examId: domains.examId, weightPercent: domains.weightPercent })
      .from(domains)
      .where(inArray(domains.id, domainIds))

    const domainToExam = Object.fromEntries(domainRows.map((d) => [d.id, d.examId]))
    const examId = domainToExam[topicToDomain[dbQuestions[0].topicId]]

    const attemptId = randomUUID()
    const now = new Date().toISOString()
    let correctCount = 0

    const qAttemptRows = dbQuestions.map((dbQ) => {
      const userAnswer = answers[dbQ.id] ?? null
      const isCorrect = scoreAnswer(userAnswer, dbQ.correctAnswer)
      if (isCorrect) correctCount++
      return {
        id: randomUUID(),
        userId,
        examAttemptId: attemptId,
        questionId: dbQ.id,
        topicId: dbQ.topicId,
        domainId: topicToDomain[dbQ.topicId] ?? '',
        selectedAnswer: JSON.stringify(userAnswer),
        isCorrect,
        timeSpentSeconds: timeSpent[dbQ.id] ?? null,
        isFlagged: flaggedSet.has(dbQ.id),
      }
    })

    const scorePercent = (correctCount / dbQuestions.length) * 100

    await db.insert(examAttempts).values({
      id: attemptId,
      userId,
      examId,
      startedAt: now,
      completedAt: now,
      scorePercent,
      scaledScore: Math.round(scorePercent / 100 * 900),
      totalQuestions: dbQuestions.length,
      correctCount,
      timeSpentSeconds: totalTimeSeconds,
      isTimed: mode !== 'study',
      isCompleted: true,
    })

    await db.insert(questionAttempts).values(qAttemptRows)

    // ── Upsert topic_mastery per topic ────────────────────────────────────────
    const topicGroups = new Map<string, Array<{ isCorrect: boolean; timeSecs: number | null }>>()
    for (const row of qAttemptRows) {
      const g = topicGroups.get(row.topicId) ?? []
      g.push({ isCorrect: row.isCorrect, timeSecs: row.timeSpentSeconds })
      topicGroups.set(row.topicId, g)
    }

    const existingMastery = await db
      .select()
      .from(topicMastery)
      .where(eq(topicMastery.userId, userId))

    const masteryByTopic = Object.fromEntries(existingMastery.map((m) => [m.topicId, m]))

    for (const [topicId, attempts] of topicGroups) {
      const ex = masteryByTopic[topicId]
      let seen = ex?.questionsSeen ?? 0
      let correct = ex?.questionsCorrect ?? 0
      let ewma = ex?.ewmaAccuracy ?? 0
      let streak = ex?.currentStreak ?? 0
      let totalTime = ex?.totalTimeSeconds ?? 0

      for (const a of attempts) {
        seen++
        if (a.isCorrect) correct++
        const obs = a.isCorrect ? 1 : 0
        ewma = seen === 1 ? obs : EWMA_ALPHA * obs + (1 - EWMA_ALPHA) * ewma
        streak = a.isCorrect
          ? (streak >= 0 ? streak + 1 : 1)
          : (streak <= 0 ? streak - 1 : -1)
        totalTime += a.timeSecs ?? 0
      }

      await db.insert(topicMastery).values({
        id: ex?.id ?? randomUUID(),
        userId,
        topicId,
        questionsSeen: seen,
        questionsCorrect: correct,
        ewmaAccuracy: ewma,
        currentStreak: streak,
        totalTimeSeconds: totalTime,
        avgTimeSeconds: totalTime / seen,
        masteryScore: blendMastery(seen, correct, ewma, streak),
        lastSeenAt: now,
        lastCorrectAt: correct > (ex?.questionsCorrect ?? 0) ? now : ex?.lastCorrectAt ?? null,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [topicMastery.userId, topicMastery.topicId],
        set: {
          questionsSeen: seen,
          questionsCorrect: correct,
          ewmaAccuracy: ewma,
          currentStreak: streak,
          totalTimeSeconds: totalTime,
          avgTimeSeconds: totalTime / seen,
          masteryScore: blendMastery(seen, correct, ewma, streak),
          lastSeenAt: now,
          updatedAt: now,
        },
      })
    }

    // ── Upsert question_distractors for wrong answers ─────────────────────────
    for (const row of qAttemptRows.filter((r) => !r.isCorrect)) {
      const chosen: string[] = (() => {
        try { const v = JSON.parse(row.selectedAnswer); return Array.isArray(v) ? v : v ? [String(v)] : [] }
        catch { return [] }
      })()
      for (const choiceId of chosen) {
        await db.insert(questionDistractors).values({
          id: randomUUID(), userId, questionId: row.questionId, choiceId, timesChosen: 1, lastChosenAt: now,
        }).onConflictDoUpdate({
          target: [questionDistractors.userId, questionDistractors.questionId, questionDistractors.choiceId],
          set: { timesChosen: sql`${questionDistractors.timesChosen} + 1`, lastChosenAt: now },
        })
      }
    }

    // ── Compute and persist pass probability ──────────────────────────────────
    const domainMastery = await db
      .select({
        domainId: domains.id,
        weightPercent: domains.weightPercent,
        seen: sql<number>`sum(${topicMastery.questionsSeen})`,
        correct: sql<number>`sum(${topicMastery.questionsCorrect})`,
      })
      .from(topicMastery)
      .innerJoin(topics, eq(topicMastery.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .where(and(eq(topicMastery.userId, userId), eq(domains.examId, examId)))
      .groupBy(domains.id)

    if (domainMastery.length > 0) {
      const prob = computePassProbability(domainMastery.map((d: { domainId: string; weightPercent: number; seen: number; correct: number }) => ({
        domainId: d.domainId,
        weightPercent: d.weightPercent,
        questionsSeen: Number(d.seen),
        questionsCorrect: Number(d.correct),
      })))
      await db.insert(passProbability).values({
        id: randomUUID(), userId, examId,
        probability: prob.probability,
        predictedScore: prob.predictedScore,
        confidence: prob.confidence,
        domainBreakdown: JSON.stringify(prob.domainBreakdown),
        sampleSize: prob.sampleSize,
        computedAt: now,
      })
    }

    return NextResponse.json({ attemptId })
  } catch (err) {
    console.error('Submit failed:', err)
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 })
  }
}
