'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { WeakSpots } from '@/components/home/weak-spots'
import { PassProbabilityCard } from './pass-probability-card'
import { ProbabilityTrendChart } from './probability-trend-chart'
import { DomainBreakdown } from './domain-breakdown'
import { VelocityChart } from './velocity-chart'
import type { AnalyticsExam, AnalyticsResponse } from '@/app/api/analytics/route'

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-sm animate-pulse',
        className,
      )}
    />
  )
}

export function AnalyticsDashboard() {
  const [exams, setExams] = useState<AnalyticsExam[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/analytics')
      .then((r) => r.json() as Promise<AnalyticsResponse>)
      .then((data) => {
        if (!active) return
        const list = Array.isArray(data.exams) ? data.exams : []
        setExams(list)
        // Default to the first exam that has data, else the first exam.
        const withData = list.find((e) => e.latest) ?? list[0]
        setSelectedId(withData?.examId ?? null)
      })
      .catch(() => active && setExams([]))
    return () => {
      active = false
    }
  }, [])

  if (exams === null) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard className="h-[200px]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard className="h-[280px]" />
          <SkeletonCard className="h-[280px]" />
        </div>
        <SkeletonCard className="h-[320px]" />
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-8 shadow-sm text-center">
        <p className="text-[15px] font-semibold text-foreground mb-1">No progress data yet</p>
        <p className="text-[13px] text-[var(--apple-label-secondary)]">
          Take a practice test to start building your skill profile.
        </p>
      </div>
    )
  }

  const selected = exams.find((e) => e.examId === selectedId) ?? exams[0]
  const history = selected.history
  const latest = history[history.length - 1] ?? null
  const previous = history.length > 1 ? history[history.length - 2] : null

  return (
    <div className="flex flex-col gap-4">
      {/* Exam selector — only when more than one exam exists */}
      {exams.length > 1 && (
        <div className="flex gap-1 bg-[var(--apple-fill)] rounded-[10px] p-0.5 w-fit">
          {exams.map((e) => (
            <button
              key={e.examId}
              onClick={() => setSelectedId(e.examId)}
              className={cn(
                'px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-all duration-200',
                e.examId === selected.examId
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-[var(--apple-label-secondary)] hover:text-foreground',
              )}
            >
              {e.name}
              <span className="ml-1.5 text-[var(--apple-label-tertiary)] font-mono text-[11px]">{e.code}</span>
            </button>
          ))}
        </div>
      )}

      <div className="animate-fade-up">
        <PassProbabilityCard latest={latest} previous={previous} passingScore={selected.passingScore} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 animate-fade-up">
        <ProbabilityTrendChart history={history} />
        <DomainBreakdown domains={selected.domains} breakdown={selected.latest?.domainBreakdown ?? []} />
      </div>

      <div className="animate-fade-up">
        <VelocityChart domains={selected.domains} snapshots={selected.snapshots} />
      </div>

      <WeakSpots />
    </div>
  )
}
