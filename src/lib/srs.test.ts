import { describe, it, expect } from 'vitest'
import { qualityFromOutcome, type ReviewOutcome } from './srs'

describe('qualityFromOutcome', () => {
  it('maps got_it to SM-2 quality 4', () => {
    expect(qualityFromOutcome('got_it')).toBe(4)
  })
  it('maps miss to SM-2 quality 1', () => {
    expect(qualityFromOutcome('miss')).toBe(1)
  })
  it('type accepts only the two outcomes', () => {
    const outcomes: ReviewOutcome[] = ['got_it', 'miss']
    expect(outcomes.map(qualityFromOutcome)).toEqual([4, 1])
  })
})
