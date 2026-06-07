'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import type { ContentItem } from './content-library'
import { ContentDetail } from './content-detail'

/** Full-screen one-at-a-time reader for the currently loaded items.
 *  Arrow keys / buttons page through; Esc closes. */
export function ContentReader({
  items, startIndex, title, onClose, onEdit,
}: {
  items: ContentItem[]
  startIndex: number
  title?: string
  onClose: () => void
  onEdit: (item: ContentItem) => void
}) {
  const [i, setI] = useState(startIndex)
  const item = items[i]
  const atStart = i <= 0
  const atEnd = i >= items.length - 1

  const prev = useCallback(() => setI((n) => Math.max(0, n - 1)), [])
  const next = useCallback(() => setI((n) => Math.min(items.length - 1, n + 1)), [items.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex w-full max-w-2xl max-h-[88vh] flex-col rounded-[20px] bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[var(--apple-separator)] px-5 py-3">
          <div className="flex-1 min-w-0">
            {title && <div className="text-[11px] text-[var(--apple-label-tertiary)] truncate">{title}</div>}
            <div className="text-[13px] font-semibold">{i + 1} of {items.length}</div>
          </div>
          <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 rounded-full bg-[var(--apple-fill)] px-3 py-1.5 text-[12px] font-medium hover:opacity-80">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={onClose} aria-label="Close reader" className="rounded-full p-1.5 hover:bg-[var(--apple-fill)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pt-3">
          <span className="text-[11px]" style={{ color: item.published ? 'var(--apple-green)' : 'var(--apple-orange)' }}>
            {item.published ? '● live' : '○ draft'}
          </span>
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">{item.source}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ContentDetail item={item} />
        </div>

        <div className="flex items-center justify-between border-t border-[var(--apple-separator)] px-5 py-3">
          <button onClick={prev} disabled={atStart} className="flex items-center gap-1 text-[13px] font-medium text-[var(--apple-blue)] disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">← / → to navigate · Esc to close</span>
          <button onClick={next} disabled={atEnd} className="flex items-center gap-1 text-[13px] font-medium text-[var(--apple-blue)] disabled:opacity-30">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
