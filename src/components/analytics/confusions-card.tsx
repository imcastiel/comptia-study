'use client'

import { useEffect, useState } from 'react'
import { Shuffle, X, Check } from 'lucide-react'
import type { Confusion } from '@/app/api/insights/confusions/route'

/**
 * "Your usual traps" — wrong answers this user keeps choosing. Hidden
 * entirely until there are repeat distractors, so new accounts see no
 * empty shell.
 */
export function ConfusionsCard() {
  const [confusions, setConfusions] = useState<Confusion[]>([])

  useEffect(() => {
    fetch('/api/insights/confusions')
      .then((r) => (r.ok ? r.json() : { confusions: [] }))
      .then((d) => setConfusions(d.confusions ?? []))
      .catch(() => {})
  }, [])

  if (confusions.length === 0) return null

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-1">
        <Shuffle className="w-4 h-4" /> Your usual traps
      </p>
      <p className="text-[12px] text-[var(--apple-label-tertiary)] mb-4">
        Wrong answers you&apos;ve picked more than once — unlearning these is the fastest score gain available.
      </p>
      <div className="flex flex-col gap-3">
        {confusions.map((c) => (
          <div key={`${c.questionId}`} className="border-b border-[var(--apple-separator)] last:border-0 pb-3 last:pb-0">
            <p className="text-[13px] font-medium leading-snug mb-1.5">{c.stem}</p>
            <div className="flex flex-col gap-1 text-[12px]">
              <span className="flex items-center gap-1.5 text-[var(--apple-red)]">
                <X className="w-3.5 h-3.5 shrink-0" />
                You keep picking: {c.wrongChoice}
                <span className="text-[10px] font-semibold bg-[var(--apple-red)]/10 px-1.5 py-0.5 rounded-full shrink-0">{c.timesChosen}×</span>
              </span>
              <span className="flex items-center gap-1.5 text-[var(--apple-green)]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Correct: {c.correctChoice}
              </span>
            </div>
            <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-1">{c.topicTitle}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
