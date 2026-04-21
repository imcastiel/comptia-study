'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react'
import { type PBQStepDragMatch, type DragMatchItem } from '@/data/pbq-scenarios'
import { cn } from '@/lib/utils'

interface Props {
  step: PBQStepDragMatch
  onComplete: (isCorrect: boolean, detail: string) => void
}

// ── Draggable chip ──────────────────────────────────────────────────────────

function DraggableChip({ item, placed, disabled }: { item: DragMatchItem; placed: boolean; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: placed || disabled,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-[13px] font-semibold select-none transition-all',
        isDragging && 'opacity-30',
        placed && 'opacity-0 pointer-events-none',
        !placed && !disabled && 'cursor-grab active:cursor-grabbing bg-[var(--apple-blue)]/10 border-[var(--apple-blue)]/30 text-[var(--apple-blue)] hover:bg-[var(--apple-blue)]/15',
        disabled && !placed && 'cursor-default bg-[var(--apple-fill)] border-[var(--apple-separator)] text-[var(--apple-label-secondary)]',
      )}
    >
      {!placed && !disabled && <GripVertical className="w-3 h-3 opacity-50" />}
      {item.label}
    </div>
  )
}

// ── Drop target ─────────────────────────────────────────────────────────────

function DropTarget({
  target,
  placedItem,
  submitted,
  disabled,
  onRemove,
}: {
  target: { id: string; label: string; correctItemId: string }
  placedItem: DragMatchItem | null
  submitted: boolean
  disabled: boolean
  onRemove: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: target.id, disabled })

  const isCorrect = placedItem?.id === target.correctItemId

  return (
    <div className="flex items-center gap-2">
      {/* Port label */}
      <span className="text-[12px] font-mono font-semibold text-[var(--apple-label-secondary)] w-20 shrink-0 text-right">
        {target.label}
      </span>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 h-10 rounded-[10px] border-2 border-dashed flex items-center justify-center transition-colors',
          !placedItem && isOver && 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/8',
          !placedItem && !isOver && 'border-[var(--apple-separator)]',
          placedItem && !submitted && 'border-[var(--apple-blue)]/40 bg-[var(--apple-blue)]/5',
          submitted && isCorrect && 'border-[var(--apple-green)] bg-[rgba(52,199,89,0.08)]',
          submitted && !isCorrect && placedItem && 'border-[var(--apple-red)] bg-[rgba(255,59,48,0.08)]',
          submitted && !placedItem && 'border-[var(--apple-red)]/40 bg-[rgba(255,59,48,0.04)]',
        )}
      >
        {placedItem ? (
          <div className="flex items-center gap-1.5 px-3">
            {submitted && (
              isCorrect
                ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--apple-green)] shrink-0" />
                : <XCircle className="w-3.5 h-3.5 text-[var(--apple-red)] shrink-0" />
            )}
            <span
              className="text-[13px] font-semibold"
              style={{ color: submitted ? (isCorrect ? 'var(--apple-green)' : 'var(--apple-red)') : 'var(--apple-blue)' }}
            >
              {placedItem.label}
            </span>
            {!submitted && !disabled && (
              <button
                onClick={onRemove}
                className="ml-1 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-red)] text-[11px] leading-none"
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">
            {submitted ? '— missing —' : 'Drop here'}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Mobile: tap chip ─────────────────────────────────────────────────────────

function MobileChip({
  item, placed, selected, disabled, onTap,
}: { item: DragMatchItem; placed: boolean; selected: boolean; disabled: boolean; onTap: (id: string) => void }) {
  return (
    <button
      onClick={() => !placed && !disabled && onTap(item.id)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-[13px] font-semibold select-none transition-all',
        placed && 'opacity-0 pointer-events-none',
        selected && 'bg-[var(--apple-blue)] border-[var(--apple-blue)] text-white shadow-md',
        !placed && !selected && !disabled && 'bg-[var(--apple-blue)]/10 border-[var(--apple-blue)]/30 text-[var(--apple-blue)] active:bg-[var(--apple-blue)]/20',
        disabled && !placed && 'bg-[var(--apple-fill)] border-[var(--apple-separator)] text-[var(--apple-label-secondary)]',
      )}
    >
      {item.label}
    </button>
  )
}

// ── Mobile: tap slot ─────────────────────────────────────────────────────────

function MobileSlot({
  target, placedItem, submitted, hasSelection, onTap,
}: {
  target: { id: string; label: string; correctItemId: string }
  placedItem: DragMatchItem | null
  submitted: boolean
  hasSelection: boolean
  onTap: (targetId: string) => void
}) {
  const isCorrect = placedItem?.id === target.correctItemId
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-mono font-semibold text-[var(--apple-label-secondary)] w-20 shrink-0 text-right">
        {target.label}
      </span>
      <button
        onClick={() => !submitted && onTap(target.id)}
        disabled={submitted}
        className={cn(
          'flex-1 h-10 rounded-[10px] border-2 flex items-center justify-center transition-colors',
          !placedItem && hasSelection && 'border-solid border-[var(--apple-blue)] bg-[var(--apple-blue)]/8',
          !placedItem && !hasSelection && 'border-dashed border-[var(--apple-separator)]',
          placedItem && !submitted && 'border-solid border-[var(--apple-blue)]/40 bg-[var(--apple-blue)]/5',
          submitted && isCorrect && 'border-solid border-[var(--apple-green)] bg-[rgba(52,199,89,0.08)]',
          submitted && !isCorrect && placedItem && 'border-solid border-[var(--apple-red)] bg-[rgba(255,59,48,0.08)]',
          submitted && !placedItem && 'border-dashed border-[var(--apple-red)]/40 bg-[rgba(255,59,48,0.04)]',
        )}
      >
        {placedItem ? (
          <div className="flex items-center gap-1.5 px-3">
            {submitted && (isCorrect
              ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--apple-green)] shrink-0" />
              : <XCircle className="w-3.5 h-3.5 text-[var(--apple-red)] shrink-0" />
            )}
            <span className="text-[13px] font-semibold" style={{ color: submitted ? (isCorrect ? 'var(--apple-green)' : 'var(--apple-red)') : 'var(--apple-blue)' }}>
              {placedItem.label}
            </span>
            {!submitted && <span className="ml-1 text-[10px] text-[var(--apple-label-tertiary)]">tap to remove</span>}
          </div>
        ) : (
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">
            {submitted ? '— missing —' : hasSelection ? 'tap to place' : 'tap a chip first'}
          </span>
        )}
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function DragMatchStep({ step, onComplete }: Props) {
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [activeItem, setActiveItem] = useState<DragMatchItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Desktop only — no TouchSensor to avoid fighting with scroll
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  const placedItemIds = new Set(Object.values(placements))
  const allPlaced = step.targets.every((t) => placements[t.id])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = step.items.find((i) => i.id === event.active.id)
    setActiveItem(item ?? null)
  }, [step.items])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const itemId = active.id as string
    const targetId = over.id as string

    // Only drop onto valid targets
    if (!step.targets.find((t) => t.id === targetId)) return

    setPlacements((prev) => {
      const next = { ...prev }
      // Remove this item from any previous target
      for (const [tId, iId] of Object.entries(next)) {
        if (iId === itemId) delete next[tId]
      }
      // Remove whatever was in the destination target (swap back to pool)
      // (just clear it — user can drag it again)
      next[targetId] = itemId
      return next
    })
  }, [step.targets])

  const handleRemove = useCallback((targetId: string) => {
    setPlacements((prev) => { const next = { ...prev }; delete next[targetId]; return next })
  }, [])

  // Mobile tap handlers
  const handleTapChip = useCallback((itemId: string) => {
    setSelectedItemId((prev) => prev === itemId ? null : itemId)
  }, [])

  const handleTapSlot = useCallback((targetId: string) => {
    if (selectedItemId) {
      setPlacements((prev) => {
        const next = { ...prev }
        for (const [tId, iId] of Object.entries(next)) {
          if (iId === selectedItemId) delete next[tId]
        }
        next[targetId] = selectedItemId
        return next
      })
      setSelectedItemId(null)
    } else if (placements[targetId]) {
      handleRemove(targetId)
    }
  }, [selectedItemId, placements, handleRemove])

  const handleSubmit = useCallback(() => {
    if (!allPlaced) return
    const correctCount = step.targets.filter((t) => placements[t.id] === t.correctItemId).length
    const isCorrect = correctCount === step.targets.length
    setSubmitted(true)
    onComplete(isCorrect, `Matched ${correctCount}/${step.targets.length} correctly`)
  }, [allPlaced, placements, step.targets, onComplete])

  const allCorrect = step.targets.every((t) => placements[t.id] === t.correctItemId)

  const feedbackAndSubmit = (
    <>
      {submitted && (
        <div
          className="mb-5 rounded-[12px] p-4 border"
          style={{
            borderColor: allCorrect ? 'var(--apple-green)' : 'var(--apple-red)',
            backgroundColor: allCorrect ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          }}
        >
          <p className="text-[12px] font-semibold mb-1" style={{ color: allCorrect ? 'var(--apple-green)' : 'var(--apple-red)' }}>
            {allCorrect ? '✓ All correct!' : '✗ Some incorrect'}
          </p>
          <p className="text-[13px] text-foreground leading-relaxed">
            {allCorrect ? step.feedback.correct : step.feedback.incorrect}
          </p>
        </div>
      )}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allPlaced}
          className="w-full py-3 rounded-[12px] text-[14px] font-semibold transition-opacity disabled:opacity-40 bg-[var(--apple-blue)] text-white hover:opacity-90"
        >
          {allPlaced ? 'Check Answers' : `Place ${step.targets.length - Object.keys(placements).length} more…`}
        </button>
      )}
    </>
  )

  // ── Mobile: tap-to-select (no drag, no scroll conflict) ──────────────────────
  if (isMobile) {
    return (
      <div>
        <p className="text-[11px] text-[var(--apple-label-tertiary)] text-center mb-4">
          Tap a chip to select it, then tap a slot to place it
        </p>
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-2">
            {selectedItemId ? '✓ Selected — now tap a slot' : 'Tap to select'}
          </p>
          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-[var(--apple-fill)] rounded-[12px]">
            {step.items.map((item) => (
              <MobileChip
                key={item.id}
                item={item}
                placed={placedItemIds.has(item.id)}
                selected={selectedItemId === item.id}
                disabled={submitted}
                onTap={handleTapChip}
              />
            ))}
          </div>
        </div>
        <div className="mb-5 flex flex-col gap-2.5">
          <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-1">Slots</p>
          {step.targets.map((target) => {
            const placedItem = placements[target.id] ? step.items.find((i) => i.id === placements[target.id]) ?? null : null
            return (
              <MobileSlot
                key={target.id}
                target={target}
                placedItem={placedItem}
                submitted={submitted}
                hasSelection={!!selectedItemId}
                onTap={handleTapSlot}
              />
            )
          })}
        </div>
        {feedbackAndSubmit}
      </div>
    )
  }

  // ── Desktop: drag & drop ─────────────────────────────────────────────────────
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-2">Drag to match</p>
        <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-[var(--apple-fill)] rounded-[12px]">
          {step.items.map((item) => (
            <DraggableChip key={item.id} item={item} placed={placedItemIds.has(item.id)} disabled={submitted} />
          ))}
        </div>
      </div>
      <div className="mb-5 flex flex-col gap-2.5">
        <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-1">Drop zones</p>
        {step.targets.map((target) => {
          const placedItem = placements[target.id] ? step.items.find((i) => i.id === placements[target.id]) ?? null : null
          return (
            <DropTarget key={target.id} target={target} placedItem={placedItem} submitted={submitted} disabled={submitted} onRemove={() => handleRemove(target.id)} />
          )
        })}
      </div>
      {feedbackAndSubmit}
      <DragOverlay>
        {activeItem && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[var(--apple-blue)] text-white text-[13px] font-semibold shadow-lg">
            {activeItem.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
