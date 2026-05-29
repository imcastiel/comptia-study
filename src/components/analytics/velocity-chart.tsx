'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { AnalyticsDomain, AnalyticsSnapshotPoint } from '@/app/api/analytics/route'
import { domainColor } from './palette'

interface VelocityChartProps {
  domains: AnalyticsDomain[]
  snapshots: AnalyticsSnapshotPoint[]
}

function formatDay(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function VelocityChart({ domains, snapshots }: VelocityChartProps) {
  const dates = [...new Set(snapshots.map((s) => s.snapshotDate))].sort()

  // Pivot: one row per date, one column per domain (keyed by domainId).
  const rows = dates.map((date) => {
    const row: Record<string, string | number | null> = { date: formatDay(date) }
    for (const d of domains) {
      const hit = snapshots.find((s) => s.snapshotDate === date && s.domainId === d.domainId)
      row[d.domainId] = hit ? Math.round(hit.masteryScore) : null
    }
    return row
  })

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-4">
        Mastery Velocity
        <span className="ml-2 font-normal text-[var(--apple-label-tertiary)] normal-case tracking-normal">
          score per domain over time
        </span>
      </h2>

      {dates.length < 2 ? (
        <p className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">
          Study across multiple days to see how each domain trends.
        </p>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--apple-separator)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--apple-label-tertiary)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--apple-label-tertiary)' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--apple-separator)',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="plainline"
                formatter={(value: string) => {
                  const d = domains.find((dm) => dm.domainId === value)
                  return d ? `${d.number}. ${d.name}` : value
                }}
              />
              {domains.map((d, i) => (
                <Line
                  key={d.domainId}
                  type="monotone"
                  dataKey={d.domainId}
                  name={d.domainId}
                  stroke={domainColor(i)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
