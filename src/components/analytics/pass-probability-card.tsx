'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import type { AnalyticsProbabilityPoint } from '@/app/api/analytics/route'
import type { DomainBreakdownEntry } from '@/lib/pass-probability'

interface PassProbabilityCardProps {
  latest: AnalyticsProbabilityPoint | null
  previous: AnalyticsProbabilityPoint | null
  passingScore: number
  maxScore?: number
  domainBreakdown?: DomainBreakdownEntry[]
}

function bandColor(probability: number): string {
  if (probability >= 0.7) return 'var(--apple-green)'
  if (probability >= 0.45) return 'var(--apple-orange)'
  return 'var(--apple-red)'
}

function bandLabel(probability: number): string {
  if (probability >= 0.7) return 'On track to pass'
  if (probability >= 0.45) return 'Borderline — keep pushing'
  return 'Not ready yet'
}

export function PassProbabilityCard({
  latest,
  previous,
  passingScore,
  maxScore = 900,
  domainBreakdown,
}: PassProbabilityCardProps) {
  if (!latest) {
    return (
      <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-6 shadow-sm">
        <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-2">
          Pass Probability
        </h2>
        <p className="text-[14px] text-[var(--apple-label-secondary)] mb-3">
          Complete a practice test to unlock your projected pass probability and score.
        </p>
        <Link href="/practice" className="text-[13px] font-semibold text-[var(--apple-blue)] hover:underline">
          Start a quick drill →
        </Link>
      </div>
    )
  }

  const pct = Math.round(latest.probability * 100)
  const color = bandColor(latest.probability)
  const predicted = latest.predictedScore ?? 0
  const delta = previous ? pct - Math.round(previous.probability * 100) : null

  // Honesty about coverage: how many domains actually have enough answers
  // to inform this number. Thin data gets an explicit caveat, not a hedge.
  const breakdown = domainBreakdown ?? []
  const domainsWithData = breakdown.filter((b) => b.questionsSeen >= 3).length
  const lowConfidence = latest.confidence < 0.3

  // SVG ring geometry
  const size = 132
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * latest.probability

  // Predicted score position along the 0..maxScore track
  const scorePct = Math.min(predicted / maxScore, 1) * 100
  const passPct = (passingScore / maxScore) * 100

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          Pass Probability
        </h2>
        {delta !== null && (
          <span
            className="inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: delta > 0 ? 'var(--apple-green)' : delta < 0 ? 'var(--apple-red)' : 'var(--apple-label-secondary)',
              backgroundColor: delta > 0 ? 'color-mix(in oklab, var(--apple-green) 12%, transparent)' : delta < 0 ? 'color-mix(in oklab, var(--apple-red) 12%, transparent)' : 'var(--apple-fill)',
            }}
          >
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta > 0 ? '+' : ''}{delta} pts
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Probability ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--apple-fill)"
              strokeWidth={stroke}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - dash }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[34px] font-bold tracking-tight leading-none" style={{ color }}>
              {pct}<span className="text-[18px]">%</span>
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold mb-3" style={{ color }}>
            {bandLabel(latest.probability)}
          </p>

          {/* Predicted score track */}
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[12px] text-[var(--apple-label-secondary)]">Projected score</span>
            <span className="text-[13px] font-semibold text-foreground tabular-nums">
              {predicted} <span className="text-[var(--apple-label-tertiary)] font-normal">/ {maxScore}</span>
            </span>
          </div>
          <div className="relative h-[8px] rounded-full bg-[var(--apple-fill)] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${scorePct}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {/* Passing threshold marker */}
          <div className="relative h-4 mt-0.5">
            <div
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${passPct}%` }}
            >
              <div className="w-px h-2 bg-[var(--apple-label-tertiary)]" />
              <span className="text-[10px] text-[var(--apple-label-tertiary)] whitespace-nowrap">
                pass {passingScore}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex-1 h-[4px] rounded-full bg-[var(--apple-fill)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--apple-label-tertiary)]"
                style={{ width: `${Math.round(latest.confidence * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-[var(--apple-label-tertiary)] shrink-0">
              {Math.round(latest.confidence * 100)}% confidence · {latest.sampleSize} answered
              {breakdown.length > 0 && ` · ${domainsWithData}/${breakdown.length} domains`}
            </span>
          </div>

          {lowConfidence && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--apple-orange)]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
              Early estimate — answer more questions across more domains before trusting this number.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
