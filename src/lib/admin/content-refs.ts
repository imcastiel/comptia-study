import { db } from '@/db'
import {
  questionAttempts, questionDistractors, flashcardReviews, flashcardReviewLog,
} from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { ContentType } from './content-types'

// Returns true if the item is referenced by user activity and therefore must be
// unpublished rather than hard-deleted (would violate a foreign key).
export async function isReferenced(type: ContentType, id: string): Promise<boolean> {
  if (type === 'questions') {
    const [a] = await db.select({ n: sql<number>`count(*)` }).from(questionAttempts).where(eq(questionAttempts.questionId, id))
    if (Number(a.n) > 0) return true
    const [d] = await db.select({ n: sql<number>`count(*)` }).from(questionDistractors).where(eq(questionDistractors.questionId, id))
    return Number(d.n) > 0
  }
  const [r] = await db.select({ n: sql<number>`count(*)` }).from(flashcardReviews).where(eq(flashcardReviews.flashcardId, id))
  if (Number(r.n) > 0) return true
  const [l] = await db.select({ n: sql<number>`count(*)` }).from(flashcardReviewLog).where(eq(flashcardReviewLog.flashcardId, id))
  return Number(l.n) > 0
}
