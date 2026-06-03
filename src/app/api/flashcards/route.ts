import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcards, flashcardReviews, topics, drillFacts } from '@/db/schema'
import { eq, lte, and } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'

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
      const now = new Date().toISOString()
      const dueReviews = userId
        ? await db.select().from(flashcardReviews)
            .where(and(eq(flashcardReviews.userId, userId), lte(flashcardReviews.nextReviewAt, now)))
        : []

      const dueFlashcardIds = dueReviews.filter((r) => r.cardType === 'flashcard' && r.flashcardId).map((r) => r.flashcardId!)
      const dueDrillIds = dueReviews.filter((r) => r.cardType === 'drill' && r.drillFactId).map((r) => r.drillFactId!)

      const flashCards = await Promise.all(dueFlashcardIds.map((id) =>
        db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
          .from(flashcards).where(and(eq(flashcards.id, id), eq(flashcards.published, true))).then((r) => r[0] ?? null)
      )).then((r) => r.filter(Boolean).map((c) => ({ ...c!, cardType: 'flashcard' as const })))

      const drillCards = await Promise.all(dueDrillIds.map((id) =>
        db.select({ id: drillFacts.id, front: drillFacts.term, back: drillFacts.value, hint: drillFacts.hint })
          .from(drillFacts).where(eq(drillFacts.id, id)).then((r) => r[0] ?? null)
      )).then((r) => r.filter(Boolean).map((c) => ({ ...c!, cardType: 'drill' as const })))

      return NextResponse.json({ cards: [...flashCards, ...drillCards] })
    }

    if (domainId) {
      const topicList = await db.select({ id: topics.id }).from(topics).where(eq(topics.domainId, domainId))
      const topicIds = topicList.map((t) => t.id)
      if (topicIds.length === 0) return NextResponse.json({ cards: [] })
      const cards = await Promise.all(
        topicIds.map((tid) =>
          db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
            .from(flashcards).where(and(eq(flashcards.topicId, tid), eq(flashcards.published, true)))
        )
      ).then((r) => r.flat().map((c) => ({ ...c, cardType: 'flashcard' as const })))
      return NextResponse.json({ cards })
    }

    const cards = await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
      .from(flashcards).where(eq(flashcards.published, true))
    return NextResponse.json({ cards: cards.map((c) => ({ ...c, cardType: 'flashcard' as const })) })
  } catch {
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 })
  }
}
