import { describe, it, expect } from 'vitest'
import { newCardBudget } from './flashcard-queue'

describe('newCardBudget', () => {
  it('fills the whole daily goal with new cards for a fresh user', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 0, doneToday: 0 })).toBe(20)
  })

  it('serves no new cards when due reviews already exceed the goal', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 30, doneToday: 0 })).toBe(0)
  })

  it('tops up around due cards', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 5, doneToday: 0 })).toBe(15)
  })

  it('counts reviews already done today against the budget', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 3, doneToday: 10 })).toBe(7)
  })

  it('returns zero once the goal is met', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 0, doneToday: 20 })).toBe(0)
  })

  it('never goes negative', () => {
    expect(newCardBudget({ dailyGoal: 20, dueCount: 50, doneToday: 40 })).toBe(0)
  })

  it('handles a zero goal', () => {
    expect(newCardBudget({ dailyGoal: 0, dueCount: 0, doneToday: 0 })).toBe(0)
  })
})
