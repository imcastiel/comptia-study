'use client'

import type { AnalyticsData } from './admin-dashboard'

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] p-4 shadow-sm">
      <p className="text-[12px] font-medium text-[var(--apple-label-secondary)]">{label}</p>
      <p className="text-[26px] font-bold tracking-tight mt-1">{value}</p>
    </div>
  )
}

export function OverviewCards({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      <Card label="Total accounts" value={data.audience.totalAccounts.toLocaleString()} />
      <Card label="Active (7d)" value={data.audience.activeAccounts.toLocaleString()} />
      <Card label="Practice attempts" value={data.engagement.attempts.toLocaleString()} />
      <Card label="Questions answered" value={data.engagement.questionsAnswered.toLocaleString()} />
      <Card label="Flashcard reviews" value={data.engagement.flashcardReviews.toLocaleString()} />
    </div>
  )
}
