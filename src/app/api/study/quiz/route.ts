import { NextResponse } from 'next/server'
import { db } from '@/db'
import { questions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topicId')
  if (!topicId) return NextResponse.json({ error: 'topicId required' }, { status: 400 })

  try {
    const rows = await db
      .select({
        id: questions.id,
        stem: questions.stem,
        choices: questions.choices,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
      })
      .from(questions)
      .where(eq(questions.topicId, topicId))
      .limit(40)

    const parsed = rows
      .map((q) => {
        try {
          return { ...q, choices: JSON.parse(q.choices) as Array<{ id: string; text: string; isCorrect: boolean }> }
        } catch {
          return null
        }
      })
      .filter(Boolean) as Array<{
        id: string; stem: string; difficulty: number
        choices: Array<{ id: string; text: string; isCorrect: boolean }>
        explanation: string
      }>

    // Shuffle within each difficulty tier, then sort easy→hard, take 10
    const shuffled = parsed.sort(() => Math.random() - 0.5).sort((a, b) => a.difficulty - b.difficulty).slice(0, 10)

    return NextResponse.json(shuffled)
  } catch (err) {
    console.error('[GET /api/study/quiz]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
