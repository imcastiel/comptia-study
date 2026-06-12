import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards, cheatSheets, pbqScenarios, questionAttempts } from '@/db/schema'
import { and, eq, like, or, desc, sql, count, getTableColumns, type SQL } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { isContentType, isBlobType, validateQuestion, validateFlashcard, validateBlob } from '@/lib/admin/content-types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const sp = req.nextUrl.searchParams
  const status = sp.get('status')
  const topicId = sp.get('topic')
  const source = sp.get('source')
  const q = sp.get('q')?.trim()

  // Pagination: page (0-based) + pageSize (capped). Total is returned so the
  // UI can show "X of Y" and offer Load more — the list is no longer truncated.
  const pageSize = Math.min(Math.max(Number(sp.get('pageSize')) || 200, 1), 500)
  const page = Math.max(Number(sp.get('page')) || 0, 0)
  const offset = page * pageSize

  if (isBlobType(type)) {
    if (type === 'cheat_sheets') {
      const conds: SQL[] = []
      if (status === 'published') conds.push(eq(cheatSheets.published, true))
      if (status === 'draft') conds.push(eq(cheatSheets.published, false))
      if (source) conds.push(eq(cheatSheets.source, source))
      if (q) conds.push(like(cheatSheets.title, `%${q}%`))
      const where = conds.length ? and(...conds) : undefined
      const [{ total }] = await db.select({ total: count() }).from(cheatSheets).where(where)
      const items = await db.select({
        id: cheatSheets.id, title: cheatSheets.title,
        published: cheatSheets.published, source: cheatSheets.source,
        updatedAt: cheatSheets.updatedAt,
      }).from(cheatSheets)
        .where(where)
        .orderBy(desc(sql`coalesce(${cheatSheets.updatedAt}, ${cheatSheets.createdAt})`))
        .limit(pageSize).offset(offset)
      return NextResponse.json({ items, total: Number(total) })
    }
    // pbq_scenarios
    const conds: SQL[] = []
    if (status === 'published') conds.push(eq(pbqScenarios.published, true))
    if (status === 'draft') conds.push(eq(pbqScenarios.published, false))
    if (source) conds.push(eq(pbqScenarios.source, source))
    if (q) conds.push(like(pbqScenarios.title, `%${q}%`))
    const where = conds.length ? and(...conds) : undefined
    const [{ total }] = await db.select({ total: count() }).from(pbqScenarios).where(where)
    const items = await db.select({
      id: pbqScenarios.id, title: pbqScenarios.title,
      published: pbqScenarios.published, source: pbqScenarios.source,
      updatedAt: pbqScenarios.updatedAt,
    }).from(pbqScenarios)
      .where(where)
      .orderBy(desc(sql`coalesce(${pbqScenarios.updatedAt}, ${pbqScenarios.createdAt})`))
      .limit(pageSize).offset(offset)
    return NextResponse.json({ items, total: Number(total) })
  }

  if (type === 'questions') {
    const conds: SQL[] = []
    if (status === 'published') conds.push(eq(questions.published, true))
    if (status === 'draft') conds.push(eq(questions.published, false))
    if (topicId) conds.push(eq(questions.topicId, topicId))
    if (source) conds.push(eq(questions.source, source))
    if (q) conds.push(or(like(questions.stem, `%${q}%`), like(questions.explanation, `%${q}%`))!)
    const where = conds.length ? and(...conds) : undefined
    const sort = sp.get('sort')
    const [{ total }] = await db.select({ total: count() }).from(questions).where(where)

    // Learner telemetry per question: attempts + misses across all users,
    // so admins can spot questions everyone gets wrong (or nobody sees).
    const agg = db
      .select({
        questionId: questionAttempts.questionId,
        attempts: count().as('attempts'),
        misses: sql<number>`sum(case when ${questionAttempts.isCorrect} then 0 else 1 end)`.as('misses'),
      })
      .from(questionAttempts)
      .groupBy(questionAttempts.questionId)
      .as('agg')

    const items = await db
      .select({
        ...getTableColumns(questions),
        attempts: sql<number>`coalesce(${agg.attempts}, 0)`,
        misses: sql<number>`coalesce(${agg.misses}, 0)`,
      })
      .from(questions)
      .leftJoin(agg, eq(questions.id, agg.questionId))
      .where(where)
      .orderBy(
        sort === 'missed'
          ? desc(sql`coalesce(${agg.misses} * 1.0 / nullif(${agg.attempts}, 0), 0)`)
          : desc(sql`coalesce(${questions.updatedAt}, ${questions.createdAt})`),
      )
      .limit(pageSize).offset(offset)
    return NextResponse.json({ items, total: Number(total) })
  }

  const conds: SQL[] = []
  if (status === 'published') conds.push(eq(flashcards.published, true))
  if (status === 'draft') conds.push(eq(flashcards.published, false))
  if (topicId) conds.push(eq(flashcards.topicId, topicId))
  if (source) conds.push(eq(flashcards.source, source))
  if (q) conds.push(or(like(flashcards.front, `%${q}%`), like(flashcards.back, `%${q}%`))!)
  const where = conds.length ? and(...conds) : undefined
  const [{ total }] = await db.select({ total: count() }).from(flashcards).where(where)
  const items = await db.select().from(flashcards)
    .where(where)
    .orderBy(desc(sql`coalesce(${flashcards.updatedAt}, ${flashcards.createdAt})`))
    .limit(pageSize).offset(offset)
  return NextResponse.json({ items, total: Number(total) })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const body = await req.json()
  const now = new Date().toISOString()
  const id = randomUUID()

  if (isBlobType(type)) {
    const v = validateBlob(body)
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
    let parsed: Record<string, unknown> = {}
    try { parsed = JSON.parse(body.data) } catch { /* already validated */ }
    if (type === 'cheat_sheets') {
      await db.insert(cheatSheets).values({
        id, title: body.title, data: body.data,
        exam: (parsed.exam as string) ?? '',
        domainSlug: (parsed.domainSlug as string) ?? '',
        published: false, source: 'manual', createdAt: now, updatedAt: now,
      })
    } else {
      await db.insert(pbqScenarios).values({
        id, title: body.title, data: body.data,
        category: (parsed.category as string) ?? '',
        examCode: (parsed.examCode as string) ?? '',
        published: false, source: 'manual', createdAt: now, updatedAt: now,
      })
    }
    return NextResponse.json({ id })
  }

  if (type === 'questions') {
    const v = validateQuestion(body)
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
    await db.insert(questions).values({
      id, topicId: body.topicId, type: body.type ?? 'single',
      stem: body.stem, choices: JSON.stringify(body.choices),
      correctAnswer: JSON.stringify(body.correctAnswer), explanation: body.explanation,
      difficulty: body.difficulty, tags: body.tags ?? null,
      published: false, source: 'manual', createdAt: now, updatedAt: now,
    })
  } else {
    const v = validateFlashcard(body)
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
    await db.insert(flashcards).values({
      id, topicId: body.topicId, front: body.front, back: body.back,
      tags: body.tags ?? null, difficulty: body.difficulty ?? 2,
      published: false, source: 'manual', createdAt: now, updatedAt: now,
    })
  }
  return NextResponse.json({ id })
}
