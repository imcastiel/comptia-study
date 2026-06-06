'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, CircleAlert } from 'lucide-react'

interface TopicCov { id: string; title: string; objectiveId: string; published: number; draft: number; total: number }
interface DomainCov { id: string; number: number; name: string; weightPercent: number; target: number; published: number; draft: number; total: number; topics: TopicCov[] }
interface ExamCov { id: string; code: string; name: string; maxQuestions: number; domains: DomainCov[] }

type CovType = 'questions' | 'flashcards'

function barColor(published: number, target: number): string {
  if (published === 0) return 'var(--apple-red)'
  if (target > 0 && published < target) return 'var(--apple-orange)'
  return 'var(--apple-green)'
}

export function CoverageView() {
  const [type, setType] = useState<CovType>('questions')
  const [exams, setExams] = useState<ExamCov[] | null>(null)
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    setExams(null)
    fetch(`/api/admin/coverage/${type}`)
      .then((r) => r.json())
      .then((d) => setExams(Array.isArray(d.exams) ? d.exams : []))
      .catch(() => setExams([]))
  }, [type])

  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const isQuestions = type === 'questions'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 self-start rounded-[10px] bg-[var(--apple-fill)] p-1 text-[13px] font-medium">
        {(['questions', 'flashcards'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-[8px] px-3 py-1.5 capitalize ${type === t ? 'bg-card shadow-sm text-foreground' : 'text-[var(--apple-label-secondary)]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {exams === null && <div className="py-10 text-center text-[13px] text-[var(--apple-label-tertiary)]">Loading…</div>}

      {exams?.map((ex) => (
        <section key={ex.id} className="flex flex-col gap-2">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)]">
            {ex.code} · {ex.name}
          </h2>
          <div className="flex flex-col gap-2">
            {ex.domains.map((d) => {
              const expanded = open.has(d.id)
              const pct = d.target > 0 ? Math.min(100, Math.round((d.published / d.target) * 100)) : (d.published > 0 ? 100 : 0)
              const gapTopics = d.topics.filter((t) => t.published === 0).length
              return (
                <div key={d.id} className="rounded-[14px] border border-[var(--apple-separator)] bg-card overflow-hidden">
                  <button onClick={() => toggle(d.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--apple-fill)]">
                    {expanded ? <ChevronDown className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold truncate">{d.number}. {d.name}</span>
                        <span className="text-[11px] text-[var(--apple-label-tertiary)] shrink-0">{d.weightPercent}%</span>
                        {gapTopics > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--apple-red)] shrink-0">
                            <CircleAlert className="w-3 h-3" />{gapTopics} gap{gapTopics > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[var(--apple-fill)] rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor(d.published, d.target) }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <div className="text-[13px] font-semibold">
                        {d.published}{isQuestions && d.target > 0 ? ` / ${d.target}` : ''}
                      </div>
                      <div className="text-[11px] text-[var(--apple-label-tertiary)]">
                        {isQuestions ? 'published' : `${d.total} cards`}{d.draft > 0 ? ` · ${d.draft} draft` : ''}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-[var(--apple-separator)] divide-y divide-[var(--apple-separator)]">
                      {d.topics.map((t) => (
                        <Link
                          key={t.id}
                          href={`/admin/content/${type}?topic=${t.id}&topicName=${encodeURIComponent(t.title)}`}
                          className="flex items-center gap-3 px-4 py-2.5 pl-11 hover:bg-[var(--apple-fill)]"
                        >
                          {t.published === 0 ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--apple-red)] shrink-0" title="No published questions" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--apple-green)] shrink-0" />
                          )}
                          <span className="flex-1 min-w-0 text-[13px] truncate">
                            <span className="text-[var(--apple-label-tertiary)]">{t.objectiveId}</span> {t.title}
                          </span>
                          <span className="text-[12px] text-[var(--apple-label-secondary)] shrink-0">
                            {t.published} pub{t.draft > 0 ? ` · ${t.draft} draft` : ''}
                          </span>
                        </Link>
                      ))}
                      {d.topics.length === 0 && <div className="px-4 py-3 pl-11 text-[12px] text-[var(--apple-label-tertiary)]">No topics.</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
