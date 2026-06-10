/**
 * Exam-date pacing: project when the learner's predicted score crosses the
 * passing bar, from the trend of their pass-probability history.
 *
 * A least-squares line over (day, predictedScore) gives points/day velocity;
 * extrapolating to the passing score yields a projected pass-ready date to
 * compare against the user's target exam date. With fewer than two distinct
 * days of data there is no trend — the UI shows "keep practicing" instead.
 */

export interface ScorePoint {
  date: string // ISO timestamp or YYYY-MM-DD
  score: number // predicted scaled score (100–900)
}

export interface PacingInput {
  history: ScorePoint[]
  passingScore: number
  examDate: string | null // YYYY-MM-DD
  now?: string
}

export interface PacingResult {
  currentScore: number | null
  pointsPerDay: number | null
  projectedReadyDate: string | null // YYYY-MM-DD
  daysUntilExam: number | null
  onTrack: boolean | null // null = not enough signal to say
}

const DAY_MS = 86_400_000

function toDay(date: string): number {
  return new Date(date).getTime() / DAY_MS
}

export function computePacing({ history, passingScore, examDate, now }: PacingInput): PacingResult {
  const nowMs = now ? new Date(now).getTime() : Date.now()
  const daysUntilExam = examDate ? Math.ceil((new Date(examDate).getTime() - nowMs) / DAY_MS) : null

  if (history.length === 0) {
    return { currentScore: null, pointsPerDay: null, projectedReadyDate: null, daysUntilExam, onTrack: null }
  }

  const sorted = [...history].sort((a, b) => toDay(a.date) - toDay(b.date))
  const currentScore = sorted[sorted.length - 1].score

  // Already over the bar: ready now, regardless of slope.
  if (currentScore >= passingScore) {
    return {
      currentScore,
      pointsPerDay: null,
      projectedReadyDate: new Date(nowMs).toISOString().slice(0, 10),
      daysUntilExam,
      onTrack: daysUntilExam === null ? true : daysUntilExam >= 0,
    }
  }

  const xs = sorted.map((p) => toDay(p.date))
  const span = xs[xs.length - 1] - xs[0]
  if (sorted.length < 2 || span <= 0) {
    return { currentScore, pointsPerDay: null, projectedReadyDate: null, daysUntilExam, onTrack: null }
  }

  // Least-squares slope/intercept over (day, score).
  const n = sorted.length
  const meanX = xs.reduce((s, x) => s + x, 0) / n
  const meanY = sorted.reduce((s, p) => s + p.score, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (sorted[i].score - meanY)
    den += (xs[i] - meanX) ** 2
  }
  const slope = num / den
  const pointsPerDay = Math.round(slope * 10) / 10

  if (slope <= 0) {
    return { currentScore, pointsPerDay, projectedReadyDate: null, daysUntilExam, onTrack: examDate ? false : null }
  }

  const intercept = meanY - slope * meanX
  const crossingDay = (passingScore - intercept) / slope
  const projectedReadyDate = new Date(crossingDay * DAY_MS).toISOString().slice(0, 10)

  const onTrack = examDate ? crossingDay * DAY_MS <= new Date(examDate).getTime() : null

  return { currentScore, pointsPerDay, projectedReadyDate, daysUntilExam, onTrack }
}
