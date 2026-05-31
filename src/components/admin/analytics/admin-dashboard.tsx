'use client'

import { useEffect, useState } from 'react'
import { OverviewCards } from './overview-cards'
import { GrowthChart } from './growth-chart'
import { ReadinessCard } from './readiness-card'
import { SuspectList } from './suspect-list'

export interface AnalyticsData {
  audience: { totalAccounts: number; activeAccounts: number }
  engagement: { attempts: number; questionsAnswered: number; flashcardReviews: number }
  growth: { day: string; accounts: number }[]
  activity: { day: string; minutes: number; users: number }[]
  readiness: { examId: string; code: string; name: string; count: number; buckets: { low: number; mid: number; high: number }; avgPredictedScore: number }[]
}

export function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  useEffect(() => { fetch('/api/admin/analytics').then((r) => r.json()).then(setData).catch(() => setData(null)) }, [])
  if (!data) return <div className="text-[13px] text-[var(--apple-label-tertiary)] py-8">Loading analytics…</div>
  return (
    <div className="flex flex-col gap-4">
      <OverviewCards data={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        <GrowthChart growth={data.growth} activity={data.activity} />
        <ReadinessCard readiness={data.readiness} />
      </div>
      <SuspectList />
    </div>
  )
}
