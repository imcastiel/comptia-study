import { describe, it, expect } from 'vitest'
import { computePacing } from './pacing'

const NOW = '2026-06-10T12:00:00.000Z'

describe('computePacing', () => {
  it('returns nulls with no history', () => {
    const r = computePacing({ history: [], passingScore: 675, examDate: '2026-08-01', now: NOW })
    expect(r.currentScore).toBeNull()
    expect(r.onTrack).toBeNull()
    expect(r.daysUntilExam).toBe(52)
  })

  it('reports ready-now when the latest score clears the bar', () => {
    const r = computePacing({
      history: [{ date: '2026-06-01', score: 640 }, { date: '2026-06-09', score: 700 }],
      passingScore: 675,
      examDate: '2026-08-01',
      now: NOW,
    })
    expect(r.currentScore).toBe(700)
    expect(r.projectedReadyDate).toBe('2026-06-10')
    expect(r.onTrack).toBe(true)
  })

  it('projects the crossing date from a rising trend', () => {
    // +10 points/day from 600 on 6/1 → hits 675 around 6/8–6/9.
    const history = Array.from({ length: 6 }, (_, i) => ({
      date: `2026-06-0${i + 1}`,
      score: 600 + i * 10,
    }))
    const r = computePacing({ history, passingScore: 675, examDate: '2026-08-01', now: NOW })
    expect(r.pointsPerDay).toBeCloseTo(10, 1)
    expect(r.projectedReadyDate).toBe('2026-06-08')
    expect(r.onTrack).toBe(true)
  })

  it('flags off-track when the projection lands after the exam', () => {
    // +1 point/day from 600: needs 75 days, exam in 10.
    const history = Array.from({ length: 5 }, (_, i) => ({
      date: `2026-06-0${i + 1}`,
      score: 600 + i,
    }))
    const r = computePacing({ history, passingScore: 675, examDate: '2026-06-20', now: NOW })
    expect(r.onTrack).toBe(false)
    expect(r.projectedReadyDate).not.toBeNull()
  })

  it('declining trend below the bar: off-track with a date, unknowable without', () => {
    const history = [
      { date: '2026-06-01', score: 620 },
      { date: '2026-06-05', score: 600 },
    ]
    const withDate = computePacing({ history, passingScore: 675, examDate: '2026-07-01', now: NOW })
    expect(withDate.onTrack).toBe(false)
    expect(withDate.projectedReadyDate).toBeNull()

    const noDate = computePacing({ history, passingScore: 675, examDate: null, now: NOW })
    expect(noDate.onTrack).toBeNull()
  })

  it('a single day of data yields no trend', () => {
    const r = computePacing({
      history: [{ date: '2026-06-09T10:00:00Z', score: 500 }],
      passingScore: 675,
      examDate: null,
      now: NOW,
    })
    expect(r.pointsPerDay).toBeNull()
    expect(r.projectedReadyDate).toBeNull()
    expect(r.onTrack).toBeNull()
  })
})
