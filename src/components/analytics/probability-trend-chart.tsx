'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { AnalyticsProbabilityPoint } from '@/app/api/analytics/route'

interface ProbabilityTrendChartProps {
  history: AnalyticsProbabilityPoint[]
}

interface TrendDatum {
  label: string
  probability: number
}

function formatDay(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProbabilityTrendChart({ history }: ProbabilityTrendChartProps) {
  const data: TrendDatum[] = history.map((h) => ({
    label: formatDay(h.computedAt),
    probability: Math.round(h.probability * 100),
  }))

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-4">
        Pass Probability Over Time
      </h2>

      {data.length < 2 ? (
        <p className="text-[13px] text-[var(--apple-label-tertiary)] py-6 text-center">
          Take more practice tests to chart your trend.{' '}
          <a href="/practice" className="text-[var(--apple-blue)] font-medium hover:underline">Practice now →</a>
        </p>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="probFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--apple-blue)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--apple-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--apple-separator)" vertical={false} />
              <XAxis
                dataKey="label"
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
                tickFormatter={(v: number) => `${v}%`}
              />
              <ReferenceLine y={70} stroke="var(--apple-green)" strokeDasharray="4 4" strokeOpacity={0.6} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--apple-separator)',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
                formatter={(value) => [`${value}%`, 'Pass probability'] as [string, string]}
              />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="var(--apple-blue)"
                strokeWidth={2.5}
                fill="url(#probFill)"
                dot={{ r: 2.5, fill: 'var(--apple-blue)' }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
