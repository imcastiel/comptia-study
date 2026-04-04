'use client'

import { useEffect, useState } from 'react'

interface ActivityDay {
  date: string
  minutesActive: number
  topicsVisited: number
}

function getCellStyle(minutes: number): React.CSSProperties {
  if (minutes === 0) return { background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.06)' }
  if (minutes <= 15) return { background: 'rgba(99,102,241,0.2)' }
  if (minutes <= 30) return { background: 'rgba(99,102,241,0.4)' }
  if (minutes <= 59) return { background: 'rgba(99,102,241,0.65)' }
  return { background: '#6366f1' }
}

function formatTooltip(date: string, minutes: number, topics: number): string {
  const d = new Date(date + 'T00:00:00')
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${label} — ${minutes} min · ${topics} topics`
}

export function ActivityHeatmap() {
  const [data, setData] = useState<ActivityDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/activity/history')
      .then((r) => r.json())
      .then((rows: unknown) => { setData(Array.isArray(rows) ? rows : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Build 52×7 grid aligned to Monday
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Go back 363 days from today
  const endDate = new Date(today)
  const rawStart = new Date(today)
  rawStart.setDate(rawStart.getDate() - 363)

  // Align back to Monday (0=Sun, 1=Mon..6=Sat)
  const dow = rawStart.getDay()
  const daysBackToMonday = dow === 0 ? 6 : dow - 1
  const gridStart = new Date(rawStart)
  gridStart.setDate(gridStart.getDate() - daysBackToMonday)

  // Map API data by date string
  const dataMap = new Map<string, ActivityDay>()
  for (const d of data) dataMap.set(d.date, d)

  // Build weeks array (at most 53 columns to cover 364+ days)
  const weeks: { date: string; minutes: number; topics: number }[][] = []
  const cur = new Date(gridStart)
  while (cur <= endDate) {
    const week: { date: string; minutes: number; topics: number }[] = []
    for (let d = 0; d < 7; d++) {
      const ds = cur.toISOString().slice(0, 10)
      const row = dataMap.get(ds)
      week.push({ date: ds, minutes: row?.minutesActive ?? 0, topics: row?.topicsVisited ?? 0 })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length >= 53) break
  }

  // Take last 52 weeks
  const grid = weeks.slice(-52)

  // Month labels: emit a label in the week where the month first appears
  const monthLabels: (string | null)[] = grid.map((week, wi) => {
    const firstDay = new Date(week[0].date + 'T00:00:00')
    if (wi === 0) return firstDay.toLocaleDateString('en-US', { month: 'short' })
    const prevFirst = new Date(grid[wi - 1][0].date + 'T00:00:00')
    if (firstDay.getMonth() !== prevFirst.getMonth()) {
      return firstDay.toLocaleDateString('en-US', { month: 'short' })
    }
    return null
  })

  const cellBase: React.CSSProperties = { width: '10px', height: '10px', borderRadius: '2px' }

  return (
    <div>
      <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '16px', marginRight: '4px' }}>
          {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
            <div key={i} style={{ height: '10px', lineHeight: '10px', fontSize: '8px', color: '#444', textAlign: 'right', width: '20px' }}>
              {label}
            </div>
          ))}
        </div>

        <div>
          {/* Month labels row */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', height: '12px' }}>
            {grid.map((_, wi) => (
              <div key={wi} style={{ width: '10px', fontSize: '9px', color: '#444', whiteSpace: 'nowrap', overflow: 'visible' }}>
                {monthLabels[wi] ?? ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {week.map((cell) => {
                  const inRange = cell.date <= endDate.toISOString().slice(0, 10)
                  const style = inRange && !loading ? getCellStyle(cell.minutes) : { background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.06)' }
                  return (
                    <div
                      key={cell.date}
                      title={inRange && !loading ? formatTooltip(cell.date, cell.minutes, cell.topics) : undefined}
                      style={{ ...cellBase, ...style, opacity: loading ? 0.3 : 1 }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '9px', color: '#444' }}>Less</span>
        {[
          { background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.06)' },
          { background: 'rgba(99,102,241,0.2)' },
          { background: 'rgba(99,102,241,0.4)' },
          { background: 'rgba(99,102,241,0.65)' },
          { background: '#6366f1' },
        ].map((s, i) => (
          <div key={i} style={{ width: '9px', height: '9px', borderRadius: '2px', ...s }} />
        ))}
        <span style={{ fontSize: '9px', color: '#444' }}>More</span>
      </div>
    </div>
  )
}
