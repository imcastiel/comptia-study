import { cookies } from 'next/headers'

// Cookie format: "<16-digit-code>.<hex-hmac>"
// HMAC is verified by middleware; API routes just extract the code.
export async function getUserCode(): Promise<string | null> {
  const store = await cookies()
  const value = store.get('auth')?.value
  if (!value) return null
  const code = value.split('.')[0]
  return code?.length === 16 ? code : null
}
