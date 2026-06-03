'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { MatchGrid } from '@/components/flashcards/match-grid'
import type { DrillFactLite } from '@/lib/match-game'

export default function MatchPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = use(params)
  const [facts, setFacts] = useState<DrillFactLite[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<number | null>(null)
  const [round, setRound] = useState(0)

  useEffect(() => {
    fetch(`/api/drills/${setId}`).then((r) => r.json()).then((data) => {
      setFacts((data.cards ?? []).map((c: { id: string; term: string; value: string }) => ({ id: c.id, term: c.term, value: c.value })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [setId])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/flashcards/drills/${setId}`} className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)] hover:text-foreground"><ArrowLeft className="w-4 h-4" />Exit</Link>
        <span className="text-[13px] font-medium text-[var(--apple-label-secondary)]">Match</span>
      </div>

      {score === null ? (
        <MatchGrid key={round} facts={facts} onComplete={setScore} />
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[var(--apple-orange)]/15 flex items-center justify-center mx-auto mb-4"><Trophy className="w-8 h-8 text-[var(--apple-orange)]" /></div>
          <h2 className="text-[24px] font-bold mb-1">Round complete!</h2>
          <p className="text-[var(--apple-label-secondary)] mb-8">Score: <span className="font-bold text-foreground">{score}</span></p>
          <button onClick={() => { setScore(null); setRound((r) => r + 1) }} className="px-5 py-2.5 bg-[var(--apple-blue)] text-white rounded-full text-[14px] font-medium">Play again</button>
        </div>
      )}
    </div>
  )
}
