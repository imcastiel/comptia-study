'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReviewOutcome } from '@/lib/srs'

const TIPS_STORAGE_KEY = 'flashcard-show-tips'

interface StudyCardProps {
  front: string
  back: string
  hint?: string | null
  onOutcome: (outcome: ReviewOutcome) => void
  className?: string
}

export function StudyCard({ front, back, hint, onOutcome, className }: StudyCardProps) {
  const [flipped, setFlipped] = useState(false)
  // Tips are off by default; remember the user's choice across cards/sessions.
  // StudyCard only mounts client-side (behind the session loading state), so
  // reading localStorage in the initializer is safe (no SSR/hydration pass).
  const [showTips, setShowTips] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem(TIPS_STORAGE_KEY) === '1' } catch { return false }
  })

  const toggleTips = useCallback(() => {
    setShowTips((v) => {
      const next = !v
      try { localStorage.setItem(TIPS_STORAGE_KEY, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }, [])

  const flip = useCallback(() => setFlipped(true), [])
  const rate = useCallback((o: ReviewOutcome) => { setFlipped(false); onOutcome(o) }, [onOutcome])

  const onCardClick = useCallback(() => {
    if (!flipped) flip()
    else rate('got_it')
  }, [flipped, flip, rate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); flip() }
      else if (flipped) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); rate('got_it') }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); rate('miss') }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [flipped, flip, rate])

  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div className="relative w-full max-w-lg" style={{ height: '280px' }}>
        {/* depth stack */}
        <div className="absolute inset-0 bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-sm" style={{ transform: 'translateY(10px) scale(0.96)', opacity: 0.5 }} />
        <div className="absolute inset-0 bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-sm" style={{ transform: 'translateY(5px) scale(0.98)', opacity: 0.7 }} />

        <motion.button
          type="button"
          onClick={onCardClick}
          className="absolute inset-0 w-full rounded-[20px] shadow-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)]"
          aria-label={flipped ? 'Answer shown — tap if you got it' : 'Tap to reveal the answer'}
          animate={{
            backgroundColor: flipped ? 'var(--apple-blue-bg, rgba(10,132,255,0.06))' : 'var(--card)',
          }}
          transition={{ duration: 0.2 }}
        >
          <p className={cn('text-[11px] font-semibold uppercase tracking-wide mb-4', flipped ? 'text-[var(--apple-blue)]' : 'text-[var(--apple-label-tertiary)]')}>
            {flipped ? 'Answer' : 'Question'}
          </p>
          <p className={cn('font-semibold text-foreground leading-snug', flipped ? 'text-[20px]' : 'text-[18px]')}>
            {flipped ? back : front}
          </p>
          {!flipped && hint && <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-3">Hint: {hint}</p>}
          {showTips && !flipped && <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-6">Tap or press Space to reveal</p>}
          {showTips && flipped && <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-6">Tap, Space, or → if you got it</p>}
        </motion.button>
      </div>

      {/* Tips toggle — off by default; instructions only show when enabled */}
      <button
        type="button"
        onClick={toggleTips}
        aria-pressed={showTips}
        className="flex items-center gap-1.5 text-[12px] text-[var(--apple-label-tertiary)] hover:text-foreground transition-colors"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        {showTips ? 'Hide tips' : 'Show tips'}
      </button>

      {/* Miss affordance — only when flipped */}
      <motion.button
        type="button"
        onClick={() => rate('miss')}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-red)] px-4 py-2 rounded-full bg-[var(--apple-red)]/10 hover:bg-[var(--apple-red)]/20 transition-colors"
        initial={false}
        animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: flipped ? 'auto' : 'none' }}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        I missed this
      </motion.button>
    </div>
  )
}
