import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { examAttempts, questionAttempts, questions as questionsTable, topics, domains } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'

function scoreAnswer(userAnswer: string | string[] | null | undefined, correctAnswerJson: string): boolean {
  if (userAnswer === null || userAnswer === undefined) return false
  const correct = JSON.parse(correctAnswerJson)
  const correctArr: string[] = Array.isArray(correct) ? correct : [String(correct)]
  const userArr: string[] = Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)]
  if (correctArr.length !== userArr.length) return false
  return correctArr.every((id) => userArr.includes(id))
}

export async function POST(req: NextRequest) {
  try {
    const { questions, answers, timeSpent, mode, totalTimeSeconds } = await req.json() as {
      questions: Array<{ id: string }>
      answers: Record<string, string | string[]>
      timeSpent: Record<string, number>
      mode: string
      totalTimeSeconds: number
    }

    const questionIds = questions.map((q) => q.id)
    if (questionIds.length === 0) {
      return NextResponse.json({ error: 'No questions submitted' }, { status: 400 })
    }

    // Fetch correct answers from DB
    const dbQuestions = await db
      .select({ id: questionsTable.id, correctAnswer: questionsTable.correctAnswer, topicId: questionsTable.topicId })
      .from(questionsTable)
      .where(inArray(questionsTable.id, questionIds))

    if (dbQuestions.length === 0) {
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 })
    }

    // Resolve examId from first question's topic → domain
    const [firstTopic] = await db
      .select({ domainId: topics.domainId })
      .from(topics)
      .where(eq(topics.id, dbQuestions[0].topicId))

    const [firstDomain] = await db
      .select({ examId: domains.examId })
      .from(domains)
      .where(eq(domains.id, firstTopic.domainId))

    const examId = firstDomain.examId
    const attemptId = randomUUID()
    const now = new Date().toISOString()
    let correctCount = 0

    const qAttemptRows = dbQuestions.map((dbQ) => {
      const userAnswer = answers[dbQ.id] ?? null
      const isCorrect = scoreAnswer(userAnswer, dbQ.correctAnswer)
      if (isCorrect) correctCount++

      return {
        id: randomUUID(),
        examAttemptId: attemptId,
        questionId: dbQ.id,
        selectedAnswer: JSON.stringify(userAnswer),
        isCorrect,
        timeSpentSeconds: timeSpent[dbQ.id] ?? null,
        isFlagged: false,
      }
    })

    const scorePercent = (correctCount / dbQuestions.length) * 100

    await db.insert(examAttempts).values({
      id: attemptId,
      examId,
      startedAt: now,
      completedAt: now,
      scorePercent,
      totalQuestions: dbQuestions.length,
      correctCount,
      timeSpentSeconds: totalTimeSeconds,
      isTimed: mode !== 'study',
      isCompleted: true,
    })

    await db.insert(questionAttempts).values(qAttemptRows)

    return NextResponse.json({ attemptId })
  } catch (err) {
    console.error('Submit failed:', err)
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 })
  }
}
