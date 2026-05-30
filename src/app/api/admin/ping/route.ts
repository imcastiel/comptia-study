import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard
  return NextResponse.json({ ok: true, admin: true })
}
