'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
  definition: string
}

interface TooltipPos {
  left: number
  anchorY: number   // viewport y of the anchor word
  above: boolean    // show tooltip above the word
}

export function TermTooltip({ children, definition }: Props) {
  const [pos, setPos] = useState<TooltipPos | null>(null)
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!wrapperRef.current) return
      const r = wrapperRef.current.getBoundingClientRect()
      const TOOLTIP_W = 230

      // Centre horizontally, clamp to viewport
      let left = r.left + r.width / 2
      left = Math.max(TOOLTIP_W / 2 + 8, Math.min(window.innerWidth - TOOLTIP_W / 2 - 8, left))

      // Show above the word unless we're too close to the top
      const above = r.top > 110

      setPos({ left, anchorY: above ? r.top : r.bottom, above })
    }, 500)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPos(null)
  }, [])

  const tooltip = pos && mounted ? (
    <div
      role="tooltip"
      className="pointer-events-none w-[230px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-primary)] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
      style={{
        position: 'fixed',
        left: pos.left,
        ...(pos.above
          ? { bottom: window.innerHeight - pos.anchorY + 10 }
          : { top: pos.anchorY + 10 }),
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
    >
      <p className="mb-1 text-[11px] font-semibold text-[var(--apple-blue)]">{children}</p>
      <p className="text-[12px] leading-relaxed text-[var(--apple-label-secondary)]">{definition}</p>
      {/* arrow */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={pos.above ? {
          top: '100%',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '5px solid var(--apple-separator)',
          width: 0, height: 0,
        } : {
          bottom: '100%',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '5px solid var(--apple-separator)',
          width: 0, height: 0,
        }}
      />
    </div>
  ) : null

  return (
    <span ref={wrapperRef} onMouseEnter={show} onMouseLeave={hide} className="inline">
      <span className="border-b border-dotted border-[var(--apple-blue)]/70 text-[var(--apple-blue)] cursor-help">
        {children}
      </span>
      {mounted && tooltip ? createPortal(tooltip, document.body) : null}
    </span>
  )
}
