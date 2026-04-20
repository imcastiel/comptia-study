'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FlashcardCard } from '@/components/flashcards/flashcard-card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CardData {
  id: string
  front: string
  back: string
}

function FlashcardSessionInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const domainId = searchParams.get('domainId')
  const mode = searchParams.get('mode')

  const [cards, setCards] = useState<CardData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (domainId) params.set('domainId', domainId)
    if (mode) params.set('mode', mode)
    fetch(`/api/flashcards?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const arr: CardData[] = data.cards ?? []
        // Fisher-Yates shuffle for random card order each session
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        setCards(arr)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [domainId, mode])

  const handleRate = useCallback(async (quality: 1 | 3 | 4 | 5) => {
    const card = cards[currentIndex]
    if (!card) return

    const labelMap: Record<number, keyof typeof sessionStats> = { 1: 'again', 3: 'hard', 4: 'good', 5: 'easy' }
    setSessionStats((s) => ({ ...s, [labelMap[quality]]: s[labelMap[quality]] + 1 }))

    await fetch('/api/flashcards/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcardId: card.id, quality }),
    }).catch(() => {})

    if (quality === 1) {
      // Move card to end so it comes back this session
      setCards((prev) => {
        const next = [...prev]
        next.splice(currentIndex, 1)
        next.push(card)
        return next
      })
      // If this was the only card left, we're done
      if (cards.length === 1) setDone(true)
    } else if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [cards, currentIndex])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-[18px] font-semibold mb-2">No cards to review</p>
        <p className="text-[var(--apple-label-secondary)] mb-6">Check back later or choose a different deck.</p>
        <Link href="/flashcards" className="text-[var(--apple-blue)] font-medium">← Back to Decks</Link>
      </div>
    )
  }

  if (done) {
    const total = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy
    const known = sessionStats.good + sessionStats.easy
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--apple-green)]/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[var(--apple-green)]" />
        </div>
        <h2 className="text-[24px] font-bold mb-2">Session Complete!</h2>
        <p className="text-[var(--apple-label-secondary)] mb-8">
          {known}/{total} cards recalled correctly ({Math.round((known / total) * 100)}%)
        </p>
        <div className="grid grid-cols-4 gap-3 mb-8">
          {([
            { label: 'Again', count: sessionStats.again, color: 'var(--apple-red)' },
            { label: 'Hard', count: sessionStats.hard, color: 'var(--apple-orange)' },
            { label: 'Good', count: sessionStats.good, color: 'var(--apple-blue)' },
            { label: 'Easy', count: sessionStats.easy, color: 'var(--apple-green)' },
          ] as const).map((s) => (
            <div key={s.label} className="bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]">
              <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[11px] text-[var(--apple-label-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/flashcards"
            className="px-5 py-2.5 bg-[var(--apple-fill)] rounded-full text-[14px] font-medium"
          >
            Back to Decks
          </Link>
          <button
            onClick={() => { setCurrentIndex(0); setDone(false); setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 }) }}
            className="px-5 py-2.5 bg-[var(--apple-blue)] text-white rounded-full text-[14px] font-medium"
          >
            Study Again
          </button>
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const progress = ((currentIndex) / cards.length) * 100

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/flashcards" className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)] hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Exit
        </Link>
        <span className="text-[13px] font-medium text-[var(--apple-label-secondary)]">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--apple-fill)] rounded-full h-1 mb-8 overflow-hidden">
        <div
          className="h-full bg-[var(--apple-blue)] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <FlashcardCard
        key={card.id}
        front={card.front}
        back={card.back}
        onRate={handleRate}
      />
    </div>
  )
}

export default function FlashcardSessionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" /></div>}>
      <FlashcardSessionInner />
    </Suspense>
  )
}
