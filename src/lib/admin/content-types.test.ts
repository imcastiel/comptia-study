import { describe, it, expect } from 'vitest'
import { isContentType, validateQuestion, validateFlashcard } from '@/lib/admin/content-types'

describe('isContentType', () => {
  it('accepts questions and flashcards only', () => {
    expect(isContentType('questions')).toBe(true)
    expect(isContentType('flashcards')).toBe(true)
    expect(isContentType('labs')).toBe(false)
    expect(isContentType('x')).toBe(false)
  })
})

describe('validateQuestion', () => {
  const good = {
    topicId: 't1',
    type: 'single',
    stem: 'Q?',
    choices: [
      { id: 'a', text: 'A', isCorrect: false },
      { id: 'b', text: 'B', isCorrect: true },
    ],
    correctAnswer: 'b',
    explanation: 'because',
    difficulty: 2,
  }

  it('passes a valid single-answer question', () => {
    expect(validateQuestion(good)).toEqual({ ok: true })
  })

  it('fails when correctAnswer disagrees with choices', () => {
    expect(validateQuestion({ ...good, correctAnswer: 'a' }).ok).toBe(false)
  })

  it('fails with empty stem', () => {
    expect(validateQuestion({ ...good, stem: '  ' }).ok).toBe(false)
  })

  it('fails with no correct choice', () => {
    const choices = good.choices.map((c) => ({ ...c, isCorrect: false }))
    expect(validateQuestion({ ...good, choices, correctAnswer: 'b' }).ok).toBe(
      false
    )
  })
})

describe('validateFlashcard', () => {
  it('passes with front+back', () => {
    expect(
      validateFlashcard({ topicId: 't1', front: 'F', back: 'B', difficulty: 2 })
    ).toEqual({ ok: true })
  })

  it('fails with empty back', () => {
    expect(
      validateFlashcard({ topicId: 't1', front: 'F', back: '', difficulty: 2 })
        .ok
    ).toBe(false)
  })
})
