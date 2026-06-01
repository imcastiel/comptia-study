import { db } from '@/db'
import { cheatSheets } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { CheatSheet } from './cheat-sheets'

export async function getPublishedCheatSheets(): Promise<CheatSheet[]> {
  const rows = await db
    .select({ data: cheatSheets.data })
    .from(cheatSheets)
    .where(eq(cheatSheets.published, true))
  return rows.map((r) => JSON.parse(r.data) as CheatSheet)
}

export async function getPublishedCheatSheet(
  topicSlug: string
): Promise<CheatSheet | null> {
  const [row] = await db
    .select({ data: cheatSheets.data })
    .from(cheatSheets)
    .where(and(eq(cheatSheets.id, topicSlug), eq(cheatSheets.published, true)))
  return row ? (JSON.parse(row.data) as CheatSheet) : null
}

export async function cheatSheetExists(topicSlug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: cheatSheets.id })
    .from(cheatSheets)
    .where(and(eq(cheatSheets.id, topicSlug), eq(cheatSheets.published, true)))
  return !!row
}
