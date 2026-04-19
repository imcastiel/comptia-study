'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompleteButtonProps {
  topicId: string
  initialStatus: 'not_started' | 'in_progress' | 'completed' | 'needs_review'
}

export function CompleteButton({ topicId, initialStatus }: CompleteButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const isCompleted = status === 'completed'

  async function toggle() {
    setLoading(true)
    const newStatus = isCompleted ? 'in_progress' : 'completed'
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, status: newStatus }),
      })
      setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200',
        isCompleted
          ? 'bg-[var(--apple-green)]/15 text-[var(--apple-green)] hover:bg-[var(--apple-green)]/25'
          : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill-secondary)] hover:text-foreground',
        loading && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {isCompleted ? 'Completed' : 'Mark as complete'}
    </button>
  )
}
