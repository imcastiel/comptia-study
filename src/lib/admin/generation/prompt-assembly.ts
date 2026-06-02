import type { ContentType } from '@/lib/admin/content-types'

export interface ExistingItemSummary {
  summary: string
}

export interface AssembleInput {
  contentType: ContentType
  masterPrompt: string
  brief: string
  options: Record<string, boolean>
  count: number
  existing: ExistingItemSummary[]
}

const SHAPE: Record<ContentType, string> = {
  flashcards: `Each item: { "front": string, "back": string }`,
  questions: `Each item: { "stem": string, "choices": [{ "id": "a"|"b"|"c"|"d", "text": string, "isCorrect": boolean }], "correctAnswer": "a"|"b"|"c"|"d", "explanation": string, "difficulty": 1|2|3 }`,
  cheat_sheets: `Each item: { "title": string, "data": object }`,
  pbq_scenarios: `Each item: { "title": string, "data": object }`,
}

export function assemblePrompt(input: AssembleInput): string {
  const optionLines: string[] = []
  if (input.options.mnemonics) optionLines.push('- Include a vivid mnemonic for each item.')
  if (input.options.memoryMethods) optionLines.push('- Include a concrete memory method (chunking, association, story).')
  if (input.options.scenario) optionLines.push('- Frame questions as realistic troubleshooting scenarios.')

  const existingBlock = input.existing.length
    ? `\n\nEXISTING ITEMS (do not duplicate or contradict these; fill gaps and complement them):\n${input.existing.map((e) => `- ${e.summary}`).join('\n')}`
    : ''

  return `${input.masterPrompt}

TASK: Generate ${input.count} CompTIA A+ ${input.contentType} for this brief:
"${input.brief}"
${optionLines.length ? `\nRequirements:\n${optionLines.join('\n')}` : ''}${existingBlock}

Return ONLY a valid JSON array (no markdown, no prose). ${SHAPE[input.contentType]}`
}
