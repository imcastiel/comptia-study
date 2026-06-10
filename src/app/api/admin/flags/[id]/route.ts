import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { contentFlags } from '@/db/schema'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { id } = await params
  const { status } = await req.json().catch(() => ({})) as { status?: string }
  if (status !== 'resolved' && status !== 'dismissed') {
    return NextResponse.json({ error: 'status must be "resolved" or "dismissed"' }, { status: 400 })
  }

  const [existing] = await db.select().from(contentFlags).where(eq(contentFlags.id, id))
  if (!existing) return NextResponse.json({ error: 'Flag not found' }, { status: 404 })

  await db.update(contentFlags)
    .set({ status, resolvedAt: new Date().toISOString() })
    .where(eq(contentFlags.id, id))

  return NextResponse.json({ ok: true })
}
