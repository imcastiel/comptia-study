'use client'

import type { AnalyticsData } from './admin-dashboard'

export function ReadinessCard({ readiness }: { readiness: AnalyticsData['readiness'] }) {
  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--apple-label-secondary)] mb-4">Exam readiness</h2>
      <div className="flex flex-col gap-4">
        {readiness.map((ex) => {
          const total = ex.count || 1
          const pct = (n: number) => Math.round((n / total) * 100)
          return (
            <div key={ex.examId}>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="font-medium">{ex.name} <span className="text-[var(--apple-label-tertiary)]">· {ex.code}</span></span>
                <span className="text-[var(--apple-label-secondary)]">avg {ex.avgPredictedScore}/900 · {ex.count} users</span>
              </div>
              <div className="flex h-[10px] rounded-full overflow-hidden bg-[var(--apple-fill)]">
                <div style={{ width: `${pct(ex.buckets.high)}%`, backgroundColor: 'var(--apple-green)' }} />
                <div style={{ width: `${pct(ex.buckets.mid)}%`, backgroundColor: 'var(--apple-orange)' }} />
                <div style={{ width: `${pct(ex.buckets.low)}%`, backgroundColor: 'var(--apple-red)' }} />
              </div>
              <div className="flex gap-3 text-[11px] text-[var(--apple-label-tertiary)] mt-1">
                <span>🟢 ready {ex.buckets.high}</span><span>🟠 borderline {ex.buckets.mid}</span><span>🔴 not ready {ex.buckets.low}</span>
              </div>
            </div>
          )
        })}
        {readiness.every((e) => e.count === 0) && <p className="text-[13px] text-[var(--apple-label-tertiary)]">No pass-probability data yet.</p>}
      </div>
    </div>
  )
}
