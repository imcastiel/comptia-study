'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { AnalyticsData } from './admin-dashboard'

export function GrowthChart({ growth }: { growth: AnalyticsData['growth']; activity: AnalyticsData['activity'] }) {
  let cum = 0
  const data = growth.map((g) => { cum += g.accounts; return { day: g.day.slice(5), total: cum } })
  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--apple-label-secondary)] mb-4">Account growth</h2>
      {data.length < 2 ? <p className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">Not enough data yet.</p> : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs><linearGradient id="acc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--apple-blue)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--apple-blue)" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--apple-separator)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--apple-label-tertiary)' }} tickLine={false} axisLine={false} />
              {/* Counts are integers — decimal ticks (0.75, 1.5, …) clip to garbage in the narrow gutter */}
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--apple-label-tertiary)' }} tickLine={false} axisLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--apple-separator)', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="var(--apple-blue)" strokeWidth={2.5} fill="url(#acc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
