const MAX_SCORE = 900
const PRIOR_WEIGHT = 10
const LOGISTIC_SPREAD = 60
const FULL_CONFIDENCE_AT = 50

export interface DomainInput {
  domainId: string
  weightPercent: number
  questionsSeen: number
  questionsCorrect: number
}

export interface DomainBreakdownEntry {
  domainId: string
  weightPercent: number
  smoothedAccuracy: number
  contribution: number
  questionsSeen: number
}

export interface PassProbabilityResult {
  probability: number
  predictedScore: number
  confidence: number
  domainBreakdown: DomainBreakdownEntry[]
  sampleSize: number
}

/**
 * @param passingScore the exam's real cut score on the 100–900 scale
 *   (e.g. 675 for 220-1201, 700 for 220-1202) — read from the exams table,
 *   never hardcoded, so additional exams work without touching this model.
 */
export function computePassProbability(domains: DomainInput[], passingScore: number): PassProbabilityResult {
  if (domains.length === 0) {
    return { probability: 0, predictedScore: 0, confidence: 0, domainBreakdown: [], sampleSize: 0 }
  }

  const sampleSize = domains.reduce((s, d) => s + d.questionsSeen, 0)

  const breakdown: DomainBreakdownEntry[] = domains.map((d) => {
    const smoothedAccuracy =
      (d.questionsCorrect + PRIOR_WEIGHT * 0.5) / (d.questionsSeen + PRIOR_WEIGHT)
    const contribution = (d.weightPercent / 100) * smoothedAccuracy * MAX_SCORE
    return { domainId: d.domainId, weightPercent: d.weightPercent, smoothedAccuracy, contribution, questionsSeen: d.questionsSeen }
  })

  const predictedScore = breakdown.reduce((s, b) => s + b.contribution, 0)
  const probability = 1 / (1 + Math.exp(-(predictedScore - passingScore) / LOGISTIC_SPREAD))

  const domainsWithData = domains.filter((d) => d.questionsSeen >= 3).length
  const domainCoverage = domainsWithData / domains.length
  const confidence = Math.min(sampleSize / FULL_CONFIDENCE_AT, 1) * domainCoverage

  return {
    probability: Math.round(probability * 1000) / 1000,
    predictedScore: Math.round(predictedScore),
    confidence: Math.round(confidence * 1000) / 1000,
    domainBreakdown: breakdown,
    sampleSize,
  }
}
