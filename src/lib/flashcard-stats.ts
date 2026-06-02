/** Interval (days) at which a card is considered "mature"/mastered. */
export const MATURE_INTERVAL_DAYS = 21

/**
 * Percent of a deck/set considered mastered.
 * @param matureIntervals interval-days for cards that have at least one review
 * @param totalCards total cards in the deck/set (unseen cards count against mastery)
 */
export function masteryPercent(matureIntervals: number[], totalCards: number): number {
  if (totalCards <= 0) return 0
  const mature = matureIntervals.filter((d) => d >= MATURE_INTERVAL_DAYS).length
  return Math.round((mature / totalCards) * 100)
}

/**
 * Consecutive-day streak ending at (or one day before) `todayIso`.
 * A day counts if its review count >= goal. Today is allowed to be empty
 * (streak continues from yesterday) so the streak doesn't visually "break"
 * until a full goal-missing day has passed.
 * @param countsByDate map of 'YYYY-MM-DD' -> reviews that day
 * @param goal daily goal
 * @param todayIso 'YYYY-MM-DD'
 */
export function computeStreak(
  countsByDate: Record<string, number>,
  goal: number,
  todayIso: string,
): number {
  const dayMs = 24 * 60 * 60 * 1000
  let streak = 0
  let cursor = new Date(todayIso + 'T00:00:00.000Z')

  // Allow today to be empty: if today is below goal, start counting from yesterday.
  const todayKey = toKey(cursor)
  if ((countsByDate[todayKey] ?? 0) < goal) {
    cursor = new Date(cursor.getTime() - dayMs)
  }

  while ((countsByDate[toKey(cursor)] ?? 0) >= goal) {
    streak++
    cursor = new Date(cursor.getTime() - dayMs)
  }
  return streak
}

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}
