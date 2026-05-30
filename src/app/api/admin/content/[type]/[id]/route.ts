import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { isContentType, validateQuestion, validateFlashcard } from '@/lib/admin/content-types'
import { isReferenced } from '@/lib/admin/content-refs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type, id } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const body = await req.json() as Record<string, unknown>
  const now = new Date().toISOString()

  if (type === 'questions') {
    const set: Record<string, unknown> = { updatedAt: now }
    if (typeof body.published === 'boolean') set.published = body.published
    if (body.stem !== undefined) {
      const v = validateQuestion(body as never)
      if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
      Object.assign(set, {
        topicId: body.topicId, type: body.type ?? 'single', stem: body.stem,
        choices: JSON.stringify(body.choices), correctAnswer: JSON.stringify(body.correctAnswer),
        explanation: body.explanation, difficulty: body.difficulty, tags: body.tags ?? null,
      })
    }
    await db.update(questions).set(set).where(eq(questions.id, id))
    return NextResponse.json({ ok: true })
  }

  const set: Record<string, unknown> = { updatedAt: now }
  if (typeof body.published === 'boolean') set.published = body.published
  if (body.front !== undefined) {
    const v = validateFlashcard(body as never)
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
    Object.assign(set, { topicId: body.topicId, front: body.front, back: body.back, tags: body.tags ?? null, difficulty: body.difficulty ?? 2 })
  }
  await db.update(flashcards).set(set).where(eq(flashcards.id, id))
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type, id } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  if (await isReferenced(type, id)) {
    return NextResponse.json(
      { error: 'This item has user activity and cannot be deleted. Unpublish it instead.' },
      { status: 409 },
    )
  }
  if (type === 'questions') await db.delete(questions).where(eq(questions.id, id))
  else await db.delete(flashcards).where(eq(flashcards.id, id))
  return NextResponse.json({ ok: true })
}
