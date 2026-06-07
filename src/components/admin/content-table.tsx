'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, Pencil } from 'lucide-react'
import type { ContentType } from '@/lib/admin/content-types'
import type { ContentItem } from './content-library'
import { ContentDetail } from './content-detail'

function summary(item: ContentItem): string {
  return item.title ?? item.stem ?? item.front ?? '(untitled)'
}

export function ContentTable({
  type, items, selected, topicMap, onToggle, onSelectAll, onEdit, onRead, onBulk,
}: {
  type: ContentType
  items: ContentItem[] | null
  selected: Set<string>
  topicMap: Record<string, string>
  onToggle: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onEdit: (item: ContentItem) => void
  onRead: (index: number) => void
  onBulk: (action: 'publish' | 'unpublish' | 'delete') => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  if (items === null) return <div className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">Loading…</div>
  if (items.length === 0) return <div className="text-[13px] text-[var(--apple-label-tertiary)] py-8 text-center">No {type} match these filters.</div>

  const allIds = items.map((i) => i.id)
  return (
    <div className="rounded-[16px] border border-[var(--apple-separator)] bg-card overflow-hidden">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--apple-fill)] text-[12px]">
          <span className="text-[var(--apple-label-secondary)]">{selected.size} selected:</span>
          <button onClick={() => onBulk('publish')} className="font-medium text-[var(--apple-blue)]">Publish</button>
          <button onClick={() => onBulk('unpublish')} className="font-medium text-[var(--apple-label-secondary)]">Unpublish</button>
          <button onClick={() => onBulk('delete')} className="font-medium text-[var(--apple-red)]">Retire</button>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--apple-separator)] text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-label-tertiary)]">
        <input type="checkbox" checked={items.length > 0 && selected.size === items.length} onChange={() => onSelectAll(allIds)} />
        <span className="w-4" />
        <span className="flex-1">Item</span>
        <span className="w-28 hidden sm:block">Topic</span>
        <span className="w-14">Status</span>
        <span className="w-16 text-right">Actions</span>
      </div>
      <div className="divide-y divide-[var(--apple-separator)]">
        {items.map((item, index) => {
          const isOpen = expanded.has(item.id)
          return (
            <div key={item.id}>
              <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--apple-fill)]">
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggle(item.id)} />
                <button onClick={() => toggleExpand(item.id)} aria-label={isOpen ? 'Collapse' : 'Expand'} className="text-[var(--apple-label-tertiary)] shrink-0">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <button onClick={() => toggleExpand(item.id)} className="flex-1 text-left text-[13px] truncate hover:text-[var(--apple-blue)]">{summary(item)}</button>
                <span className="w-28 hidden sm:block text-[12px] text-[var(--apple-label-tertiary)] truncate" title={topicMap[item.topicId ?? ''] ?? item.topicId}>
                  {topicMap[item.topicId ?? ''] ?? item.topicId ?? '—'}
                </span>
                <span className="w-14 text-[12px]" style={{ color: item.published ? 'var(--apple-green)' : 'var(--apple-orange)' }}>
                  {item.published ? '● live' : '○ draft'}
                </span>
                <span className="w-16 flex items-center justify-end gap-1">
                  <button onClick={() => onRead(index)} aria-label="Read" title="Read in reader" className="rounded-md p-1 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-blue)] hover:bg-card">
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(item)} aria-label="Edit" title="Edit" className="rounded-md p-1 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-blue)] hover:bg-card">
                    <Pencil className="w-4 h-4" />
                  </button>
                </span>
              </div>
              {isOpen && (
                <div className="px-4 pl-11 pb-4 pt-1 bg-[var(--apple-fill)]/40">
                  <ContentDetail item={item} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
