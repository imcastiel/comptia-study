import { describe, it, expect } from 'vitest'
import { assemblePrompt } from '@/lib/admin/generation/prompt-assembly'

describe('assemblePrompt', () => {
  const base = {
    contentType: 'flashcards' as const,
    masterPrompt: 'You are a flashcard author.',
    brief: 'TCP/UDP ports with mnemonics',
    options: { mnemonics: true, memoryMethods: true },
    count: 5,
    existing: [{ summary: '443 → HTTPS' }, { summary: '22 → SSH' }],
  }
  it('includes master prompt, brief, count, and existing items', () => {
    const p = assemblePrompt(base)
    expect(p).toContain('You are a flashcard author.')
    expect(p).toContain('TCP/UDP ports with mnemonics')
    expect(p).toContain('5')
    expect(p).toContain('443 → HTTPS')
    expect(p).toContain('22 → SSH')
  })
  it('instructs not to duplicate when existing items are present', () => {
    expect(assemblePrompt(base).toLowerCase()).toContain('do not duplicate')
  })
  it('asks for mnemonics when the option is set', () => {
    expect(assemblePrompt(base).toLowerCase()).toContain('mnemonic')
  })
  it('requests a JSON array output', () => {
    expect(assemblePrompt(base).toLowerCase()).toContain('json array')
  })
})
