'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buildMatchRound, isCorrectPair, scoreRound, type DrillFactLite, type MatchTile } from '@/lib/match-game'

const ROUND_SIZE = 6

export function MatchGrid({ facts, onComplete }: { facts: DrillFactLite[]; onComplete: (score: number) => void }) {
  const round = useMemo(() => buildMatchRound(facts, ROUND_SIZE), [facts])
  const tiles = useMemo(() => shuffleTogether(round.terms, round.values), [round])

  const [selected, setSelected] = useState<MatchTile | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const startRef = useRef(Date.now())

  const total = round.terms.length

  useEffect(() => {
    if (matched.size === total * 2 && total > 0) {
      const score = scoreRound({ pairs: total, mistakes, elapsedMs: Date.now() - startRef.current })
      onComplete(score)
    }
  }, [matched, total, mistakes, onComplete])

  function tileKey(t: MatchTile) { return `${t.factId}-${t.kind}` }

  function onTile(t: MatchTile) {
    const key = tileKey(t)
    if (matched.has(key)) return
    if (!selected) { setSelected(t); return }
    if (tileKey(selected) === key) { setSelected(null); return }

    if (isCorrectPair(selected, t)) {
      setMatched((m) => new Set([...m, key, tileKey(selected)]))
      setSelected(null)
    } else {
      setMistakes((n) => n + 1)
      setWrong(key)
      setTimeout(() => setWrong(null), 350)
      setSelected(null)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((t) => {
        const key = tileKey(t)
        const isMatched = matched.has(key)
        const isSelected = selected && tileKey(selected) === key
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => onTile(t)}
            disabled={isMatched}
            animate={wrong === key ? { x: [0, -6, 6, -4, 4, 0] } : isMatched ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              'rounded-[12px] p-3 text-[13px] font-medium min-h-[64px] flex items-center justify-center text-center border transition-colors',
              isMatched ? 'bg-[var(--apple-green)]/15 border-[var(--apple-green)]/30 text-[var(--apple-green)] opacity-60'
                : isSelected ? 'bg-[var(--apple-blue)]/15 border-[var(--apple-blue)] text-[var(--apple-blue)]'
                : 'bg-card border-[var(--apple-separator)] hover:bg-[var(--apple-fill)]'
            )}
          >
            {t.text}
          </motion.button>
        )
      })}
    </div>
  )
}

function shuffleTogether(a: MatchTile[], b: MatchTile[]): MatchTile[] {
  const all = [...a, ...b]
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]] }
  return all
}
