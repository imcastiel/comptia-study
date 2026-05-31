import { describe, it, expect } from 'vitest'
import { scoreSuspect } from '@/lib/admin/analytics/suspect'

describe('scoreSuspect', () => {
  it('does not flag with too few attempts', () => {
    const r = scoreSuspect({ totalAttempts: 3, correctCount: 1, wrongChoiceCounts: { c: 2 }, wrongUserAvgMastery: 80 })
    expect(r.suspect).toBe(false)
  })
  it('does not flag a hard-but-fair question (wrong answers scattered, weak users miss it)', () => {
    const r = scoreSuspect({ totalAttempts: 40, correctCount: 14, wrongChoiceCounts: { a: 9, c: 9, d: 8 }, wrongUserAvgMastery: 35 })
    expect(r.suspect).toBe(false)
  })
  it('flags concentrated distractor (likely wrong key)', () => {
    const r = scoreSuspect({ totalAttempts: 40, correctCount: 12, wrongChoiceCounts: { c: 26, a: 2 }, wrongUserAvgMastery: 50 })
    expect(r.suspect).toBe(true)
    expect(r.reasons.join(' ')).toMatch(/concentrat/i)
  })
  it('flags poor discrimination (strong users also miss it)', () => {
    const r = scoreSuspect({ totalAttempts: 30, correctCount: 10, wrongChoiceCounts: { a: 7, b: 7, d: 6 }, wrongUserAvgMastery: 78 })
    expect(r.suspect).toBe(true)
    expect(r.reasons.join(' ')).toMatch(/strong users/i)
  })
})
