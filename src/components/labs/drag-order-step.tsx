'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, XCircle, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { type PBQStepDragOrder, type DragOrderItem } from '@/data/pbq-scenarios'
import { cn } from '@/lib/utils'

interface Props {
  step: PBQStepDragOrder
  onComplete: (isCorrect: boolean, detail: string) => void
}

// ── Sortable item ────────────────────────────────────────────────────────────

function SortableItem({
  item,
  index,
  submitted,
  isCorrect,
}: {
  item: DragOrderItem
  index: number
  submitted: boolean
  isCorrect: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: submitted,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-[12px] border bg-card transition-shadow',
        isDragging && 'shadow-lg opacity-90 z-10',
        submitted && isCorrect && 'border-[var(--apple-green)] bg-[rgba(52,199,89,0.06)]',
        submitted && !isCorrect && 'border-[var(--apple-red)] bg-[rgba(255,59,48,0.06)]',
        !submitted && 'border-[var(--apple-separator)] hover:border-[var(--apple-blue)]/40',
      )}
    >
      {/* Drag handle */}
      {!submitted && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-secondary)] touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Position number */}
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{
          backgroundColor: submitted
            ? isCorrect ? 'var(--apple-green)' : 'var(--apple-red)'
            : 'var(--apple-fill)',
          color: submitted ? 'white' : 'var(--apple-label-secondary)',
        }}
      >
        {index + 1}
      </span>

      <span className="text-[13px] leading-snug flex-1 text-foreground">{item.label}</span>

      {submitted && (
        isCorrect
          ? <CheckCircle2 className="w-4 h-4 text-[var(--apple-green)] shrink-0" />
          : <XCircle className="w-4 h-4 text-[var(--apple-red)] shrink-0" />
      )}
    </div>
  )
}

// ── Mobile: item with up/down buttons ───────────────────────────────────────

function MobileOrderItem({
  item, index, total, submitted, isCorrect, onMove,
}: {
  item: DragOrderItem
  index: number
  total: number
  submitted: boolean
  isCorrect: boolean
  onMove: (from: number, to: number) => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-[12px] border bg-card',
        submitted && isCorrect && 'border-[var(--apple-green)] bg-[rgba(52,199,89,0.06)]',
        submitted && !isCorrect && 'border-[var(--apple-red)] bg-[rgba(255,59,48,0.06)]',
        !submitted && 'border-[var(--apple-separator)]',
      )}
    >
      {/* Up/down buttons */}
      {!submitted && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-fill)] hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-fill)] hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{
          backgroundColor: submitted ? (isCorrect ? 'var(--apple-green)' : 'var(--apple-red)') : 'var(--apple-fill)',
          color: submitted ? 'white' : 'var(--apple-label-secondary)',
        }}
      >
        {index + 1}
      </span>

      <span className="text-[13px] leading-snug flex-1 text-foreground">{item.label}</span>

      {submitted && (
        isCorrect
          ? <CheckCircle2 className="w-4 h-4 text-[var(--apple-green)] shrink-0" />
          : <XCircle className="w-4 h-4 text-[var(--apple-red)] shrink-0" />
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function DragOrderStep({ step, onComplete }: Props) {
  const [items, setItems] = useState<DragOrderItem[]>(() => shuffle(step.items))
  const [submitted, setSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Desktop only — no TouchSensor to avoid scroll conflict on mobile
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  const handleMove = useCallback((from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    setItems((prev) => arrayMove(prev, from, to))
  }, [items.length])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const handleSubmit = useCallback(() => {
    const isAllCorrect = items.every((item, idx) => item.id === step.correctOrder[idx])
    const correctCount = items.filter((item, idx) => item.id === step.correctOrder[idx]).length
    setSubmitted(true)
    onComplete(isAllCorrect, `${correctCount}/${items.length} steps in correct position`)
  }, [items, step.correctOrder, onComplete])

  const isAllCorrect = submitted && items.every((item, idx) => item.id === step.correctOrder[idx])

  const feedbackAndSubmit = (
    <>
      {submitted && (
        <div
          className="mb-5 rounded-[12px] p-4 border"
          style={{
            borderColor: isAllCorrect ? 'var(--apple-green)' : 'var(--apple-red)',
            backgroundColor: isAllCorrect ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          }}
        >
          <p className="text-[12px] font-semibold mb-1" style={{ color: isAllCorrect ? 'var(--apple-green)' : 'var(--apple-red)' }}>
            {isAllCorrect ? '✓ Correct order!' : '✗ Some steps are out of order'}
          </p>
          <p className="text-[13px] text-foreground leading-relaxed">
            {isAllCorrect ? step.feedback.correct : step.feedback.incorrect}
          </p>
        </div>
      )}
      {!submitted && (
        <button onClick={handleSubmit} className="w-full py-3 rounded-[12px] text-[14px] font-semibold bg-[var(--apple-blue)] text-white hover:opacity-90 transition-opacity">
          Check Order
        </button>
      )}
    </>
  )

  // ── Mobile: up/down buttons (no drag, no scroll conflict) ────────────────────
  if (isMobile) {
    return (
      <>
        {!submitted && (
          <p className="text-[12px] text-[var(--apple-label-tertiary)] text-center mb-4">
            Use the <ChevronUp className="inline w-3 h-3" />/<ChevronDown className="inline w-3 h-3" /> buttons to reorder
          </p>
        )}
        <div className="flex flex-col gap-2 mb-5">
          {items.map((item, index) => (
            <MobileOrderItem
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              submitted={submitted}
              isCorrect={item.id === step.correctOrder[index]}
              onMove={handleMove}
            />
          ))}
        </div>
        {feedbackAndSubmit}
      </>
    )
  }

  // ── Desktop: drag to reorder ─────────────────────────────────────────────────
  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 mb-5">
            {items.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} submitted={submitted} isCorrect={item.id === step.correctOrder[index]} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!submitted && (
        <p className="text-[12px] text-[var(--apple-label-tertiary)] text-center mb-4">
          Drag items to reorder — grab the <GripVertical className="inline w-3 h-3" /> handle
        </p>
      )}
      {feedbackAndSubmit}
    </>
  )
}
