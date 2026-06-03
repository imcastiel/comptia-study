'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame } from 'lucide-react'

interface Summary { dueCount: number; newCount: number; doneToday: number; dailyGoal: number; streak: number }

export function TodayPlanCard() {
  const [s, setS] = useState<Summary | null>(null)
  useEffect(() => { fetch('/api/flashcards/today').then((r) => r.json()).then(setS).catch(() => {}) }, [])

  const planned = s ? Math.min(s.dueCount + s.newCount, s.dailyGoal) : 0
  const pct = s && s.dailyGoal ? Math.min(100, Math.round((s.doneToday / s.dailyGoal) * 100)) : 0

  return (
    <div className="rounded-[20px] p-5 shadow-md text-white" style={{ background: 'linear-gradient(135deg, var(--apple-blue), #0040dd)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] opacity-85">Today&apos;s plan</p>
          <p className="text-[28px] font-extrabold leading-none mt-1">{planned} cards</p>
          <p className="text-[12px] opacity-85 mt-1">{s?.dueCount ?? 0} due · {s?.newCount ?? 0} new</p>
        </div>
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold">{pct}%</span>
        </div>
      </div>
      <Link href="/flashcards/session?mode=due" className="block text-center bg-white/20 hover:bg-white/30 transition-colors rounded-[12px] py-2.5 text-[14px] font-semibold mt-4">
        Start review →
      </Link>
      <div className="flex items-center justify-between mt-3 text-[12px] opacity-90">
        <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{s?.streak ?? 0}-day streak</span>
        <span>Goal {s?.dailyGoal ?? 20}/day</span>
      </div>
    </div>
  )
}
