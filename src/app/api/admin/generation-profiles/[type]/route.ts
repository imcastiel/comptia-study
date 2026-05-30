import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { generationProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { isContentType } from '@/lib/admin/content-types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })
  const [profile] = await db.select().from(generationProfiles).where(eq(generationProfiles.contentType, type))
  return NextResponse.json({ profile: profile ?? null })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })
  const { masterPrompt } = await req.json() as { masterPrompt: string }
  if (!masterPrompt || !masterPrompt.trim()) return NextResponse.json({ error: 'masterPrompt required' }, { status: 400 })
  const now = new Date().toISOString()
  await db.insert(generationProfiles)
    .values({ contentType: type, masterPrompt, defaultOptions: '{}', updatedAt: now })
    .onConflictDoUpdate({ target: generationProfiles.contentType, set: { masterPrompt, updatedAt: now } })
  return NextResponse.json({ ok: true })
}
