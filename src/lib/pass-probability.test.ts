import { describe, it, expect } from 'vitest'
import { computePassProbability, type DomainInput } from './pass-probability'

const CORE1_PASS = 675
const CORE2_PASS = 700

function uniformDomains(accuracy: number, seenPerDomain: number): DomainInput[] {
  // Five domains matching Core 1's shape (weights sum to 100).
  const weights = [13, 23, 25, 11, 28]
  return weights.map((w, i) => ({
    domainId: `d${i + 1}`,
    weightPercent: w,
    questionsSeen: seenPerDomain,
    questionsCorrect: Math.round(seenPerDomain * accuracy),
  }))
}

describe('computePassProbability', () => {
  it('returns zeros for no domains', () => {
    const r = computePassProbability([], CORE1_PASS)
    expect(r.probability).toBe(0)
    expect(r.predictedScore).toBe(0)
    expect(r.confidence).toBe(0)
    expect(r.sampleSize).toBe(0)
  })

  it('uses the supplied passing score as the logistic midpoint', () => {
    const domains = uniformDomains(0.8, 100)
    const easier = computePassProbability(domains, CORE1_PASS)
    const harder = computePassProbability(domains, CORE2_PASS)
    expect(easier.predictedScore).toBe(harder.predictedScore)
    expect(easier.probability).toBeGreaterThan(harder.probability)
  })

  it('a strong learner clears the Core 1 bar', () => {
    const r = computePassProbability(uniformDomains(0.9, 100), CORE1_PASS)
    expect(r.predictedScore).toBeGreaterThan(CORE1_PASS)
    expect(r.probability).toBeGreaterThan(0.8)
  })

  it('a weak learner does not', () => {
    const r = computePassProbability(uniformDomains(0.4, 100), CORE1_PASS)
    expect(r.predictedScore).toBeLessThan(CORE1_PASS)
    expect(r.probability).toBeLessThan(0.2)
  })

  it('thin data is pulled toward the 50% prior, limiting overconfidence', () => {
    const thin = computePassProbability(uniformDomains(1, 2), CORE1_PASS)
    const deep = computePassProbability(uniformDomains(1, 100), CORE1_PASS)
    expect(thin.predictedScore).toBeLessThan(deep.predictedScore)
  })

  it('confidence reaches 1 only with volume across all domains', () => {
    const r = computePassProbability(uniformDomains(0.8, 20), CORE1_PASS)
    expect(r.confidence).toBe(1)
    const partial = computePassProbability(
      [...uniformDomains(0.8, 20).slice(0, 2), ...uniformDomains(0.8, 0).slice(2)],
      CORE1_PASS,
    )
    expect(partial.confidence).toBeLessThan(1)
  })
})
