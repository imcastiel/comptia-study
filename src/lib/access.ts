export type RouteClass = 'public' | 'admin' | 'protected'

const PUBLIC_PREFIXES = ['/login', '/api/auth']

export function classifyRoute(pathname: string): RouteClass {
  if (
    pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/api/admin' || pathname.startsWith('/api/admin/')
  ) {
    return 'admin'
  }
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return 'public'
  return 'protected'
}

export function parseAdminCodes(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(/[,\s]+/).map((c) => c.trim()).filter(Boolean)
}

export function isAdminCode(code: string | null, adminCodes: string[]): boolean {
  if (!code) return false
  return adminCodes.includes(code)
}
