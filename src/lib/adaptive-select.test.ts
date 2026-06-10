import { describe, it, expect } from 'vitest'
import { selectAdaptive, questionWeight } from './adaptive-select'

const none = new Set<string>()

/** Deterministic LCG so sampling tests are reproducible. */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('questionWeight', () => {
  it('weights weak topics far above strong ones', () => {
    const weak = questionWeight({ id: 'q1', topicId: 'weak' }, { weak: 20, strong: 95 }, none, none)
    const strong = questionWeight({ id: 'q2', topicId: 'strong' }, { weak: 20, strong: 95 }, none, none)
    expect(weak).toBeCloseTo(0.8)
    expect(strong).toBeCloseTo(0.05)
  })

  it('gives unpracticed topics a middle exploration weight', () => {
    expect(questionWeight({ id: 'q', topicId: 'new' }, {}, none, none)).toBeCloseTo(0.6)
  })

  it('penalizes recently seen questions hardest, ever-seen mildly', () => {
    const fresh = questionWeight({ id: 'a', topicId: 't' }, { t: 50 }, none, none)
    const seen = questionWeight({ id: 'a', topicId: 't' }, { t: 50 }, none, new Set(['a']))
    const recent = questionWeight({ id: 'a', topicId: 't' }, { t: 50 }, new Set(['a']), new Set(['a']))
    expect(fresh).toBeGreaterThan(seen)
    expect(seen).toBeGreaterThan(recent)
  })

  it('never zeroes a question out completely', () => {
    const w = questionWeight({ id: 'a', topicId: 't' }, { t: 100 }, new Set(['a']), new Set(['a']))
    expect(w).toBeGreaterThan(0)
  })
})

describe('selectAdaptive', () => {
  it('returns the requested count without duplicates', () => {
    const candidates = Array.from({ length: 50 }, (_, i) => ({ id: `q${i}`, topicId: `t${i % 5}` }))
    const picked = selectAdaptive({
      candidates, masteryByTopic: {}, recentQuestionIds: none, seenQuestionIds: none,
      count: 20, random: seededRandom(42),
    })
    expect(picked).toHaveLength(20)
    expect(new Set(picked).size).toBe(20)
  })

  it('returns everything when the pool is smaller than the request', () => {
    const candidates = [{ id: 'a', topicId: 't' }, { id: 'b', topicId: 't' }]
    const picked = selectAdaptive({
      candidates, masteryByTopic: {}, recentQuestionIds: none, seenQuestionIds: none,
      count: 10, random: seededRandom(1),
    })
    expect(picked.sort()).toEqual(['a', 'b'])
  })

  it('selects mostly weak-topic questions over a large sample', () => {
    // 100 weak-topic + 100 strong-topic questions, pick 30.
    const candidates = [
      ...Array.from({ length: 100 }, (_, i) => ({ id: `w${i}`, topicId: 'weak' })),
      ...Array.from({ length: 100 }, (_, i) => ({ id: `s${i}`, topicId: 'strong' })),
    ]
    const picked = selectAdaptive({
      candidates,
      masteryByTopic: { weak: 15, strong: 95 },
      recentQuestionIds: none,
      seenQuestionIds: none,
      count: 30,
      random: seededRandom(7),
    })
    const weakCount = picked.filter((id) => id.startsWith('w')).length
    // weight ratio is 0.85 : 0.05 (17:1) — expect a heavy weak majority.
    expect(weakCount).toBeGreaterThanOrEqual(24)
  })
})
