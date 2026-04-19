'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FlashcardCardProps {
  front: string
  back: string
  onRate?: (quality: 1 | 3 | 4 | 5) => void
  className?: string
}

const QUALITY_BUTTONS = [
  { label: 'Again', value: 1 as const, color: 'var(--apple-red)', bg: 'bg-[var(--apple-red)]/10 hover:bg-[var(--apple-red)]/20', text: 'text-[var(--apple-red)]', description: "Didn't know" },
  { label: 'Hard', value: 3 as const, color: 'var(--apple-orange)', bg: 'bg-[var(--apple-orange)]/10 hover:bg-[var(--apple-orange)]/20', text: 'text-[var(--apple-orange)]', description: 'Struggled' },
  { label: 'Good', value: 4 as const, color: 'var(--apple-blue)', bg: 'bg-[var(--apple-blue)]/10 hover:bg-[var(--apple-blue)]/20', text: 'text-[var(--apple-blue)]', description: 'Got it' },
  { label: 'Easy', value: 5 as const, color: 'var(--apple-green)', bg: 'bg-[var(--apple-green)]/10 hover:bg-[var(--apple-green)]/20', text: 'text-[var(--apple-green)]', description: 'Perfect recall' },
]

export function FlashcardCard({ front, back, onRate, className }: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    setFlipped((f) => !f)
  }

  function handleRate(quality: 1 | 3 | 4 | 5) {
    setFlipped(false)
    onRate?.(quality)
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleFlip() : undefined}
        aria-label={flipped ? 'Card showing answer — click to flip back' : 'Card showing question — click to reveal answer'}
      >
        <motion.div
          className="relative w-full"
          style={{ transformStyle: 'preserve-3d', height: '260px' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-lg p-8 flex flex-col items-center justify-center text-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-[11px] font-semibold text-[var(--apple-label-tertiary)] uppercase tracking-wide mb-4">Question</p>
            <p className="text-[18px] font-semibold text-foreground leading-snug">{front}</p>
            <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-6">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-[var(--apple-blue)]/5 border border-[var(--apple-blue)]/20 rounded-[20px] shadow-lg p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-[11px] font-semibold text-[var(--apple-blue)] uppercase tracking-wide mb-4">Answer</p>
            <p className="text-[16px] text-foreground leading-relaxed">{back}</p>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons — only show when flipped */}
      <motion.div
        className="flex items-center gap-2 w-full max-w-lg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: flipped ? 'auto' : 'none' }}
      >
        {QUALITY_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={(e) => { e.stopPropagation(); handleRate(btn.value) }}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-3 px-2 rounded-[12px] transition-all duration-150 active:scale-95',
              btn.bg
            )}
          >
            <span className={cn('text-[14px] font-semibold', btn.text)}>{btn.label}</span>
            <span className="text-[10px] text-[var(--apple-label-tertiary)]">{btn.description}</span>
          </button>
        ))}
      </motion.div>
    </div>
  )
}
