import { describe, it, expect } from 'vitest'
import { calculateSM2 } from './sm2'

describe('calculateSM2', () => {
  it('first correct review schedules 1 day out', () => {
    const r = calculateSM2({ quality: 4, easeFactor: 2.5, intervalDays: 0, repetitions: 0 })
    expect(r.intervalDays).toBe(1)
    expect(r.repetitions).toBe(1)
  })

  it('second correct review schedules 3 days out (tuned from 6)', () => {
    const r = calculateSM2({ quality: 4, easeFactor: 2.5, intervalDays: 1, repetitions: 1 })
    expect(r.intervalDays).toBe(3)
    expect(r.repetitions).toBe(2)
  })

  it('third correct review uses interval * ease', () => {
    const r = calculateSM2({ quality: 4, easeFactor: 2.5, intervalDays: 3, repetitions: 2 })
    expect(r.intervalDays).toBe(Math.round(3 * r.easeFactor))
  })

  it('a miss resets interval to 1 and repetitions to 0', () => {
    const r = calculateSM2({ quality: 1, easeFactor: 2.5, intervalDays: 30, repetitions: 5 })
    expect(r.intervalDays).toBe(1)
    expect(r.repetitions).toBe(0)
  })

  it('a miss leaves the ease factor unchanged (canonical SM-2)', () => {
    const r = calculateSM2({ quality: 1, easeFactor: 2.5, intervalDays: 30, repetitions: 5 })
    expect(r.easeFactor).toBe(2.5)
  })

  it('repeated misses do not drive ease toward the 1.3 floor', () => {
    let ease = 2.5
    for (let i = 0; i < 5; i++) {
      ease = calculateSM2({ quality: 1, easeFactor: ease, intervalDays: 1, repetitions: 0 }).easeFactor
    }
    expect(ease).toBe(2.5)
  })

  it('correct reviews still adjust the ease factor', () => {
    const good = calculateSM2({ quality: 4, easeFactor: 2.5, intervalDays: 3, repetitions: 2 })
    expect(good.easeFactor).toBe(2.5)
    const hard = calculateSM2({ quality: 3, easeFactor: 2.5, intervalDays: 3, repetitions: 2 })
    expect(hard.easeFactor).toBeLessThan(2.5)
    const easy = calculateSM2({ quality: 5, easeFactor: 2.5, intervalDays: 3, repetitions: 2 })
    expect(easy.easeFactor).toBeGreaterThan(2.5)
  })

  it('ease factor never drops below 1.3 on correct reviews', () => {
    const r = calculateSM2({ quality: 3, easeFactor: 1.3, intervalDays: 3, repetitions: 2 })
    expect(r.easeFactor).toBe(1.3)
  })
})
