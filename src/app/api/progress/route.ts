import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { studyProgress } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { topicId, status } = await req.json()
  if (!topicId || !status) {
    return NextResponse.json({ error: 'Missing topicId or status' }, { status: 400 })
  }

  const [existing] = await db.select().from(studyProgress).where(eq(studyProgress.topicId, topicId))

  if (existing) {
    await db.update(studyProgress)
      .set({ status, lastStudiedAt: new Date().toISOString() })
      .where(eq(studyProgress.id, existing.id))
  } else {
    await db.insert(studyProgress).values({
      id: randomUUID(),
      topicId,
      status,
      timeSpentSeconds: 0,
      lastStudiedAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({ ok: true })
}
