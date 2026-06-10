'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CircleAlert, CheckCircle2, Copy, Bot, SearchX } from 'lucide-react'
import type { ContentHealthResponse, FlaggedItem, ReviewFlag, TopicGap } from '@/app/api/admin/content-health/route'

function SeverityBadge({ severity }: { severity: 'error' | 'warning' }) {
  return severity === 'error' ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--apple-red)] bg-[var(--apple-red)]/10 px-2 py-0.5 rounded-full">
      <CircleAlert className="w-3 h-3" /> error
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--apple-orange)] bg-[var(--apple-orange)]/10 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> warning
    </span>
  )
}

function FlaggedList({ title, items, libraryHref }: { title: string; items: FlaggedItem[]; libraryHref: string }) {
  if (items.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">
        {title} · {items.length}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-[14px] border border-[var(--apple-separator)] p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[14px] font-medium leading-snug">{item.excerpt}…</p>
              <Link href={libraryHref} className="shrink-0 text-[12px] text-[var(--apple-blue)] font-medium hover:underline">
                Open library →
              </Link>
            </div>
            <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-1 font-mono">{item.id}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {item.issues.map((i) => (
                <span key={i.code} className="inline-flex items-center gap-2 text-[12px] text-[var(--apple-label-secondary)]">
                  <SeverityBadge severity={i.severity} /> {i.message}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DuplicateGroups({ title, groups }: { title: string; groups: string[][] }) {
  if (groups.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">
        {title} · {groups.length} group{groups.length === 1 ? '' : 's'}
      </h2>
      <div className="space-y-2">
        {groups.map((ids) => (
          <div key={ids.join()} className="bg-card rounded-[14px] border border-[var(--apple-separator)] p-4 flex items-center gap-2">
            <Copy className="w-4 h-4 text-[var(--apple-orange)] shrink-0" />
            <span className="text-[13px] font-mono">{ids.join('  ·  ')}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewQueue({ flags, onAction }: { flags: ReviewFlag[]; onAction: (id: string, status: 'resolved' | 'dismissed') => void }) {
  if (flags.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">
        <Bot className="w-4 h-4" /> Review queue · {flags.length}
      </h2>
      <div className="space-y-2">
        {flags.map((f) => (
          <div key={f.id} className="bg-card rounded-[14px] border border-[var(--apple-separator)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] font-medium leading-snug">{f.excerpt}…</p>
                <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-1 font-mono">{f.itemType} · {f.itemId}</p>
                <p className="flex items-center gap-2 text-[12px] text-[var(--apple-label-secondary)] mt-2">
                  <SeverityBadge severity={f.severity === 'error' ? 'error' : 'warning'} />
                  <span className="font-mono">{f.code}</span> — {f.detail}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onAction(f.id, 'resolved')}
                  className="text-[12px] font-semibold text-white bg-[var(--apple-green)] px-3 py-1.5 rounded-full hover:brightness-105"
                >
                  Resolved
                </button>
                <button
                  onClick={() => onAction(f.id, 'dismissed')}
                  className="text-[12px] font-medium text-[var(--apple-label-secondary)] bg-[var(--apple-fill)] px-3 py-1.5 rounded-full hover:text-foreground"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ObjectiveGaps({ gaps }: { gaps: TopicGap[] }) {
  if (gaps.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">
        <SearchX className="w-4 h-4" /> Objective gaps · {gaps.length} topic{gaps.length === 1 ? '' : 's'}
      </h2>
      <div className="space-y-2">
        {gaps.map((g) => (
          <div key={g.topicId} className="bg-card rounded-[14px] border border-[var(--apple-separator)] p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[14px] font-medium">{g.topicTitle}</p>
              <Link
                href={`/admin/generate?topicId=${encodeURIComponent(g.topicId)}`}
                className="shrink-0 text-[12px] text-[var(--apple-blue)] font-medium hover:underline"
              >
                Generate for topic →
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {g.missing.map((kw) => (
                <span key={kw} className="text-[12px] bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] px-2 py-0.5 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HealthView() {
  const [data, setData] = useState<ContentHealthResponse | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content-health')
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ContentHealthResponse> })
      .then(setData)
      .catch(() => setFailed(true))
  }, [])

  const handleFlagAction = (id: string, status: 'resolved' | 'dismissed') => {
    // Optimistic removal; restore on failure.
    const prev = data
    setData((d) => d ? { ...d, reviewQueue: d.reviewQueue.filter((f) => f.id !== id) } : d)
    fetch(`/api/admin/flags/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((r) => { if (!r.ok) throw new Error(String(r.status)) })
      .catch(() => setData(prev))
  }

  if (failed) return <p className="text-[14px] text-[var(--apple-red)]">Could not load the health report.</p>
  if (!data) return <p className="text-[14px] text-[var(--apple-label-secondary)]">Scanning content…</p>

  const clean = data.errorCount === 0 && data.warningCount === 0
    && data.duplicateQuestionGroups.length === 0 && data.duplicateFlashcardGroups.length === 0
    && data.reviewQueue.length === 0 && data.gaps.length === 0

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <div className="bg-card rounded-[14px] border border-[var(--apple-separator)] px-4 py-3">
          <p className="text-[11px] text-[var(--apple-label-secondary)]">Scanned</p>
          <p className="text-[18px] font-bold">{data.scanned.questions + data.scanned.flashcards}</p>
        </div>
        <div className="bg-card rounded-[14px] border border-[var(--apple-separator)] px-4 py-3">
          <p className="text-[11px] text-[var(--apple-red)]">Errors</p>
          <p className="text-[18px] font-bold">{data.errorCount}</p>
        </div>
        <div className="bg-card rounded-[14px] border border-[var(--apple-separator)] px-4 py-3">
          <p className="text-[11px] text-[var(--apple-orange)]">Warnings</p>
          <p className="text-[18px] font-bold">{data.warningCount}</p>
        </div>
      </div>

      {clean && (
        <p className="flex items-center gap-2 text-[14px] text-[var(--apple-green)] font-medium">
          <CheckCircle2 className="w-4 h-4" /> All published content passes structural checks.
        </p>
      )}

      <ReviewQueue flags={data.reviewQueue} onAction={handleFlagAction} />
      <ObjectiveGaps gaps={data.gaps} />
      <FlaggedList title="Questions" items={data.questions} libraryHref="/admin/content/questions" />
      <FlaggedList title="Flashcards" items={data.flashcards} libraryHref="/admin/content/flashcards" />
      <DuplicateGroups title="Duplicate question stems" groups={data.duplicateQuestionGroups} />
      <DuplicateGroups title="Duplicate flashcard fronts" groups={data.duplicateFlashcardGroups} />
    </div>
  )
}
