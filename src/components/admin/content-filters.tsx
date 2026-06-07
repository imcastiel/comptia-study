'use client'

import type { ContentType } from '@/lib/admin/content-types'

export interface Filters { status: '' | 'published' | 'draft'; topic: string; source: '' | 'seed' | 'ai' | 'manual'; q: string }

export interface TopicOption {
  id: string
  title: string
  objectiveId: string
  domainNumber: number
  domainName: string
  examCode: string
}

export function ContentFilters({
  type, filters, topics, onChange, onNew,
}: {
  type: ContentType
  filters: Filters
  topics: TopicOption[]
  onChange: (f: Filters) => void
  onNew: () => void
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const selectCls = 'rounded-[10px] border border-[var(--apple-separator)] bg-card px-2.5 py-2 text-[13px]'

  // Group topics into <optgroup> by "examCode · N. Domain".
  const groups = new Map<string, TopicOption[]>()
  for (const t of topics) {
    const key = `${t.examCode} · ${t.domainNumber}. ${t.domainName}`
    const arr = groups.get(key) ?? []
    arr.push(t)
    groups.set(key, arr)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder={`Search ${type}…`}
        className="flex-1 min-w-[200px] rounded-[10px] border border-[var(--apple-separator)] bg-card px-3 py-2 text-[13px] outline-none focus:border-[var(--apple-blue)]"
      />
      {topics.length > 0 && (
        <select className={`${selectCls} max-w-[220px]`} value={filters.topic} onChange={(e) => set({ topic: e.target.value })}>
          <option value="">All topics</option>
          {[...groups.entries()].map(([label, ts]) => (
            <optgroup key={label} label={label}>
              {ts.map((t) => (
                <option key={t.id} value={t.id}>{t.objectiveId} {t.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      )}
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
