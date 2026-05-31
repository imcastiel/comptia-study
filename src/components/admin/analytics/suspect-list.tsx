'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Suspect {
  questionId: string; stem: string; topicId: string
  totalAttempts: number; correctRate: number; score: number; reasons: string[]
}

export function SuspectList() {
  const [suspects, setSuspects] = useState<Suspect[] | null>(null)
  useEffect(() => { fetch('/api/admin/analytics/suspect').then((r) => r.json()).then((d: { suspects: Suspect[] }) => setSuspects(d.suspects)).catch(() => setSuspects([])) }, [])

  return (
    <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] p-5 shadow-sm">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--apple-label-secondary)] mb-1">
        ⚠ Suspect questions
        <span className="ml-2 font-normal normal-case tracking-normal text-[var(--apple-label-tertiary)]">likely defective — review the key/wording</span>
      </h2>
      {suspects === null ? <p className="text-[13px] text-[var(--apple-label-tertiary)] py-4">Loading…</p>
        : suspects.length === 0 ? <p className="text-[13px] text-[var(--apple-label-tertiary)] py-4">No suspect questions — nothing looks broken. 🎉</p>
        : (
          <div className="divide-y divide-[var(--apple-separator)]">
            {suspects.map((s) => (
              <div key={s.questionId} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">{s.stem}</p>
                  <p className="text-[12px] text-[var(--apple-orange)] mt-0.5">{s.reasons.join(' · ')}</p>
                  <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-0.5">{s.correctRate}% correct · {s.totalAttempts} attempts</p>
                </div>
                <Link href={`/admin/content/questions?focus=${s.questionId}`} className="text-[12px] font-medium text-[var(--apple-blue)] shrink-0">Review →</Link>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
