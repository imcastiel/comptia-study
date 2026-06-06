'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ContentType } from '@/lib/admin/content-types'
import { ContentFilters, type Filters } from './content-filters'
import { ContentTable } from './content-table'
import { EditDrawer } from './edit-drawer'

export interface ContentItem {
  id: string
  topicId?: string
  difficulty?: number
  published: boolean
  source: string
  updatedAt: string | null
  stem?: string
  choices?: string
  correctAnswer?: string
  explanation?: string
  type?: string
  front?: string
  back?: string
  tags?: string | null
  title?: string
  data?: string
}

const PAGE_SIZE = 200

export function ContentLibrary({ type }: { type: ContentType }) {
  const [items, setItems] = useState<ContentItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState<Filters>({ status: '', topic: '', source: '', q: '' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<ContentItem | 'new' | null>(null)

  const fetchPage = useCallback(async (pageNum: number) => {
    const sp = new URLSearchParams()
    if (filters.status) sp.set('status', filters.status)
    if (filters.topic) sp.set('topic', filters.topic)
    if (filters.source) sp.set('source', filters.source)
    if (filters.q) sp.set('q', filters.q)
    sp.set('page', String(pageNum))
    sp.set('pageSize', String(PAGE_SIZE))
    const res = await fetch(`/api/admin/content/${type}?${sp}`)
    return await res.json() as { items: ContentItem[]; total: number }
  }, [type, filters])

  const load = useCallback(async () => {
    const data = await fetchPage(0)
    setItems(Array.isArray(data.items) ? data.items : [])
    setTotal(data.total ?? 0)
    setPage(0)
    setSelected(new Set())
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    const next = page + 1
    const data = await fetchPage(next)
    setItems((prev) => [...(prev ?? []), ...(Array.isArray(data.items) ? data.items : [])])
    setTotal(data.total ?? 0)
    setPage(next)
    setLoadingMore(false)
  }, [page, fetchPage])

  useEffect(() => { load() }, [load])

  async function bulk(action: 'publish' | 'unpublish' | 'delete') {
    if (selected.size === 0) return
    await fetch(`/api/admin/content/${type}/bulk`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: [...selected] }),
    })
    await load()
  }

  return (
    <div className="flex flex-col gap-4">
      <ContentFilters type={type} filters={filters} onChange={setFilters} onNew={() => setEditing('new')} />
      <ContentTable
        type={type}
        items={items}
        selected={selected}
        onToggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })}
        onSelectAll={(ids) => setSelected((s) => s.size === ids.length ? new Set() : new Set(ids))}
        onEdit={setEditing}
        onBulk={bulk}
      />
      {items && items.length > 0 && (
        <div className="flex items-center justify-between px-1 text-[13px] text-[var(--apple-label-secondary)]">
          <span>Showing {items.length} of {total}</span>
          {items.length < total && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-1.5 rounded-full bg-[var(--apple-fill)] font-medium text-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : `Load more (${total - items.length} left)`}
            </button>
          )}
        </div>
      )}
      {editing && (
        <EditDrawer
          type={type}
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}
