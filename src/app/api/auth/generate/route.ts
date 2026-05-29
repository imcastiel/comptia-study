import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { signCode } from '@/lib/hmac'

const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const timestamps = (rateLimitStore.get(ip) ?? []).filter((t) => now - t < windowMs)
  if (timestamps.length >= 5) return false
  rateLimitStore.set(ip, [...timestamps, now])
  return true
}

function generateCode(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('')
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const code = generateCode()
    await db.insert(users).values({ code, createdAt: new Date().toISOString() })

    const hmac = await signCode(code)
    const response = NextResponse.json({ code })
    response.cookies.set('auth', `${code}.${hmac}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('[/api/auth/generate]', err)
    return NextResponse.json({ error: 'Could not create account. Try again.' }, { status: 500 })
  }
}
