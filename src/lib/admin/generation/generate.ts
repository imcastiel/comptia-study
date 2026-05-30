import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Calls Claude with the assembled prompt and parses the JSON array of drafts.
export async function generateDrafts(prompt: string): Promise<unknown[]> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') throw new Error('No text response from AI')
  const match = text.text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('Could not parse JSON array from AI response')
  const parsed = JSON.parse(match[0])
  if (!Array.isArray(parsed)) throw new Error('AI did not return an array')
  return parsed
}
