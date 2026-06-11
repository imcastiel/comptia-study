import { NextResponse } from 'next/server'
import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/db'
import { questionDistractors, questions, topics } from '@/db/schema'
import { getUserCode } from '@/lib/auth'

export interface Confusion {
  questionId: string
  stem: string
  topicTitle: string
  wrongChoice: string
  correctChoice: string
  timesChosen: number
}

const LIMIT = 6

/**
 * The user's habitual traps: wrong choices picked 2+ times, with the right
 * answer alongside. This is the distractor table speaking to the learner
 * instead of only to admin analytics.
 */
export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      questionId: questionDistractors.questionId,
      choiceId: questionDistractors.choiceId,
      timesChosen: questionDistractors.timesChosen,
      stem: questions.stem,
      choices: questions.choices,
      topicTitle: topics.title,
    })
    .from(questionDistractors)
    .innerJoin(questions, eq(questionDistractors.questionId, questions.id))
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(and(eq(questionDistractors.userId, userId), gte(questionDistractors.timesChosen, 2)))
    .orderBy(desc(questionDistractors.timesChosen))
    .limit(LIMIT)

  const confusions: Confusion[] = []
  for (const row of rows) {
    let parsed: Array<{ id: string; text: string; isCorrect?: boolean }>
    try { parsed = JSON.parse(row.choices) } catch { continue }
    const wrong = parsed.find((c) => c.id === row.choiceId)
    const correct = parsed.find((c) => c.isCorrect)
    if (!wrong || !correct) continue
    confusions.push({
      questionId: row.questionId,
      stem: row.stem,
      topicTitle: row.topicTitle,
      wrongChoice: wrong.text,
      correctChoice: correct.text,
      timesChosen: row.timesChosen,
    })
  }

  return NextResponse.json({ confusions })
}
