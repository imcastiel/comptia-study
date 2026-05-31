import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { signCode } from '@/lib/hmac'
import { getUserCode } from '@/lib/auth'

// Returns the logged-in account's own code (from its signed cookie), or null.
export async function GET() {
  const code = await getUserCode()
  return NextResponse.json({ code })
}

export async function POST(request: NextRequest) {
  const { code } = await request.json() as { code?: string }

  const normalized = (code ?? '').replace(/\s/g, '')
  if (!/^\d{16}$/.test(normalized)) {
    return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
  }

  const [user] = await db.select({ code: users.code }).from(users).where(eq(users.code, normalized))
  if (!user) {
    return NextResponse.json({ error: 'Account not found' }, { status: 401 })
  }

  const hmac = await signCode(normalized)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('auth', `${normalized}.${hmac}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('auth')
  return response
}
