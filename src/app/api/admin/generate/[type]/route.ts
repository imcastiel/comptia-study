import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards, generationProfiles, topics } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { isContentType, validateQuestion } from '@/lib/admin/content-types'
import { assemblePrompt, type ExistingItemSummary } from '@/lib/admin/generation/prompt-assembly'
import { generateDrafts } from '@/lib/admin/generation/generate'
import { flagDuplicates, type ExistingText } from '@/lib/admin/generation/dedup'
import { reviewConsistency } from '@/lib/admin/generation/consistency-review'

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const { brief, options = {}, count = 10, topicId } = await req.json() as {
    brief: string; options?: Record<string, boolean>; count?: number; topicId?: string
  }
  if (!brief?.trim()) return NextResponse.json({ error: 'brief is required' }, { status: 400 })

  const [profile] = await db.select().from(generationProfiles).where(eq(generationProfiles.contentType, type))
  const masterPrompt = profile?.masterPrompt ?? ''

  const now = new Date().toISOString()
  let existingText: ExistingText[] = []
  let existingSummaries: ExistingItemSummary[] = []
  if (type === 'flashcards') {
    const rows = await db.select().from(flashcards)
      .where(topicId ? and(eq(flashcards.published, true), eq(flashcards.topicId, topicId)) : eq(flashcards.published, true))
      .orderBy(desc(flashcards.createdAt)).limit(60)
    existingText = rows.map((r) => ({ id: r.id, text: `${r.front} ${r.back}` }))
    existingSummaries = rows.map((r) => ({ summary: `${r.front} → ${r.back}` }))
  } else {
    const rows = await db.select().from(questions)
      .where(topicId ? and(eq(questions.published, true), eq(questions.topicId, topicId)) : eq(questions.published, true))
      .orderBy(desc(questions.createdAt)).limit(40)
    existingText = rows.map((r) => ({ id: r.id, text: r.stem }))
    existingSummaries = rows.map((r) => ({ summary: r.stem }))
  }

  const prompt = assemblePrompt({ contentType: type, masterPrompt, brief, options, count, existing: existingSummaries })

  let raw: unknown[]
  try { raw = await generateDrafts(prompt) }
  catch (e) { console.error('[generate]', e); return NextResponse.json({ error: 'Generation failed' }, { status: 502 }) }

  const fallbackTopic = topicId ?? (await db.select({ id: topics.id }).from(topics).limit(1))[0]?.id
  if (!fallbackTopic) return NextResponse.json({ error: 'No topic available' }, { status: 400 })

  const saved: Array<{ key: string; id: string; text: string; item: unknown }> = []
  const rejected: Array<{ item: unknown; error: string }> = []

  for (const item of raw) {
    const id = randomUUID()
    const key = id
    if (type === 'flashcards') {
      const f = item as { front?: string; back?: string }
      if (!f.front?.trim() || !f.back?.trim()) { rejected.push({ item, error: 'missing front/back' }); continue }
      await db.insert(flashcards).values({
        id, topicId: fallbackTopic, front: f.front, back: f.back, tags: null,
        difficulty: 2, published: false, source: 'ai', createdAt: now, updatedAt: now,
      })
      saved.push({ key, id, text: `${f.front} ${f.back}`, item })
    } else {
      const q = item as { stem?: string; choices?: unknown; correctAnswer?: unknown; explanation?: string; difficulty?: number }
      const payload = { topicId: fallbackTopic, type: 'single', stem: q.stem ?? '', choices: (q.choices as never) ?? [], correctAnswer: (q.correctAnswer as never) ?? '', explanation: q.explanation ?? '', difficulty: q.difficulty ?? 2 }
      const v = validateQuestion(payload as never)
      if (!v.ok) { rejected.push({ item, error: v.error }); continue }
      await db.insert(questions).values({
        id, topicId: fallbackTopic, type: 'single', stem: payload.stem,
        choices: JSON.stringify(payload.choices), correctAnswer: JSON.stringify(payload.correctAnswer),
        explanation: payload.explanation, difficulty: payload.difficulty, tags: null,
        published: false, source: 'ai', createdAt: now, updatedAt: now,
      })
      saved.push({ key, id, text: payload.stem, item })
    }
  }

  const dupFlags = flagDuplicates(saved.map((s) => ({ key: s.key, text: s.text })), existingText, 0.6)
  let consistencyFlags: Awaited<ReturnType<typeof reviewConsistency>> = []
  if (saved.length && existingText.length) {
    try {
      consistencyFlags = await reviewConsistency(
        JSON.stringify(saved.map((s) => s.item)),
        JSON.stringify(existingText.map((e) => ({ id: e.id, text: e.text }))),
      )
    } catch (e) { console.error('[consistency]', e) }
  }

  return NextResponse.json({
    drafts: saved.map((s, i) => ({ id: s.id, item: s.item, duplicateOf: dupFlags[s.key] ?? null, conflict: consistencyFlags.find((c) => c.index === i) ?? null })),
    rejected,
  })
}
