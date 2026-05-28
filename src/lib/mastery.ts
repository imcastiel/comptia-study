const EWMA_ALPHA = 0.3

export interface MasteryUpdate {
  existing: {
    questionsSeen: number
    questionsCorrect: number
    ewmaAccuracy: number
    currentStreak: number
    totalTimeSeconds: number
  } | null
  isCorrect: boolean
  timeSpentSeconds: number | null
  now: string
}

export interface MasteryState {
  questionsSeen: number
  questionsCorrect: number
  ewmaAccuracy: number
  currentStreak: number
  totalTimeSeconds: number
  avgTimeSeconds: number | null
  masteryScore: number
  lastSeenAt: string
  lastCorrectAt: string | null
  updatedAt: string
}

export function computeMasteryUpdate(input: MasteryUpdate): MasteryState {
  const { existing, isCorrect, timeSpentSeconds, now } = input

  const prev = existing ?? {
    questionsSeen: 0,
    questionsCorrect: 0,
    ewmaAccuracy: 0,
    currentStreak: 0,
    totalTimeSeconds: 0,
  }

  const questionsSeen = prev.questionsSeen + 1
  const questionsCorrect = prev.questionsCorrect + (isCorrect ? 1 : 0)
  const observation = isCorrect ? 1 : 0

  const ewmaAccuracy = prev.questionsSeen === 0
    ? observation
    : EWMA_ALPHA * observation + (1 - EWMA_ALPHA) * prev.ewmaAccuracy

  let currentStreak: number
  if (isCorrect) {
    currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1
  } else {
    currentStreak = prev.currentStreak <= 0 ? prev.currentStreak - 1 : -1
  }

  const totalTimeSeconds = prev.totalTimeSeconds + (timeSpentSeconds ?? 0)
  const avgTimeSeconds = totalTimeSeconds / questionsSeen

  const masteryScore = blendMasteryScore({
    ewmaAccuracy,
    cumulativeAccuracy: questionsCorrect / questionsSeen,
    currentStreak,
  })

  return {
    questionsSeen,
    questionsCorrect,
    ewmaAccuracy,
    currentStreak,
    totalTimeSeconds,
    avgTimeSeconds,
    masteryScore,
    lastSeenAt: now,
    lastCorrectAt: isCorrect ? now : null,
    updatedAt: now,
  }
}

function blendMasteryScore({
  ewmaAccuracy,
  cumulativeAccuracy,
  currentStreak,
}: {
  ewmaAccuracy: number
  cumulativeAccuracy: number
  currentStreak: number
}): number {
  const streakFactor = currentStreak > 0 ? Math.min(currentStreak / 5, 1) : 0
  return Math.round(
    (ewmaAccuracy * 0.5 + cumulativeAccuracy * 0.35 + streakFactor * 0.15) * 100
  )
}
