import { questions, flashcards } from '@/db/schema'

export const CONTENT_TYPES = ['questions', 'flashcards'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export function isContentType(t: string): t is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(t)
}

export const TABLES = { questions, flashcards } as const

export type ValidationResult = { ok: true } | { ok: false; error: string }

export interface QuestionChoice {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuestionPayload {
  topicId: string
  type: string
  stem: string
  choices: QuestionChoice[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: number
  tags?: string | null
}

export function validateQuestion(q: QuestionPayload): ValidationResult {
  if (!q.topicId) {
    return { ok: false, error: 'topicId is required' }
  }

  if (!q.stem || !q.stem.trim()) {
    return { ok: false, error: 'stem is required' }
  }

  if (!q.explanation || !q.explanation.trim()) {
    return { ok: false, error: 'explanation is required' }
  }

  if (!Array.isArray(q.choices) || q.choices.length < 2) {
    return { ok: false, error: 'at least 2 choices required' }
  }

  if (q.difficulty < 1 || q.difficulty > 3) {
    return { ok: false, error: 'difficulty must be 1–3' }
  }

  const correctFromChoices = q.choices
    .filter((c) => c.isCorrect)
    .map((c) => c.id)
    .sort()

  if (correctFromChoices.length === 0) {
    return { ok: false, error: 'at least one correct choice required' }
  }

  const correctAnswer = (
    Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]
  )
    .slice()
    .sort()

  if (JSON.stringify(correctFromChoices) !== JSON.stringify(correctAnswer)) {
    return {
      ok: false,
      error: 'correctAnswer must match the choices marked correct',
    }
  }

  return { ok: true }
}

export interface FlashcardPayload {
  topicId: string
  front: string
  back: string
  difficulty: number
  tags?: string | null
}

export function validateFlashcard(f: FlashcardPayload): ValidationResult {
  if (!f.topicId) {
    return { ok: false, error: 'topicId is required' }
  }

  if (!f.front || !f.front.trim()) {
    return { ok: false, error: 'front is required' }
  }

  if (!f.back || !f.back.trim()) {
    return { ok: false, error: 'back is required' }
  }

  return { ok: true }
}
