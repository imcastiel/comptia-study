import Anthropic from '@anthropic-ai/sdk'

/**
 * AI-assisted accuracy review of existing published questions.
 *
 * The model is asked to flag only items it is confident are defective —
 * wrong keyed answers, explanations that contradict the key, outdated facts,
 * or genuinely ambiguous stems. Output lands in the content_flags review
 * queue; a human resolves or dismisses every flag in /admin/health.
 */

export interface ReviewQuestion {
  id: string
  stem: string
  choices: string // JSON [{ id, text, isCorrect }]
  correctAnswer: string // JSON "a" | ["a","c"]
  explanation: string
}

export interface AccuracyFlag {
  itemId: string
  code: 'wrong_answer_key' | 'bad_explanation' | 'outdated_fact' | 'ambiguous'
  severity: 'error' | 'warning'
  detail: string
}

const FLAG_SEVERITY: Record<AccuracyFlag['code'], AccuracyFlag['severity']> = {
  wrong_answer_key: 'error',
  bad_explanation: 'error',
  outdated_fact: 'warning',
  ambiguous: 'warning',
}

export function buildAccuracyPrompt(batch: ReviewQuestion[]): string {
  const items = batch.map((q, i) => {
    const choices = JSON.parse(q.choices) as Array<{ id: string; text: string }>
    const key = JSON.parse(q.correctAnswer)
    const keyIds = Array.isArray(key) ? key : [key]
    const choiceLines = choices
      .map((c) => `   ${keyIds.includes(c.id) ? '✓' : ' '} ${c.id}) ${c.text}`)
      .join('\n')
    return `${i}. ${q.stem}\n${choiceLines}\n   Explanation: ${q.explanation}`
  }).join('\n\n')

  return `You are a CompTIA A+ (220-1201/220-1202) subject-matter expert reviewing exam practice questions for factual accuracy. The keyed answer is marked with ✓.

For each question, check:
- wrong_answer_key: the keyed answer is factually incorrect, or a different option is the better answer
- bad_explanation: the explanation contradicts the keyed answer or teaches something false
- outdated_fact: the question tests information that is no longer true for the current exam version
- ambiguous: two or more options are equally defensible as written

Only flag items you are CONFIDENT are defective. Style preferences, difficulty opinions, and minor wording are NOT flags. Most questions should pass.

QUESTIONS (0-indexed):
${items}

Return ONLY a JSON array: [{ "index": <number>, "code": "<wrong_answer_key|bad_explanation|outdated_fact|ambiguous>", "reason": "<one sentence>" }]. Empty array if all pass.`
}

export function parseAccuracyResponse(text: string, batch: ReviewQuestion[]): AccuracyFlag[] {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  let parsed: unknown
  try { parsed = JSON.parse(match[0]) } catch { return [] }
  if (!Array.isArray(parsed)) return []

  const flags: AccuracyFlag[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) continue
    const { index, code, reason } = entry as { index?: unknown; code?: unknown; reason?: unknown }
    if (typeof index !== 'number' || index < 0 || index >= batch.length) continue
    if (typeof code !== 'string' || !(code in FLAG_SEVERITY)) continue
    flags.push({
      itemId: batch[index].id,
      code: code as AccuracyFlag['code'],
      severity: FLAG_SEVERITY[code as AccuracyFlag['code']],
      detail: typeof reason === 'string' ? reason : 'No reason given',
    })
  }
  return flags
}

export async function reviewAccuracyBatch(batch: ReviewQuestion[]): Promise<AccuracyFlag[]> {
  if (batch.length === 0) return []
  const client = new Anthropic()
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildAccuracyPrompt(batch) }],
  })
  const text = response.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return []
  return parseAccuracyResponse(text.text, batch)
}
