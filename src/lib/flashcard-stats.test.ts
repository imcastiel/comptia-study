import { describe, it, expect } from 'vitest'
import { masteryPercent, computeStreak, MATURE_INTERVAL_DAYS } from './flashcard-stats'

describe('masteryPercent', () => {
  it('returns 0 when there are no cards', () => {
    expect(masteryPercent([], 10)).toBe(0)
  })
  it('counts cards at or above the mature threshold', () => {
    const intervals = [0, 5, MATURE_INTERVAL_DAYS, MATURE_INTERVAL_DAYS + 10]
    expect(masteryPercent(intervals, 4)).toBe(50)
  })
  it('uses totalCards as the denominator (unseen cards count against mastery)', () => {
    const intervals = [MATURE_INTERVAL_DAYS]
    expect(masteryPercent(intervals, 4)).toBe(25)
  })
})

describe('computeStreak', () => {
  const goal = 2
  it('returns 0 with no activity', () => {
    expect(computeStreak({}, goal, '2026-06-02')).toBe(0)
  })
  it('counts consecutive days meeting the goal ending today', () => {
    const counts = { '2026-06-02': 3, '2026-06-01': 2, '2026-05-31': 5 }
    expect(computeStreak(counts, goal, '2026-06-02')).toBe(3)
  })
  it('still counts when today has no activity yet but yesterday met goal', () => {
    const counts = { '2026-06-01': 2, '2026-05-31': 2 }
    expect(computeStreak(counts, goal, '2026-06-02')).toBe(2)
  })
  it('breaks the streak on a day below goal', () => {
    const counts = { '2026-06-02': 2, '2026-06-01': 1, '2026-05-31': 2 }
    expect(computeStreak(counts, goal, '2026-06-02')).toBe(1)
  })
})
