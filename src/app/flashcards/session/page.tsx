'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StudyCard } from '@/components/flashcards/study-card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { qualityFromOutcome, type ReviewOutcome } from '@/lib/srs'

interface CardData { id: string; front: string; back: string; hint?: string | null; cardType: 'flashcard' | 'drill' }

function SessionInner() {
  const sp = useSearchParams()
  const domainId = sp.get('domainId')
  const setId = sp.get('setId')
  const direction = sp.get('direction')
  const mode = sp.get('mode')

  const [cards, setCards] = useState<CardData[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ got_it: 0, miss: 0 })
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (domainId) params.set('domainId', domainId)
    if (setId) params.set('setId', setId)
    if (direction) params.set('direction', direction)
    if (mode) params.set('mode', mode)
    fetch(`/api/flashcards?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const arr: CardData[] = (data.cards ?? []).map((c: CardData) => ({ ...c, cardType: c.cardType ?? 'flashcard' }))
        for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]] }
        setCards(arr); setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [domainId, setId, direction, mode])

  const handleOutcome = useCallback(async (outcome: ReviewOutcome) => {
    const card = cards[index]
    if (!card) return
    setStats((s) => ({ ...s, [outcome]: s[outcome] + 1 }))

    const quality = qualityFromOutcome(outcome)
    const payload = card.cardType === 'drill' ? { drillFactId: card.id, quality } : { flashcardId: card.id, quality }
    fetch('/api/flashcards/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})

    if (outcome === 'miss') {
      // Requeue the missed card at the end; the session only completes once
      // every card has been recalled, so a miss never ends it early.
      setCards((prev) => { const next = [...prev]; next.splice(index, 1); next.push(card); return next })
    } else if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
    }
  }, [cards, index])

  const backHref = setId ? `/flashcards/drills/${setId}` : '/flashcards'

  if (loading) return <Spinner />
  if (cards.length === 0) return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <p className="text-[18px] font-semibold mb-2">No cards to review</p>
      <Link href={backHref} className="text-[var(--apple-blue)] font-medium">← Back</Link>
    </div>
  )

  if (done) {
    const total = stats.got_it + stats.miss
    const pct = total ? Math.round((stats.got_it / total) * 100) : 0
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--apple-green)]/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[var(--apple-green)]" />
        </div>
        <h2 className="text-[24px] font-bold mb-2">Session Complete!</h2>
        <p className="text-[var(--apple-label-secondary)] mb-8">{stats.got_it}/{total} recalled ({pct}%)</p>
        <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs mx-auto">
          <div className="bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]"><p className="text-[20px] font-bold text-[var(--apple-green)]">{stats.got_it}</p><p className="text-[11px] text-[var(--apple-label-secondary)]">Got it</p></div>
          <div className="bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]"><p className="text-[20px] font-bold text-[var(--apple-red)]">{stats.miss}</p><p className="text-[11px] text-[var(--apple-label-secondary)]">Missed</p></div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href={backHref} className="px-5 py-2.5 bg-[var(--apple-fill)] rounded-full text-[14px] font-medium">Back</Link>
          <button onClick={() => { setIndex(0); setDone(false); setStats({ got_it: 0, miss: 0 }) }} className="px-5 py-2.5 bg-[var(--apple-blue)] text-white rounded-full text-[14px] font-medium">Study Again</button>
        </div>
      </div>
    )
  }

  const card = cards[index]
  const progress = (index / cards.length) * 100
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href={backHref} className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)] hover:text-foreground"><ArrowLeft className="w-4 h-4" />Exit</Link>
        <span className="text-[13px] font-medium text-[var(--apple-label-secondary)]">{index + 1} / {cards.length}</span>
      </div>
      <div className="w-full bg-[var(--apple-fill)] rounded-full h-1 mb-8 overflow-hidden">
        <div className="h-full bg-[var(--apple-blue)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <StudyCard key={card.id} front={card.front} back={card.back} hint={card.hint} onOutcome={handleOutcome} />
    </div>
  )
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" /></div>
}

export default function FlashcardSessionPage() {
  return <Suspense fallback={<Spinner />}><SessionInner /></Suspense>
}
