/**
 * Structural linting for study content (questions & flashcards).
 *
 * Pure functions so the same rules run everywhere: the `lint:content` CLI,
 * the admin content-health view, and (eventually) CI for contributed content.
 * Severity semantics: `error` = actively misleading or unscoreable, should be
 * fixed or unpublished; `warning` = quality concern worth a human look.
 */

export type LintSeverity = 'error' | 'warning'

export interface LintIssue {
  code: string
  severity: LintSeverity
  message: string
}

export interface QuestionLintInput {
  id: string
  type: string
  stem: string
  choices: string // JSON: [{ id, text, isCorrect }]
  correctAnswer: string // JSON: "a" | ["a","c"]
  explanation: string
}

export interface FlashcardLintInput {
  id: string
  front: string
  back: string
}

interface Choice {
  id: string
  text: string
  isCorrect: boolean
}

/** Cards longer than this read as cram sheets, not flashcards — split them. */
export const FLASHCARD_BACK_MAX = 600
export const FLASHCARD_FRONT_MAX = 200
export const STEM_MAX = 600
export const EXPLANATION_MIN = 20

const issue = (code: string, severity: LintSeverity, message: string): LintIssue => ({ code, severity, message })

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * Choice texts keep their symbols: in this domain `+12V` vs `-12V`, `>` vs
 * `>>`, and `~/x` vs `/x` are legitimate, deliberately-similar distractors.
 * Only case and whitespace are insignificant.
 */
function normalizeChoice(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function parseChoices(raw: string): Choice[] | null {
  try {
    const v = JSON.parse(raw)
    if (!Array.isArray(v)) return null
    return v.filter((c): c is Choice => c && typeof c.id === 'string' && typeof c.text === 'string')
  } catch {
    return null
  }
}

function parseAnswerIds(raw: string): string[] | null {
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v.map(String)
    if (typeof v === 'string') return [v]
    return null
  } catch {
    return null
  }
}

export function lintQuestion(q: QuestionLintInput): LintIssue[] {
  const issues: LintIssue[] = []

  if (!q.stem.trim()) issues.push(issue('empty_stem', 'error', 'Question stem is empty'))
  else if (q.stem.length > STEM_MAX) issues.push(issue('stem_too_long', 'warning', `Stem is ${q.stem.length} chars (max ${STEM_MAX})`))

  if (!q.explanation.trim()) issues.push(issue('missing_explanation', 'error', 'No explanation — learners get no feedback on this question'))
  else if (q.explanation.trim().length < EXPLANATION_MIN) issues.push(issue('explanation_too_short', 'warning', 'Explanation is too short to teach anything'))

  const choices = parseChoices(q.choices)
  if (choices === null) {
    issues.push(issue('choices_unparseable', 'error', 'Choices are not valid JSON'))
    return issues
  }

  if (choices.length < 2) {
    issues.push(issue('too_few_choices', 'error', `Only ${choices.length} choice(s)`))
    return issues
  }
  if (choices.length !== 4) {
    issues.push(issue('choice_count_unusual', 'warning', `${choices.length} choices — A+ questions normally have 4`))
  }

  const seenTexts = new Set<string>()
  for (const c of choices) {
    const norm = normalizeChoice(c.text)
    if (seenTexts.has(norm)) {
      issues.push(issue('duplicate_choice_text', 'error', `Duplicate choice text: “${c.text.trim()}”`))
      break
    }
    seenTexts.add(norm)
  }

  const answerIds = parseAnswerIds(q.correctAnswer)
  if (answerIds === null) {
    issues.push(issue('answer_unparseable', 'error', 'Correct answer is not valid JSON'))
    return issues
  }

  const choiceIds = new Set(choices.map((c) => c.id))
  const missing = answerIds.filter((id) => !choiceIds.has(id))
  if (missing.length > 0) {
    issues.push(issue('answer_not_in_choices', 'error', `Correct answer “${missing.join(', ')}” is not a choice id`))
    return issues
  }

  // The choices carry their own isCorrect flags — a second source of truth.
  // Scoring uses correctAnswer, but any disagreement means one of them lies.
  const flagged = new Set(choices.filter((c) => c.isCorrect).map((c) => c.id))
  const answered = new Set(answerIds)
  const agree = flagged.size === answered.size && [...flagged].every((id) => answered.has(id))
  if (!agree) {
    issues.push(issue('answer_flag_mismatch', 'error', 'correctAnswer disagrees with the choices’ isCorrect flags'))
  }

  if (q.type === 'single_choice' && answerIds.length !== 1) {
    issues.push(issue('wrong_answer_count_for_type', 'error', `single_choice with ${answerIds.length} correct answers`))
  }
  if (q.type === 'multiple_choice' && answerIds.length < 2) {
    issues.push(issue('wrong_answer_count_for_type', 'error', 'multiple_choice with fewer than 2 correct answers'))
  }

  return issues
}

export function lintFlashcard(f: FlashcardLintInput): LintIssue[] {
  const issues: LintIssue[] = []

  if (!f.front.trim()) issues.push(issue('empty_front', 'error', 'Card front is empty'))
  else if (f.front.length > FLASHCARD_FRONT_MAX) issues.push(issue('front_too_long', 'warning', `Front is ${f.front.length} chars (max ${FLASHCARD_FRONT_MAX})`))

  if (!f.back.trim()) issues.push(issue('empty_back', 'error', 'Card back is empty'))
  else if (f.back.length > FLASHCARD_BACK_MAX) {
    issues.push(issue('back_too_long', 'warning', `Back is ${f.back.length} chars (max ${FLASHCARD_BACK_MAX}) — split into atomic cards`))
  }

  return issues
}

/**
 * Group items whose normalized text collides. Returns only groups of 2+,
 * each as the list of colliding ids (insertion order preserved).
 */
export function findDuplicates(items: Array<{ id: string; text: string }>): string[][] {
  const byNorm = new Map<string, string[]>()
  for (const item of items) {
    const norm = normalize(item.text)
    if (!norm) continue
    byNorm.set(norm, [...(byNorm.get(norm) ?? []), item.id])
  }
  return [...byNorm.values()].filter((ids) => ids.length > 1)
}
