import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCode } from '@/lib/hmac'

// Renamed from `middleware` for Next.js 16 (Middleware → Proxy) and located in
// `src/` to sit at the same level as `src/app`. Runs on the nodejs runtime;
// gates every non-public route behind a valid signed auth cookie.
const PUBLIC_PATHS = ['/login', '/api/auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('auth')?.value
  if (cookie) {
    const [code, hmac] = cookie.split('.')
    if (code && hmac && code.length === 16 && await verifyCode(code, hmac)) {
      return NextResponse.next()
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
