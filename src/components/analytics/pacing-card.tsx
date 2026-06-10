'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { computePacing } from '@/lib/pacing'

interface HistoryPoint {
  computedAt: string
  predictedScore: number | null
}

interface PacingCardProps {
  history: HistoryPoint[]
  passingScore: number
}

export function PacingCard({ history, passingScore }: PacingCardProps) {
  const [examDate, setExamDate] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    fetch('/api/user/exam-date')
      .then((r) => r.json())
      .then((d) => { setExamDate(d.targetExamDate ?? null); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const save = (date: string | null) => {
    const prev = examDate
    setExamDate(date)
    setEditing(false)
    fetch('/api/user/exam-date', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    }).then((r) => { if (!r.ok) throw new Error(String(r.status)) })
      .catch(() => setExamDate(prev))
  }

  if (!loaded) return null

  const pacing = computePacing({
    history: history
      .filter((h) => h.predictedScore !== null)
      .map((h) => ({ date: h.computedAt, score: h.predictedScore! })),
    passingScore,
    examDate,
  })

  const dateForm = (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => { e.preventDefault(); if (draft) save(draft) }}
    >
      <input
        type="date"
        value={draft}
        min={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setDraft(e.target.value)}
        className="bg-[var(--apple-fill)] border border-[var(--apple-separator)] rounded-[10px] px-3 py-1.5 text-[13px] outline-none focus:border-[var(--apple-blue)]"
      />
      <button type="submit" className="text-[13px] font-semibold text-white bg-[var(--apple-blue)] px-4 py-1.5 rounded-full disabled:opacity-50" disabled={!draft}>
        Save
      </button>
      {editing && (
        <button type="button" onClick={() => setEditing(false)} className="text-[13px] text-[var(--apple-label-secondary)]">
          Cancel
        </button>
      )}
    </form>
  )

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)]">
          <CalendarDays className="w-4 h-4" /> Exam pacing
        </p>
        {examDate && !editing && (
          <button
            onClick={() => { setDraft(examDate); setEditing(true) }}
            className="text-[12px] text-[var(--apple-blue)] font-medium hover:underline"
          >
            Change date
          </button>
        )}
      </div>

      {!examDate || editing ? (
        <div>
          {!examDate && (
            <p className="text-[13px] text-[var(--apple-label-secondary)] mb-3">
              Set your exam date to see whether your progress pace will get you there.
            </p>
          )}
          {dateForm}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold">{pacing.daysUntilExam}</span>
            <span className="text-[13px] text-[var(--apple-label-secondary)]">
              days until your exam ({examDate})
            </span>
          </div>

          {pacing.onTrack === true && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-green)]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              On track — projected to reach {passingScore} around {pacing.projectedReadyDate}
              {pacing.pointsPerDay !== null && ` (+${pacing.pointsPerDay} pts/day)`}
            </p>
          )}
          {pacing.onTrack === false && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-orange)]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {pacing.projectedReadyDate
                ? `At the current pace you'd reach ${passingScore} around ${pacing.projectedReadyDate} — after your exam. Increase your daily question volume.`
                : `Your predicted score isn't rising yet. Target your weak spots to start closing the gap.`}
            </p>
          )}
          {pacing.onTrack === null && (
            <p className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)]">
              <TrendingUp className="w-4 h-4 shrink-0" />
              Practice across a few days to unlock your pace projection.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
