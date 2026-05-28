import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { studyProgress } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { getUserCode } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topicId, status } = await req.json()
  if (!topicId || !status) {
    return NextResponse.json({ error: 'Missing topicId or status' }, { status: 400 })
  }

  const [existing] = await db.select().from(studyProgress)
    .where(and(eq(studyProgress.userId, userId), eq(studyProgress.topicId, topicId)))

  if (existing) {
    await db.update(studyProgress)
      .set({ status, lastStudiedAt: new Date().toISOString() })
      .where(and(eq(studyProgress.userId, userId), eq(studyProgress.topicId, topicId)))
  } else {
    await db.insert(studyProgress).values({
      id: randomUUID(), userId, topicId, status, timeSpentSeconds: 0, lastStudiedAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({ ok: true })
}
