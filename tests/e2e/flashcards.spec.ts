import { test, expect } from '@playwright/test'

test.describe('flashcards', () => {
  test('hub shows today plan and drill sets', async ({ page }) => {
    await page.goto('/flashcards')
    await expect(page.getByText("Today's plan")).toBeVisible()
    await expect(page.getByText('Drill sets · memorize')).toBeVisible()
  })

  test('drill flip session: reveal then got-it advances', async ({ page }) => {
    await page.goto('/flashcards/session?setId=ds-ports')
    // Wait for the card to load (API fetch completes)
    await expect(page.getByText('Question')).toBeVisible({ timeout: 10_000 })
    // Reveal the answer
    await page.getByRole('button', { name: /reveal the answer/i }).click()
    await expect(page.getByText('Answer')).toBeVisible()
    // Advance to next card via keyboard shortcut
    await page.keyboard.press('ArrowRight')
    // Progress counter should now read "2 / N"
    await expect(page.getByText(/2 \//)).toBeVisible()
  })

  test('match game renders a grid', async ({ page }) => {
    await page.goto('/flashcards/drills/ds-ports/match')
    // Wait for data to load; the grid renders clickable tile buttons
    await expect(page.locator('button').nth(1)).toBeVisible({ timeout: 10_000 })
  })
})
