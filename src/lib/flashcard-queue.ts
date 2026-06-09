/**
 * Session queue composition for spaced-repetition reviews.
 *
 * A daily session is built due-cards-first, then topped up with brand-new
 * (never-reviewed) cards until the user's daily goal is met. Reviews already
 * completed today count against the budget so repeat sessions in one day
 * don't introduce unlimited new material.
 */
export interface NewCardBudgetInput {
  dailyGoal: number
  dueCount: number
  doneToday: number
}

export function newCardBudget({ dailyGoal, dueCount, doneToday }: NewCardBudgetInput): number {
  return Math.max(0, dailyGoal - dueCount - doneToday)
}
