import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { questions, flashcards, cheatSheets, pbqScenarios } from '@/db/schema'
import { inArray } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { isContentType, isBlobType } from '@/lib/admin/content-types'
import { isReferenced } from '@/lib/admin/content-refs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const guard = await requireAdmin(); if (guard) return guard
  const { type } = await params
  if (!isContentType(type)) return NextResponse.json({ error: 'Unknown content type' }, { status: 404 })

  const { action, ids } = await req.json() as { action: 'publish' | 'unpublish' | 'delete'; ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No ids' }, { status: 400 })
  const now = new Date().toISOString()

  if (isBlobType(type)) {
    const blobTable = type === 'cheat_sheets' ? cheatSheets : pbqScenarios
    if (action === 'publish' || action === 'unpublish') {
      await db.update(blobTable).set({ published: action === 'publish', updatedAt: now }).where(inArray(blobTable.id, ids))
      return NextResponse.json({ ok: true, affected: ids.length })
    }
    if (action === 'delete') {
      // Blob tables have no FK references — delete directly
      await db.delete(blobTable).where(inArray(blobTable.id, ids))
      return NextResponse.json({ ok: true, deleted: ids.length, skipped: [] })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const table = type === 'questions' ? questions : flashcards

  if (action === 'publish' || action === 'unpublish') {
    await db.update(table).set({ published: action === 'publish', updatedAt: now }).where(inArray(table.id, ids))
    return NextResponse.json({ ok: true, affected: ids.length })
  }

  if (action === 'delete') {
    const deletable: string[] = []
    const skipped: string[] = []
    for (const id of ids) {
      if (await isReferenced(type, id)) skipped.push(id)
      else deletable.push(id)
    }
    if (deletable.length) await db.delete(table).where(inArray(table.id, deletable))
    return NextResponse.json({ ok: true, deleted: deletable.length, skipped })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
