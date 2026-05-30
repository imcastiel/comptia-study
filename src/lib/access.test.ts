import { describe, it, expect } from 'vitest'
import { classifyRoute, parseAdminCodes, isAdminCode } from '@/lib/access'

describe('classifyRoute', () => {
  it('marks login and auth APIs public', () => {
    expect(classifyRoute('/login')).toBe('public')
    expect(classifyRoute('/api/auth')).toBe('public')
    expect(classifyRoute('/api/auth/generate')).toBe('public')
  })
  it('marks admin routes admin', () => {
    expect(classifyRoute('/admin')).toBe('admin')
    expect(classifyRoute('/admin/generate')).toBe('admin')
    expect(classifyRoute('/api/admin/ping')).toBe('admin')
  })
  it('marks everything else protected', () => {
    expect(classifyRoute('/')).toBe('protected')
    expect(classifyRoute('/study')).toBe('protected')
  })
})

describe('admin code allowlist', () => {
  it('parses comma/space separated codes', () => {
    expect(parseAdminCodes('1111222233334444, 5555666677778888'))
      .toEqual(['1111222233334444', '5555666677778888'])
    expect(parseAdminCodes(undefined)).toEqual([])
  })
  it('matches only listed codes', () => {
    const codes = ['1111222233334444']
    expect(isAdminCode('1111222233334444', codes)).toBe(true)
    expect(isAdminCode('9999000011112222', codes)).toBe(false)
    expect(isAdminCode(null, codes)).toBe(false)
  })
})
