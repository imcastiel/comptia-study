'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeneratedCard {
  front: string
  back: string
}

interface FlippableCardProps {
  card: GeneratedCard
  index: number
}

function FlippableCard({ card, index }: FlippableCardProps) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="w-full text-left bg-card rounded-[12px] p-3.5 border border-[var(--apple-separator)] hover:border-[var(--apple-blue)]/40 transition-colors"
    >
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-bold text-[var(--apple-label-tertiary)] bg-[var(--apple-fill)] rounded-full px-1.5 py-0.5 shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-foreground mb-1">{card.front}</p>
          {flipped && (
            <p className="text-[12px] text-[var(--apple-label-secondary)] leading-relaxed border-t border-[var(--apple-separator)] pt-1.5 mt-1.5">
              {card.back}
            </p>
          )}
          {!flipped && (
            <p className="text-[10px] text-[var(--apple-blue)]">Tap to reveal answer</p>
          )}
        </div>
      </div>
    </button>
  )
}

export function GenerateFlashcardsButton() {
  const [expanded, setExpanded] = useState(false)
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(8)
  const [isGenerating, setIsGenerating] = useState(false)
  const [cards, setCards] = useState<GeneratedCard[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    setError(null)
    setCards(null)
    try {
      const res = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), count }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCards(data.cards)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [topic, count])

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--apple-purple)]/10 to-[var(--apple-green)]/10 border border-[var(--apple-purple)]/20 rounded-[14px] hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[var(--apple-purple)]/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[var(--apple-purple)]" />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-foreground">Generate AI Flashcards</p>
            <p className="text-[11px] text-[var(--apple-label-secondary)]">Create cards for any CompTIA A+ topic instantly</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[var(--apple-label-tertiary)]" />
          : <ChevronDown className="w-4 h-4 text-[var(--apple-label-tertiary)]" />
        }
      </button>

      {expanded && (
        <div className="mt-2 p-4 bg-card border border-[var(--apple-separator)] rounded-[14px]">
          {!cards ? (
            <>
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide block mb-1.5">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g., DNS troubleshooting, RAID levels, malware removal…"
                  className="w-full px-3 py-2 rounded-[10px] bg-[var(--apple-fill)] text-[13px] text-foreground placeholder-[var(--apple-label-tertiary)] outline-none border border-transparent focus:border-[var(--apple-blue)]/40 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide block mb-1.5">
                  Number of cards
                </label>
                <div className="flex gap-2">
                  {[5, 8, 12, 16].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={cn(
                        'flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors',
                        count === n
                          ? 'bg-[var(--apple-purple)] text-white'
                          : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-[12px] text-[var(--apple-red)] mb-3">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all',
                  isGenerating || !topic.trim()
                    ? 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] cursor-not-allowed'
                    : 'bg-[var(--apple-purple)] text-white hover:opacity-90'
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating {count} cards…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Flashcards
                  </>
                )}
              </button>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-foreground">
                  {cards.length} cards for &ldquo;{topic}&rdquo;
                </p>
                <button
                  onClick={() => setCards(null)}
                  className="flex items-center gap-1 text-[11px] text-[var(--apple-label-secondary)] hover:text-foreground"
                >
                  <RotateCcw className="w-3 h-3" />
                  Generate more
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {cards.map((card, i) => (
                  <FlippableCard key={i} card={card} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
