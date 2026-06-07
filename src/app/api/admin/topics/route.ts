import { NextResponse } from 'next/server'
import { db } from '@/db'
import { exams, domains, topics } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'

// Flat topic list with exam/domain context, for the admin topic picker and
// id → title lookups. Ordered by exam, domain, then topic.
export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard

  const rows = await db.select({
    id: topics.id,
    title: topics.title,
    objectiveId: topics.objectiveId,
    domainId: domains.id,
    domainNumber: domains.number,
    domainName: domains.name,
    domainOrder: domains.orderIndex,
    examCode: exams.code,
    topicOrder: topics.orderIndex,
  })
    .from(topics)
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .innerJoin(exams, eq(domains.examId, exams.id))
    .orderBy(exams.code, domains.orderIndex, topics.orderIndex)

  return NextResponse.json({ topics: rows })
}
