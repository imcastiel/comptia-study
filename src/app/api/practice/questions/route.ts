import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, topics } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const count = Math.min(parseInt(req.nextUrl.searchParams.get('count') ?? '20'), 90)

  try {
    const rows = await db
      .select({
        id: questions.id,
        type: questions.type,
        stem: questions.stem,
        choices: questions.choices,
        objectiveId: topics.objectiveId,
        topicTitle: topics.title,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .orderBy(sql`RANDOM()`)
      .limit(count)

    const result = rows.map((q) => ({
      ...q,
      choices: (JSON.parse(q.choices) as Array<{ id: string; text: string; isCorrect?: boolean }>)
        .map(({ id, text }) => ({ id, text })),
    }))

    return NextResponse.json({ questions: result })
  } catch (err) {
    console.error('Failed to load questions:', err)
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
