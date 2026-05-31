export interface SuspectStats {
  totalAttempts: number
  correctCount: number
  wrongChoiceCounts: Record<string, number> // choiceId -> times chosen (wrong answers only)
  wrongUserAvgMastery: number | null // avg topic mastery (0-100) of users who got it wrong; null if unknown
}

export interface SuspectResult {
  suspect: boolean
  score: number // 0..1, higher = more suspect
  reasons: string[]
  concentration: number
  correctRate: number
}

const MIN_ATTEMPTS = 8
const CONCENTRATION_THRESHOLD = 0.6 // one distractor takes >=60% of all wrong answers
const STRONG_MASTERY = 65 // wrong answers coming from users this strong is suspicious

export function scoreSuspect(stats: SuspectStats): SuspectResult {
  const totalWrong = Object.values(stats.wrongChoiceCounts).reduce((a, b) => a + b, 0)
  const correctRate = stats.totalAttempts > 0 ? stats.correctCount / stats.totalAttempts : 0
  const maxWrong = totalWrong > 0 ? Math.max(...Object.values(stats.wrongChoiceCounts)) : 0
  const concentration = totalWrong > 0 ? maxWrong / totalWrong : 0

  const reasons: string[] = []
  if (stats.totalAttempts < MIN_ATTEMPTS) {
    return { suspect: false, score: 0, reasons: ['insufficient attempts'], concentration, correctRate }
  }

  let score = 0
  if (correctRate < 0.6 && concentration >= CONCENTRATION_THRESHOLD) {
    score += 0.6
    reasons.push(`wrong answers concentrated (${Math.round(concentration * 100)}% on one choice) — keyed answer may be wrong`)
  }
  if (correctRate < 0.7 && stats.wrongUserAvgMastery !== null && stats.wrongUserAvgMastery >= STRONG_MASTERY) {
    score += 0.5
    reasons.push(`strong users also miss it (avg mastery ${Math.round(stats.wrongUserAvgMastery)}) — likely broken, not hard`)
  }

  return { suspect: score >= 0.5, score: Math.min(score, 1), reasons, concentration, correctRate }
}
