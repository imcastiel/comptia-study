import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcardReviews, flashcardReviewLog } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { calculateSM2 } from '@/lib/sm2'
import { randomUUID } from 'crypto'
import { getUserCode } from '@/lib/auth'

type CardType = 'flashcard' | 'drill'

export async function POST(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      flashcardId?: string
      drillFactId?: string
      quality: 0 | 1 | 2 | 3 | 4 | 5
    }
    const { flashcardId, drillFactId, quality } = body
    if (quality === undefined || (!flashcardId && !drillFactId)) {
      return NextResponse.json({ error: 'Missing card id or quality' }, { status: 400 })
    }
    const cardType: CardType = drillFactId ? 'drill' : 'flashcard'
    const idCol = cardType === 'drill' ? flashcardReviews.drillFactId : flashcardReviews.flashcardId
    const idVal = cardType === 'drill' ? drillFactId! : flashcardId!

    const [existing] = await db.select().from(flashcardReviews)
      .where(and(
        eq(flashcardReviews.userId, userId),
        eq(flashcardReviews.cardType, cardType),
        eq(idCol, idVal),
      ))

    const sm2 = calculateSM2({
      quality,
      easeFactor: existing?.easeFactor ?? 2.5,
      intervalDays: existing?.intervalDays ?? 0,
      repetitions: existing?.repetitions ?? 0,
    })
    const now = new Date().toISOString()

    if (existing) {
      await db.update(flashcardReviews).set({
        easeFactor: sm2.easeFactor,
        intervalDays: sm2.intervalDays,
        repetitions: sm2.repetitions,
        quality,
        nextReviewAt: sm2.nextReviewAt,
        reviewedAt: now,
      }).where(eq(flashcardReviews.id, existing.id))
    } else {
      await db.insert(flashcardReviews).values({
        id: randomUUID(),
        userId,
        cardType,
        flashcardId: cardType === 'flashcard' ? flashcardId : null,
        drillFactId: cardType === 'drill' ? drillFactId : null,
        easeFactor: sm2.easeFactor,
        intervalDays: sm2.intervalDays,
        repetitions: sm2.repetitions,
        quality,
        nextReviewAt: sm2.nextReviewAt,
        reviewedAt: now,
      })
    }

    await db.insert(flashcardReviewLog).values({
      id: randomUUID(),
      userId,
      cardType,
      flashcardId: cardType === 'flashcard' ? flashcardId : null,
      drillFactId: cardType === 'drill' ? drillFactId : null,
      quality,
      easeFactor: sm2.easeFactor,
      intervalDays: sm2.intervalDays,
      reviewedAt: now,
    })

    return NextResponse.json({ success: true, nextReviewAt: sm2.nextReviewAt, intervalDays: sm2.intervalDays })
  } catch {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
