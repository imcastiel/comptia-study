import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards } from '@/db/schema'
import { and, eq, like, or, desc, sql, type SQL } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { isContentType, validateQuestion, validateFlashcard } from '@/lib/admin/content-types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const sp = req.nextUrl.searchParams
  const status = sp.get('status')
  const topicId = sp.get('topic')
  const source = sp.get('source')
  const q = sp.get('q')?.trim()

  if (type === 'questions') {
    const conds: SQL[] = []
    if (status === 'published') conds.push(eq(questions.published, true))
    if (status === 'draft') conds.push(eq(questions.published, false))
    if (topicId) conds.push(eq(questions.topicId, topicId))
    if (source) conds.push(eq(questions.source, source))
    if (q) conds.push(or(like(questions.stem, `%${q}%`), like(questions.explanation, `%${q}%`))!)
    const items = await db.select().from(questions)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(sql`coalesce(${questions.updatedAt}, ${questions.createdAt})`))
      .limit(200)
    return NextResponse.json({ items })
  }

  const conds: SQL[] = []
  if (status === 'published') conds.push(eq(flashcards.published, true))
  if (status === 'draft') conds.push(eq(flashcards.published, false))
  if (topicId) conds.push(eq(flashcards.topicId, topicId))
  if (source) conds.push(eq(flashcards.source, source))
  if (q) conds.push(or(like(flashcards.front, `%${q}%`), like(flashcards.back, `%${q}%`))!)
  const items = await db.select().from(flashcards)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(sql`coalesce(${flashcards.updatedAt}, ${flashcards.createdAt})`))
    .limit(200)
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const body = await req.json()
  const now = new Date().toISOString()
  const id = randomUUID()

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
