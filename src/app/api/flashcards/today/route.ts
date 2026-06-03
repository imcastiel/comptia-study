import { NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcards, flashcardReviews, flashcardReviewLog, flashcardSettings } from '@/db/schema'
import { and, eq, lte, count } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import { computeStreak } from '@/lib/flashcard-stats'

export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  const [settings] = await db.select().from(flashcardSettings).where(eq(flashcardSettings.userId, userId))
  const dailyGoal = settings?.dailyGoal ?? 20

  // Due across both card types (any review row past its nextReviewAt)
  const [{ due }] = await db.select({ due: count(flashcardReviews.id) }).from(flashcardReviews)
    .where(and(eq(flashcardReviews.userId, userId), lte(flashcardReviews.nextReviewAt, now)))

  // New concept cards = published flashcards with no review row for this user.
  const [{ totalCards }] = await db.select({ totalCards: count(flashcards.id) }).from(flashcards).where(eq(flashcards.published, true))
  const [{ seen }] = await db.select({ seen: count(flashcardReviews.id) }).from(flashcardReviews)
    .where(and(eq(flashcardReviews.userId, userId), eq(flashcardReviews.cardType, 'flashcard')))
  const newCount = Math.max(0, Number(totalCards) - Number(seen))

  // Reviews today (for the ring) + per-day counts for streak.
  const logRows = await db.select({ reviewedAt: flashcardReviewLog.reviewedAt }).from(flashcardReviewLog)
    .where(eq(flashcardReviewLog.userId, userId))
  const countsByDate: Record<string, number> = {}
  for (const r of logRows) {
    const d = r.reviewedAt.slice(0, 10)
    countsByDate[d] = (countsByDate[d] ?? 0) + 1
  }
  const doneToday = countsByDate[today] ?? 0
  const streak = computeStreak(countsByDate, dailyGoal, today)

  return NextResponse.json({
    dueCount: Number(due),
    newCount,
    doneToday,
    dailyGoal,
    streak,
  })
}
