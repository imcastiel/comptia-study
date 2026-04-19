import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcards, flashcardReviews, topics, domains } from '@/db/schema'
import { eq, lte, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const domainId = searchParams.get('domainId')
  const mode = searchParams.get('mode')

  try {
    if (mode === 'due') {
      // Due cards: nextReviewAt <= now
      const now = new Date().toISOString()
      const dueReviews = await db.select().from(flashcardReviews)
        .where(lte(flashcardReviews.nextReviewAt, now))

      const cardIds = dueReviews.map((r) => r.flashcardId)
      const cards = cardIds.length > 0
        ? await Promise.all(cardIds.map((id) =>
            db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
              .from(flashcards).where(eq(flashcards.id, id)).then((r) => r[0]).then((c) => c || null)
          )).then((r) => r.filter(Boolean))
        : []

      return NextResponse.json({ cards })
    }

    if (domainId) {
      // All cards for a domain
      const topicList = await db.select({ id: topics.id }).from(topics)
        .where(eq(topics.domainId, domainId))
      const topicIds = topicList.map((t) => t.id)
      if (topicIds.length === 0) return NextResponse.json({ cards: [] })

      const cards = await Promise.all(
        topicIds.map((tid) =>
          db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
            .from(flashcards).where(eq(flashcards.topicId, tid))
        )
      ).then((r) => r.flat())

      return NextResponse.json({ cards })
    }

    // All cards
    const cards = await db.select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
      .from(flashcards)
    return NextResponse.json({ cards })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 })
  }
}
