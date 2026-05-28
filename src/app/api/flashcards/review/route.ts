import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcardReviews, flashcardReviewLog } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { calculateSM2 } from '@/lib/sm2'
import { randomUUID } from 'crypto'
import { getUserCode } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { flashcardId, quality } = await req.json() as { flashcardId: string; quality: 0 | 1 | 2 | 3 | 4 | 5 }
    if (!flashcardId || quality === undefined) {
      return NextResponse.json({ error: 'Missing flashcardId or quality' }, { status: 400 })
    }

    const [existing] = await db.select().from(flashcardReviews)
      .where(and(eq(flashcardReviews.userId, userId), eq(flashcardReviews.flashcardId, flashcardId)))

    const sm2Result = calculateSM2({
      quality,
      easeFactor: existing?.easeFactor ?? 2.5,
      intervalDays: existing?.intervalDays ?? 0,
      repetitions: existing?.repetitions ?? 0,
    })

    const now = new Date().toISOString()

    if (existing) {
      await db.update(flashcardReviews).set({
        easeFactor: sm2Result.easeFactor,
        intervalDays: sm2Result.intervalDays,
        repetitions: sm2Result.repetitions,
        quality,
        nextReviewAt: sm2Result.nextReviewAt,
        reviewedAt: now,
      }).where(and(eq(flashcardReviews.userId, userId), eq(flashcardReviews.flashcardId, flashcardId)))
    } else {
      await db.insert(flashcardReviews).values({
        id: randomUUID(),
        userId,
        flashcardId,
        easeFactor: sm2Result.easeFactor,
        intervalDays: sm2Result.intervalDays,
        repetitions: sm2Result.repetitions,
        quality,
        nextReviewAt: sm2Result.nextReviewAt,
        reviewedAt: now,
      })
    }

    await db.insert(flashcardReviewLog).values({
      id: randomUUID(),
      userId,
      flashcardId,
      quality,
      easeFactor: sm2Result.easeFactor,
      intervalDays: sm2Result.intervalDays,
      reviewedAt: now,
    })

    return NextResponse.json({ success: true, nextReviewAt: sm2Result.nextReviewAt, intervalDays: sm2Result.intervalDays })
  } catch {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
