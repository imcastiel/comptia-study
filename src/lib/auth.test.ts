import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))

import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/auth'

function mockCookie(value: string | undefined) {
  ;(cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    get: (name: string) => (name === 'auth' && value ? { value } : undefined),
  })
}

describe('isAdmin', () => {
  beforeEach(() => { process.env.ADMIN_CODES = '1111222233334444' })
  it('true when cookie code is in ADMIN_CODES', async () => {
    mockCookie('1111222233334444.deadbeef')
    expect(await isAdmin()).toBe(true)
  })
  it('false for a non-admin code', async () => {
    mockCookie('9999000011112222.deadbeef')
    expect(await isAdmin()).toBe(false)
  })
  it('false when no cookie', async () => {
    mockCookie(undefined)
    expect(await isAdmin()).toBe(false)
  })
})
