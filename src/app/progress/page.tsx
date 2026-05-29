import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export const metadata = {
  title: 'Progress · CompTIA A+',
}

export default function ProgressPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-7">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Your Progress</h1>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">
          Where you stand, where your gaps are, and how fast you&apos;re closing them.
        </p>
      </header>

      <AnalyticsDashboard />
    </div>
  )
}
