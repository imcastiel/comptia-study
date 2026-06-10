import { describe, it, expect } from 'vitest'
import { buildAccuracyPrompt, parseAccuracyResponse, type ReviewQuestion } from './accuracy-review'

const batch: ReviewQuestion[] = [
  {
    id: 'q-1',
    stem: 'Which port does HTTPS use?',
    choices: JSON.stringify([
      { id: 'a', text: '80', isCorrect: false },
      { id: 'b', text: '443', isCorrect: true },
    ]),
    correctAnswer: JSON.stringify('b'),
    explanation: 'HTTPS uses TCP 443.',
  },
  {
    id: 'q-2',
    stem: 'Which RAID level mirrors two drives?',
    choices: JSON.stringify([
      { id: 'a', text: 'RAID 0', isCorrect: false },
      { id: 'b', text: 'RAID 1', isCorrect: true },
    ]),
    correctAnswer: JSON.stringify('b'),
    explanation: 'RAID 1 mirrors.',
  },
]

describe('buildAccuracyPrompt', () => {
  it('marks the keyed answer and indexes items', () => {
    const prompt = buildAccuracyPrompt(batch)
    expect(prompt).toContain('0. Which port does HTTPS use?')
    expect(prompt).toContain('✓ b) 443')
    expect(prompt).toContain('  a) 80')
    expect(prompt).toContain('1. Which RAID level mirrors two drives?')
  })
})

describe('parseAccuracyResponse', () => {
  it('maps indices back to item ids with severities', () => {
    const flags = parseAccuracyResponse(
      'Here are the issues:\n[{"index":1,"code":"wrong_answer_key","reason":"RAID 1 is correct but option text disagrees"}]',
      batch,
    )
    expect(flags).toEqual([{
      itemId: 'q-2',
      code: 'wrong_answer_key',
      severity: 'error',
      detail: 'RAID 1 is correct but option text disagrees',
    }])
  })

  it('assigns warning severity to outdated/ambiguous codes', () => {
    const flags = parseAccuracyResponse('[{"index":0,"code":"ambiguous","reason":"two defensible options"}]', batch)
    expect(flags[0].severity).toBe('warning')
  })

  it('drops out-of-range indices, unknown codes, and junk entries', () => {
    const flags = parseAccuracyResponse(
      '[{"index":9,"code":"wrong_answer_key","reason":"x"},{"index":0,"code":"style","reason":"x"},"junk",{"index":1,"code":"outdated_fact"}]',
      batch,
    )
    expect(flags).toEqual([{ itemId: 'q-2', code: 'outdated_fact', severity: 'warning', detail: 'No reason given' }])
  })

  it('returns empty for non-JSON or empty responses', () => {
    expect(parseAccuracyResponse('All questions look correct.', batch)).toEqual([])
    expect(parseAccuracyResponse('[]', batch)).toEqual([])
  })
})
