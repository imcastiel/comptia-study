import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcards, flashcardReviews, flashcardReviewLog, flashcardSettings, topics, drillFacts } from '@/db/schema'
import { eq, and, inArray, notInArray, count, sql } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import { newCardBudget } from '@/lib/flashcard-queue'

/** Ad-hoc browse sessions (no deck, no due queue) stay a digestible size. */
const ADHOC_SESSION_CAP = 50

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const domainId = searchParams.get('domainId')
  const setId = searchParams.get('setId')
  const direction = searchParams.get('direction') === 'reverse' ? 'reverse' : 'forward'
  const mode = searchParams.get('mode')

  try {
    if (setId) {
      const facts = await db.select().from(drillFacts).where(eq(drillFacts.drillSetId, setId)).orderBy(drillFacts.orderIndex)
      const cards = facts.map((f) => ({
        id: f.id,
        cardType: 'drill' as const,
        front: direction === 'reverse' ? f.value : f.term,
        back: direction === 'reverse' ? f.term : f.value,
        hint: f.hint,
      }))
      return NextResponse.json({ cards })
    }

    if (mode === 'due') {
      const userId = await getUserCode()
      if (!userId) return NextResponse.json({ cards: [] })
      const now = new Date().toISOString()
      const today = now.slice(0, 10)

      const [settings] = await db.select().from(flashcardSettings).where(eq(flashcardSettings.userId, userId))
      const dailyGoal = settings?.dailyGoal ?? 20

      const reviews = await db.select({
        cardType: flashcardReviews.cardType,
        flashcardId: flashcardReviews.flashcardId,
        drillFactId: flashcardReviews.drillFactId,
        nextReviewAt: flashcardReviews.nextReviewAt,
      }).from(flashcardReviews).where(eq(flashcardReviews.userId, userId))

      const seenFlashcardIds = reviews.filter((r) => r.cardType === 'flashcard' && r.flashcardId).map((r) => r.flashcardId!)
      const dueFlashcardIds = reviews.filter((r) => r.cardType === 'flashcard' && r.flashcardId && r.nextReviewAt <= now).map((r) => r.flashcardId!)
      const dueDrillIds = reviews.filter((r) => r.cardType === 'drill' && r.drillFactId && r.nextReviewAt <= now).map((r) => r.drillFactId!)

      const [{ doneToday }] = await db.select({ doneToday: count(flashcardReviewLog.id) }).from(flashcardReviewLog)
        .where(and(eq(flashcardReviewLog.userId, userId), sql`${flashcardReviewLog.reviewedAt} LIKE ${today + '%'}`))

      const dueFlashcards = dueFlashcardIds.length
        ? await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
            .from(flashcards).where(and(inArray(flashcards.id, dueFlashcardIds), eq(flashcards.published, true)))
        : []
      const dueDrills = dueDrillIds.length
        ? await db.select({ id: drillFacts.id, front: drillFacts.term, back: drillFacts.value, hint: drillFacts.hint })
            .from(drillFacts).where(inArray(drillFacts.id, dueDrillIds))
        : []

      // Top up with never-reviewed cards so new users (and every day after a
      // clean queue) still get a session up to their daily goal.
      const budget = newCardBudget({
        dailyGoal,
        dueCount: dueFlashcards.length + dueDrills.length,
        doneToday: Number(doneToday),
      })
      const newCards = budget > 0
        ? await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
            .from(flashcards)
            .where(and(
              eq(flashcards.published, true),
              seenFlashcardIds.length ? notInArray(flashcards.id, seenFlashcardIds) : undefined,
            ))
            .orderBy(sql`RANDOM()`)
            .limit(budget)
        : []

      return NextResponse.json({
        cards: [
          ...dueFlashcards.map((c) => ({ ...c, cardType: 'flashcard' as const })),
          ...dueDrills.map((c) => ({ ...c, cardType: 'drill' as const })),
          ...newCards.map((c) => ({ ...c, cardType: 'flashcard' as const })),
        ],
      })
    }

    if (domainId) {
      const topicList = await db.select({ id: topics.id }).from(topics).where(eq(topics.domainId, domainId))
      const topicIds = topicList.map((t) => t.id)
      if (topicIds.length === 0) return NextResponse.json({ cards: [] })
      const cards = await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
        .from(flashcards)
        .where(and(inArray(flashcards.topicId, topicIds), eq(flashcards.published, true)))
      return NextResponse.json({ cards: cards.map((c) => ({ ...c, cardType: 'flashcard' as const })) })
    }

    const cards = await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
      .from(flashcards).where(eq(flashcards.published, true))
      .orderBy(sql`RANDOM()`)
      .limit(ADHOC_SESSION_CAP)
    return NextResponse.json({ cards: cards.map((c) => ({ ...c, cardType: 'flashcard' as const })) })
  } catch {
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 })
  }
}
