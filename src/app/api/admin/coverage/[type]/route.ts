import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { exams, domains, topics, questions, flashcards } from '@/db/schema'
import { count } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'

// Coverage map: exam → domain → topic with published/draft counts, plus a
// weight-based target per domain (questions only) so gaps are visible.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  const isQuestions = type === 'questions'
  if (!isQuestions && type !== 'flashcards') {
    return NextResponse.json({ error: 'Unsupported type' }, { status: 404 })
  }
  const table = isQuestions ? questions : flashcards

  const [examRows, domainRows, topicRows, countRows] = await Promise.all([
    db.select().from(exams),
    db.select().from(domains).orderBy(domains.orderIndex),
    db.select().from(topics).orderBy(topics.orderIndex),
    db.select({ topicId: table.topicId, published: table.published, n: count() })
      .from(table).groupBy(table.topicId, table.published),
  ])

  const byTopic = new Map<string, { published: number; draft: number }>()
  for (const r of countRows) {
    const e = byTopic.get(r.topicId) ?? { published: 0, draft: 0 }
    if (r.published) e.published += Number(r.n)
    else e.draft += Number(r.n)
    byTopic.set(r.topicId, e)
  }

  const topicsByDomain = new Map<string, typeof topicRows>()
  for (const t of topicRows) {
    const arr = topicsByDomain.get(t.domainId) ?? []
    arr.push(t)
    topicsByDomain.set(t.domainId, arr)
  }
  const domainsByExam = new Map<string, typeof domainRows>()
  for (const d of domainRows) {
    const arr = domainsByExam.get(d.examId) ?? []
    arr.push(d)
    domainsByExam.set(d.examId, arr)
  }

  const examsOut = examRows
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((ex) => {
      const ds = (domainsByExam.get(ex.id) ?? []).map((d) => {
        const ts = (topicsByDomain.get(d.id) ?? []).map((t) => {
          const c = byTopic.get(t.id) ?? { published: 0, draft: 0 }
          return {
            id: t.id, title: t.title, objectiveId: t.objectiveId,
            published: c.published, draft: c.draft, total: c.published + c.draft,
          }
        })
        const published = ts.reduce((s, t) => s + t.published, 0)
        const draft = ts.reduce((s, t) => s + t.draft, 0)
        const target = isQuestions ? Math.round((d.weightPercent / 100) * ex.maxQuestions) : 0
        return {
          id: d.id, number: d.number, name: d.name, weightPercent: d.weightPercent,
          target, published, draft, total: published + draft, topics: ts,
        }
      })
      return { id: ex.id, code: ex.code, name: ex.name, maxQuestions: ex.maxQuestions, domains: ds }
    })

  return NextResponse.json({ type, exams: examsOut })
}
