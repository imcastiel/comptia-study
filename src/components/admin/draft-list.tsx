'use client'

import { useState } from 'react'

export interface Draft {
  id: string
  item: Record<string, unknown>
  duplicateOf: string | null
  conflict: { conflictsWith: string; reason: string } | null
}

export function DraftList({ type, drafts, onChanged }: { type: 'questions' | 'flashcards'; drafts: Draft[] | null; onChanged: () => void }) {
  const [published, setPublished] = useState<Set<string>>(new Set())
  const [discarded, setDiscarded] = useState<Set<string>>(new Set())

  if (drafts === null) return <p className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">Generated drafts appear here. They are saved as unpublished until you publish them.</p>
  if (drafts.length === 0) return <p className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">No drafts returned.</p>

  async function publish(id: string) {
    await fetch(`/api/admin/content/${type}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: true }) })
    setPublished((s) => new Set(s).add(id)); onChanged()
  }
  async function discard(id: string) {
    await fetch(`/api/admin/content/${type}/${id}`, { method: 'DELETE' })
    setDiscarded((s) => new Set(s).add(id)); onChanged()
  }

  const title = (item: Record<string, unknown>) => (item.front as string) ?? (item.stem as string) ?? '(untitled)'
  const sub = (item: Record<string, unknown>) => (item.back as string) ?? (item.explanation as string) ?? ''

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-label-tertiary)]">{drafts.length} drafts · unpublished</p>
      {drafts.map((d) => {
        if (discarded.has(d.id)) return null
        const isPub = published.has(d.id)
        return (
          <div key={d.id} className="rounded-[12px] border border-[var(--apple-separator)] p-3" style={{ borderColor: d.duplicateOf || d.conflict ? 'var(--apple-orange)' : undefined }}>
            <p className="text-[13px] font-medium">{title(d.item)}</p>
            {sub(d.item) && <p className="text-[12px] text-[var(--apple-label-secondary)] mt-0.5 line-clamp-2">{sub(d.item)}</p>}
            {d.duplicateOf && <p className="text-[11px] text-[var(--apple-orange)] mt-1">⚠ near-duplicate of existing #{d.duplicateOf.slice(0, 8)}</p>}
            {d.conflict && <p className="text-[11px] text-[var(--apple-red)] mt-1">⚠ conflicts with #{d.conflict.conflictsWith.slice(0, 8)}: {d.conflict.reason}</p>}
            <div className="flex gap-2 mt-2">
              {isPub ? <span className="text-[12px] text-[var(--apple-green)]">● published</span> : (
                <>
                  <button onClick={() => publish(d.id)} className="text-[12px] font-medium text-[var(--apple-blue)]">Publish</button>
                  <button onClick={() => discard(d.id)} className="text-[12px] font-medium text-[var(--apple-red)]">Discard</button>
                </>
              )}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-2">Edit fields in <strong>Content → {type}</strong> (drafts are saved there too).</p>
    </div>
  )
}
