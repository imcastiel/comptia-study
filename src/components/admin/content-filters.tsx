'use client'

import type { ContentType } from '@/lib/admin/content-types'

export interface Filters { status: '' | 'published' | 'draft'; topic: string; source: '' | 'seed' | 'ai' | 'manual'; q: string }

export function ContentFilters({
  type, filters, onChange, onNew,
}: {
  type: ContentType
  filters: Filters
  onChange: (f: Filters) => void
  onNew: () => void
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const selectCls = 'rounded-[10px] border border-[var(--apple-separator)] bg-card px-2.5 py-2 text-[13px]'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder={`Search ${type}…`}
        className="flex-1 min-w-[200px] rounded-[10px] border border-[var(--apple-separator)] bg-card px-3 py-2 text-[13px] outline-none focus:border-[var(--apple-blue)]"
      />
      <select className={selectCls} value={filters.status} onChange={(e) => set({ status: e.target.value as Filters['status'] })}>
        <option value="">All statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      <select className={selectCls} value={filters.source} onChange={(e) => set({ source: e.target.value as Filters['source'] })}>
        <option value="">All sources</option>
        <option value="seed">Seed</option>
        <option value="ai">AI</option>
        <option value="manual">Manual</option>
      </select>
      <button onClick={onNew} className="rounded-[10px] bg-[var(--apple-blue)] px-3.5 py-2 text-[13px] font-semibold text-white hover:brightness-110">
        + New
      </button>
    </div>
  )
}
