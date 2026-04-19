import Anthropic from '@anthropic-ai/sdk'
import { type PBQScenario, type PBQCategory } from '@/data/pbq-scenarios'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { category, difficulty = 2 } = await req.json() as {
      category: PBQCategory
      difficulty?: 1 | 2 | 3
    }

    const categoryDescriptions: Record<PBQCategory, string> = {
      networking: 'network troubleshooting, TCP/IP, DHCP, DNS, Wi-Fi, SOHO networks',
      security: 'malware removal, social engineering, workstation hardening, wireless security',
      os: 'Windows OS troubleshooting, CLI commands, boot issues, application problems',
      hardware: 'POST failures, RAM, storage, printers, power supply diagnosis',
      mobile: 'mobile device issues, battery, connectivity, iOS/Android troubleshooting',
    }

    const difficultyNames = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' }

    const prompt = `Generate a CompTIA A+ Performance-Based Question (PBQ) scenario for the "${category}" category (${categoryDescriptions[category]}).

Difficulty: ${difficultyNames[difficulty]} (${difficulty}/3)

Return ONLY a valid JSON object matching this exact TypeScript interface (no markdown, no explanation):

{
  "id": "ai-{category}-{timestamp}",  // e.g., "ai-networking-1711234567"
  "title": "string — concise scenario title",
  "category": "${category}",
  "difficulty": ${difficulty},
  "estimatedMinutes": number (4-12),
  "objectives": ["string"] // CompTIA A+ objective IDs like "5.5" or "2.4"
  "examCode": "220-1201" | "220-1202" | "both",
  "summary": "string — 1 sentence description shown on the card",
  "context": "string — 2-4 sentence situation setup. Include who reported it, what symptoms they see, and what you already know.",
  "steps": [  // 4-6 steps
    {
      "id": "s1",
      "prompt": "string — the question/decision the technician must make",
      "toolOutput": {  // OPTIONAL — only include if it makes sense (CLI output, error messages)
        "label": "string — e.g. ipconfig output",
        "content": "string — pre-formatted text output"
      },
      "choices": [  // EXACTLY 4 choices
        {
          "id": "a",
          "text": "string — the action/answer",
          "isCorrect": boolean,  // exactly 1 must be true
          "feedback": "string — 2-3 sentences explaining why correct or incorrect. Reference CompTIA concepts."
        }
      ]
    }
  ]
}

Requirements:
- Exactly one correct choice per step
- Feedback must be educational and explain the reasoning, not just say "correct/incorrect"
- Steps should build on each other logically (like a real troubleshooting scenario)
- Wrong choices should be plausible mistakes a technician might make
- Use realistic tool outputs when applicable (ipconfig, netstat, Event Viewer error, etc.)
- The scenario should test understanding, not memorization
- Replace {timestamp} with: ${Date.now()}`

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 500 })
    }

    // Extract JSON from response (handles cases where Claude adds surrounding text)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not parse JSON from response' }, { status: 500 })
    }

    const scenario = JSON.parse(jsonMatch[0]) as PBQScenario
    return Response.json({ scenario })
  } catch (err) {
    console.error('Generate scenario error:', err)
    return Response.json({ error: 'Failed to generate scenario' }, { status: 500 })
  }
}
