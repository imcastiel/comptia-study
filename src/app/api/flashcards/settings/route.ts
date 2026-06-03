import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { flashcardSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'

const DEFAULTS = { dailyGoal: 20, newCardCap: 10 }

export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [row] = await db.select().from(flashcardSettings).where(eq(flashcardSettings.userId, userId))
  return NextResponse.json({ dailyGoal: row?.dailyGoal ?? DEFAULTS.dailyGoal, newCardCap: row?.newCardCap ?? DEFAULTS.newCardCap })
}

export async function PUT(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json() as { dailyGoal?: number; newCardCap?: number }
    const dailyGoal = clampInt(body.dailyGoal, 5, 200, DEFAULTS.dailyGoal)
    const newCardCap = clampInt(body.newCardCap, 0, 100, DEFAULTS.newCardCap)
    const now = new Date().toISOString()
    await db.insert(flashcardSettings)
      .values({ userId, dailyGoal, newCardCap, updatedAt: now })
      .onConflictDoUpdate({ target: flashcardSettings.userId, set: { dailyGoal, newCardCap, updatedAt: now } })
    return NextResponse.json({ dailyGoal, newCardCap })
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? Math.round(v) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
