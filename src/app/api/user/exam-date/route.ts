import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getUserCode } from '@/lib/auth'

export async function GET() {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select({ targetExamDate: users.targetExamDate }).from(users).where(eq(users.code, userId))
  return NextResponse.json({ targetExamDate: user?.targetExamDate ?? null })
}

export async function PUT(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date } = await req.json().catch(() => ({})) as { date?: string | null }

  if (date !== null && date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'date must be YYYY-MM-DD or null' }, { status: 400 })
    }
  }

  await db.update(users).set({ targetExamDate: date ?? null }).where(eq(users.code, userId))
  return NextResponse.json({ targetExamDate: date ?? null })
}
