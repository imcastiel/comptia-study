import { NextResponse } from 'next/server'
import { db } from '@/db'
import { studyActivityLog, studyTopicVisits } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select({
        date: studyActivityLog.date,
        minutesActive: studyActivityLog.minutesActive,
        topicsVisited: sql<number>`cast(count(${studyTopicVisits.topicId}) as integer)`,
      })
      .from(studyActivityLog)
      .leftJoin(studyTopicVisits, eq(studyActivityLog.date, studyTopicVisits.date))
      .where(sql`${studyActivityLog.date} >= date('now', '-364 days')`)
      .groupBy(studyActivityLog.date)
      .orderBy(studyActivityLog.date)

    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
