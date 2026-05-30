import { cookies } from 'next/headers'
import { parseAdminCodes, isAdminCode } from '@/lib/access'

// Cookie format: "<16-digit-code>.<hex-hmac>"
// HMAC is verified by middleware; API routes just extract the code.
export async function getUserCode(): Promise<string | null> {
  const store = await cookies()
  const value = store.get('auth')?.value
  if (!value) return null
  const code = value.split('.')[0]
  return code?.length === 16 ? code : null
}

export async function isAdmin(): Promise<boolean> {
  const code = await getUserCode()
  return isAdminCode(code, parseAdminCodes(process.env.ADMIN_CODES))
}

// Returns a 404 Response when the caller is not an admin, else null.
// Use at the top of every /api/admin handler:
//   const guard = await requireAdmin(); if (guard) return guard
export async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null
  return new Response('Not found', { status: 404 })
}
