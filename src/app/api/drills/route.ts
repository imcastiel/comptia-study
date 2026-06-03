import { NextResponse } from 'next/server'
import { db } from '@/db'
import { drillSets, drillFacts, flashcardReviews } from '@/db/schema'
import { and, eq, count } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import { masteryPercent } from '@/lib/flashcard-stats'

export async function GET() {
  const userId = await getUserCode()
  const sets = await db.select().from(drillSets).where(eq(drillSets.published, true)).orderBy(drillSets.orderIndex)

  const result = await Promise.all(sets.map(async (s) => {
    const [{ total }] = await db.select({ total: count(drillFacts.id) }).from(drillFacts).where(eq(drillFacts.drillSetId, s.id))
    let mastery = 0
    if (userId && Number(total) > 0) {
      const reviews = await db.select({ interval: flashcardReviews.intervalDays })
        .from(flashcardReviews)
        .innerJoin(drillFacts, eq(flashcardReviews.drillFactId, drillFacts.id))
        .where(and(eq(flashcardReviews.userId, userId), eq(drillFacts.drillSetId, s.id), eq(flashcardReviews.cardType, 'drill')))
      mastery = masteryPercent(reviews.map((r) => r.interval), Number(total))
    }
    return { id: s.id, title: s.title, slug: s.slug, icon: s.icon, examCode: s.examCode, description: s.description, factCount: Number(total), mastery }
  }))

  return NextResponse.json({ sets: result })
}
