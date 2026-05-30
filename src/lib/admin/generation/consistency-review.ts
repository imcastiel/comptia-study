import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ConsistencyFlag { index: number; conflictsWith: string; reason: string }

// Second pass: ask the model to compare new drafts against existing items and flag
// logical contradictions (e.g., a different keyed answer for the same concept).
export async function reviewConsistency(
  draftsJson: string,
  existingJson: string,
): Promise<ConsistencyFlag[]> {
  const prompt = `You are a QA reviewer for CompTIA A+ study content.
NEW DRAFTS (0-indexed JSON array):
${draftsJson}

EXISTING PUBLISHED ITEMS (JSON array, each has an "id"):
${existingJson}

Find drafts that CONTRADICT an existing item about the same concept (e.g., a different correct answer or incompatible fact). Ignore mere similarity or topic overlap — only flag genuine contradictions.
Return ONLY a JSON array: [{ "index": <draft index>, "conflictsWith": "<existing id>", "reason": "<short>" }]. Empty array if none.`
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return []
  const match = text.text.match(/\[[\s\S]*\]/)
  if (!match) return []
  try { const parsed = JSON.parse(match[0]); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}
