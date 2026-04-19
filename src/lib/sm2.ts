/**
 * SM-2 Spaced Repetition Algorithm
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

export interface SM2Input {
  quality: 0 | 1 | 2 | 3 | 4 | 5  // 0-2 = fail, 3-5 = pass
  easeFactor: number                 // default 2.5
  intervalDays: number               // days until next review
  repetitions: number                // number of successful reviews
}

export interface SM2Result {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: string               // ISO date string
}

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easeFactor, intervalDays, repetitions } = input

  let newInterval: number
  let newRepetitions: number
  let newEaseFactor: number

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(intervalDays * easeFactor)
    }
    newRepetitions = repetitions + 1
  } else {
    // Incorrect response — reset
    newInterval = 1
    newRepetitions = 0
  }

  // Update ease factor (only on correct responses, min 1.3)
  newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)
  nextReviewAt.setHours(0, 0, 0, 0)

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    nextReviewAt: nextReviewAt.toISOString(),
  }
}

/** Map UI button labels to SM-2 quality scores */
export const QUALITY_MAP = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
} as const

export type QualityLabel = keyof typeof QUALITY_MAP
