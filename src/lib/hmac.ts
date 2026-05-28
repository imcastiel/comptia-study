// Edge-compatible HMAC-SHA256 for auth cookies.
// Cookie format: "<16-digit-code>.<hex-hmac>"

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET env var is not set')
  return secret
}

export async function signCode(code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(code))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyCode(code: string, hmac: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const sig = Uint8Array.from(hmac.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    return crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(code))
  } catch {
    return false
  }
}
