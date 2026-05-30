import { describe, it, expect } from 'vitest'
import { normalize, similarity, flagDuplicates } from '@/lib/admin/generation/dedup'

describe('normalize', () => {
  it('lowercases and strips punctuation/extra space', () => {
    expect(normalize('  Port 443 → HTTPS! ')).toBe('port 443 https')
  })
})

describe('similarity', () => {
  it('is 1 for identical, lower for different', () => {
    expect(similarity('port 443 https', 'port 443 https')).toBe(1)
    expect(similarity('port 443 https', 'port 22 ssh')).toBeLessThan(0.5)
  })
})

describe('flagDuplicates', () => {
  it('flags a draft near an existing item', () => {
    const drafts = [{ key: 'd1', text: '443 maps to HTTPS' }, { key: 'd2', text: '69 is TFTP' }]
    const existing = [{ id: 'e1', text: '443 → HTTPS' }]
    const flags = flagDuplicates(drafts, existing, 0.5)
    expect(flags.d1).toBe('e1')
    expect(flags.d2).toBeUndefined()
  })
})
