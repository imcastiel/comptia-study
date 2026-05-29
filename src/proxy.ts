import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCode } from '@/lib/hmac'
import { classifyRoute, parseAdminCodes, isAdminCode } from '@/lib/access'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const route = classifyRoute(pathname)

  if (route === 'public') return NextResponse.next()

  // Validate the signed auth cookie.
  let code: string | null = null
  const cookie = request.cookies.get('auth')?.value
  if (cookie) {
    const [c, hmac] = cookie.split('.')
    if (c && hmac && c.length === 16 && (await verifyCode(c, hmac))) {
      code = c
    }
  }

  if (route === 'admin') {
    // Hide the panel's existence from non-admins: 404, not redirect/403.
    if (!isAdminCode(code, parseAdminCodes(process.env.ADMIN_CODES))) {
      return new NextResponse('Not found', { status: 404 })
    }
    return NextResponse.next()
  }

  // protected
  if (code) return NextResponse.next()
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
