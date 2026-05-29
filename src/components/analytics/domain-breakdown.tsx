'use client'

import { motion } from 'framer-motion'
import type { AnalyticsDomain } from '@/app/api/analytics/route'
import type { DomainBreakdownEntry } from '@/lib/pass-probability'
import { domainColor } from './palette'

interface DomainBreakdownProps {
  domains: AnalyticsDomain[]
  breakdown: DomainBreakdownEntry[]
}

interface Row {
  domainId: string
  name: string
  weightPercent: number
  accuracy: number
  questionsSeen: number
  color: string
}

export function DomainBreakdown({ domains, breakdown }: DomainBreakdownProps) {
  const byId = new Map(breakdown.map((b) => [b.domainId, b]))
  const colorByDomain = new Map(domains.map((d, i) => [d.domainId, domainColor(i)]))

  const rows: Row[] = domains.map((d) => {
    const b = byId.get(d.domainId)
    return {
      domainId: d.domainId,
      name: `${d.number}. ${d.name}`,
      weightPercent: d.weightPercent,
      accuracy: b ? b.smoothedAccuracy : 0,
      questionsSeen: b ? b.questionsSeen : 0,
      color: colorByDomain.get(d.domainId) ?? 'var(--apple-blue)',
    }
  })

  // Weakest weighted domains first — where score gains are largest.
  rows.sort((a, b) => a.accuracy * a.weightPercent - b.accuracy * b.weightPercent)

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-4">
        Domain Mastery
        <span className="ml-2 font-normal text-[var(--apple-label-tertiary)] normal-case tracking-normal">
          weighted by exam blueprint
        </span>
      </h2>

      <div className="flex flex-col gap-3.5">
        {rows.map((r) => {
          const pct = Math.round(r.accuracy * 100)
          return (
            <div key={r.domainId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-foreground truncate pr-2">{r.name}</span>
                <span className="text-[11px] text-[var(--apple-label-tertiary)] shrink-0 tabular-nums">
                  {r.weightPercent}% of exam · {r.questionsSeen} answered
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-[8px] rounded-full bg-[var(--apple-fill)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: r.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-[12px] font-semibold shrink-0 tabular-nums w-9 text-right" style={{ color: r.color }}>
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
