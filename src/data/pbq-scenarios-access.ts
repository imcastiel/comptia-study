import { db } from '@/db'
import { pbqScenarios } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { PBQScenario } from './pbq-scenarios'

export async function getPublishedScenarios(): Promise<PBQScenario[]> {
  const rows = await db
    .select({ data: pbqScenarios.data })
    .from(pbqScenarios)
    .where(eq(pbqScenarios.published, true))
  return rows.map((r) => JSON.parse(r.data) as PBQScenario)
}

export async function getPublishedScenario(id: string): Promise<PBQScenario | null> {
  const [row] = await db
    .select({ data: pbqScenarios.data })
    .from(pbqScenarios)
    .where(and(eq(pbqScenarios.id, id), eq(pbqScenarios.published, true)))
  return row ? (JSON.parse(row.data) as PBQScenario) : null
}
