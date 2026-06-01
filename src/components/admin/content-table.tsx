'use client'

import type { ContentType } from '@/lib/admin/content-types'
import type { ContentItem } from './content-library'

function summary(item: ContentItem): string {
  return item.title ?? item.stem ?? item.front ?? '(untitled)'
}

export function ContentTable({
  type, items, selected, onToggle, onSelectAll, onEdit, onBulk,
}: {
  type: ContentType
  items: ContentItem[] | null
  selected: Set<string>
  onToggle: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onEdit: (item: ContentItem) => void
  onBulk: (action: 'publish' | 'unpublish' | 'delete') => void
}) {
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
        <span className="flex-1">Item</span>
        <span className="w-16">Topic</span>
        <span className="w-16">Status</span>
        <span className="w-14">Source</span>
      </div>
      <div className="divide-y divide-[var(--apple-separator)]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--apple-fill)]">
            <input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggle(item.id)} />
            <button onClick={() => onEdit(item)} className="flex-1 text-left text-[13px] truncate hover:text-[var(--apple-blue)]">{summary(item)}</button>
            <span className="w-16 text-[12px] text-[var(--apple-label-tertiary)] truncate">{item.topicId}</span>
            <span className="w-16 text-[12px]" style={{ color: item.published ? 'var(--apple-green)' : 'var(--apple-orange)' }}>
              {item.published ? '● live' : '○ draft'}
            </span>
            <span className="w-14 text-[12px] text-[var(--apple-label-tertiary)]">{item.source}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
