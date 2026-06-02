import { describe, it, expect } from 'vitest'
import { buildMatchRound, isCorrectPair, scoreRound, type DrillFactLite } from './match-game'

const facts: DrillFactLite[] = [
  { id: 'a', term: 'HTTPS', value: '443' },
  { id: 'b', term: 'SSH', value: '22' },
  { id: 'c', term: 'DNS', value: '53' },
]

describe('buildMatchRound', () => {
  it('produces one term tile and one value tile per fact', () => {
    const round = buildMatchRound(facts, 3, () => 0.5)
    expect(round.terms).toHaveLength(3)
    expect(round.values).toHaveLength(3)
    expect(round.terms.map((t) => t.factId).sort()).toEqual(['a', 'b', 'c'])
  })
  it('caps the round at the requested size', () => {
    const round = buildMatchRound(facts, 2, () => 0.5)
    expect(round.terms).toHaveLength(2)
  })
})

describe('isCorrectPair', () => {
  it('matches a term tile to the value tile of the same fact', () => {
    expect(isCorrectPair({ factId: 'a', kind: 'term', text: 'HTTPS' }, { factId: 'a', kind: 'value', text: '443' })).toBe(true)
  })
  it('rejects two tiles of the same kind', () => {
    expect(isCorrectPair({ factId: 'a', kind: 'term', text: 'HTTPS' }, { factId: 'b', kind: 'term', text: 'SSH' })).toBe(false)
  })
  it('rejects a wrong pairing', () => {
    expect(isCorrectPair({ factId: 'a', kind: 'term', text: 'HTTPS' }, { factId: 'b', kind: 'value', text: '22' })).toBe(false)
  })
})

describe('scoreRound', () => {
  it('rewards speed and penalizes mistakes', () => {
    const fast = scoreRound({ pairs: 6, mistakes: 0, elapsedMs: 10_000 })
    const slow = scoreRound({ pairs: 6, mistakes: 0, elapsedMs: 30_000 })
    const sloppy = scoreRound({ pairs: 6, mistakes: 4, elapsedMs: 10_000 })
    expect(fast).toBeGreaterThan(slow)
    expect(fast).toBeGreaterThan(sloppy)
    expect(slow).toBeGreaterThanOrEqual(0)
  })
})
