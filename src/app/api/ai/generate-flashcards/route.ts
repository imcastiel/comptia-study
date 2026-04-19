import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { topic, count = 8, context } = await req.json() as {
      topic: string
      count?: number
      context?: string
    }

    const prompt = `Generate ${count} CompTIA A+ flashcards for the topic: "${topic}"${context ? `\n\nAdditional context: ${context}` : ''}

Return ONLY a valid JSON array (no markdown, no explanation):

[
  {
    "front": "string — a clear, specific question or term",
    "back": "string — concise but complete answer (1-3 sentences max)"
  }
]

Requirements:
- Questions should test exam-relevant knowledge
- Mix of: definitions, "what does X do", "when would you use X", troubleshooting scenarios
- Back should be direct and memorable
- Avoid overly simple yes/no backs — explain WHY or HOW
- Cover different aspects of the topic (don't repeat the same concept)`

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 500 })
    }

    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not parse JSON from response' }, { status: 500 })
    }

    const cards = JSON.parse(jsonMatch[0]) as { front: string; back: string }[]
    return Response.json({ cards })
  } catch (err) {
    console.error('Generate flashcards error:', err)
    return Response.json({ error: 'Failed to generate flashcards' }, { status: 500 })
  }
}
