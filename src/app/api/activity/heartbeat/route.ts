import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { studyActivityLog, studyTopicVisits } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const userId = await getUserCode()
  if (!userId) return new NextResponse(null, { status: 401 })

  try {
    const body = await request.json() as { topicId?: string }
    const today = new Date().toISOString().slice(0, 10)

    if (body.topicId) {
      await db.insert(studyTopicVisits)
        .values({ userId, date: today, topicId: body.topicId })
        .onConflictDoNothing()
    }

    await db.insert(studyActivityLog)
      .values({ userId, date: today, minutesActive: 1 })
      .onConflictDoUpdate({
        target: [studyActivityLog.userId, studyActivityLog.date],
        set: { minutesActive: sql`${studyActivityLog.minutesActive} + 1` },
      })

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
