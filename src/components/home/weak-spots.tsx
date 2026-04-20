'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, CheckCircle2, Target } from 'lucide-react'

export interface TopicScore {
  topicId: string
  topicTitle: string
  topicSlug: string
  domainSlug: string
  examId: string
  correct: number
  total: number
  pct: number
  lastAttempt: string
}

export const SCORES_KEY = 'comptia-topic-scores'

export function loadTopicScores(): Record<string, TopicScore> {
  try { return JSON.parse(localStorage.getItem(SCORES_KEY) ?? '{}') } catch { return {} }
}

export function saveTopicScore(score: TopicScore) {
  const all = loadTopicScores()
  const existing = all[score.topicId]
  if (existing) {
    const correct = existing.correct + score.correct
    const total = existing.total + score.total
    all[score.topicId] = { ...score, correct, total, pct: Math.round((correct / total) * 100) }
  } else {
    all[score.topicId] = score
  }
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(all)) } catch {}
}

export function WeakSpots() {
  const [scores, setScores] = useState<TopicScore[]>([])

  useEffect(() => {
    fetch('/api/weak-spots')
      .then((r) => r.json())
      .then((data: TopicScore[]) => setScores(Array.isArray(data) ? data : []))
      .catch(() => {
        const all = loadTopicScores()
        setScores(Object.values(all).sort((a, b) => a.pct - b.pct))
      })
  }, [])

  if (scores.length === 0) return null

  const weak = scores.filter((s) => s.pct < 80)
  const strong = scores.filter((s) => s.pct >= 80)

  return (
    <section className="animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-3.5 h-3.5 text-[var(--apple-orange)]" />
        <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          Focus Areas
        </h2>
      </div>

      <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] shadow-sm overflow-hidden">
        {weak.length === 0 ? (
          <div className="p-5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--apple-green)] shrink-0" />
            <p className="text-[13px] text-[var(--apple-label-secondary)]">
              All studied topics at 80%+ — great work!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--apple-separator)]">
            {weak.slice(0, 5).map((s) => {
              const color = s.pct < 50 ? 'var(--apple-red)' : s.pct < 70 ? 'var(--apple-orange)' : 'var(--apple-yellow)'
              return (
                <Link
                  key={s.topicId}
                  href={`/study/${s.examId}/${s.domainSlug}/${s.topicSlug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--apple-fill)] transition-colors group"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{s.topicTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-[var(--apple-fill)] rounded-full h-[4px] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold shrink-0" style={{ color }}>
                        {s.pct}% ({s.correct}/{s.total})
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--apple-label-tertiary)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )
            })}
          </div>
        )}

        {strong.length > 0 && (
          <div className="px-4 py-2.5 bg-[var(--apple-fill)] border-t border-[var(--apple-separator)]">
            <p className="text-[11px] text-[var(--apple-label-tertiary)]">
              {strong.length} topic{strong.length !== 1 ? 's' : ''} at 80%+ ·{' '}
              {weak.length} need{weak.length === 1 ? 's' : ''} more practice
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
