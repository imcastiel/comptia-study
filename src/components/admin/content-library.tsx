'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { ContentType } from '@/lib/admin/content-types'
import { ContentFilters, type Filters, type TopicOption } from './content-filters'
import { ContentTable } from './content-table'
import { ContentReader } from './content-reader'
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
  attempts?: number
  misses?: number
}

const PAGE_SIZE = 200

export function ContentLibrary({ type }: { type: ContentType }) {
  const [items, setItems] = useState<ContentItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  // Honor a ?topic= deep link (e.g. from the Coverage view). Read once on mount;
  // ContentLibrary only renders client-side, so window is available.
  const [topicName, setTopicName] = useState('')
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === 'undefined') return { status: '', topic: '', source: '', q: '' }
    const p = new URLSearchParams(window.location.search)
    return { status: '', topic: p.get('topic') ?? '', source: '', q: '' }
  })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<'newest' | 'missed'>('newest')
  const [editing, setEditing] = useState<ContentItem | 'new' | null>(null)
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [readerIndex, setReaderIndex] = useState<number | null>(null)

  const supportsTopics = type === 'questions' || type === 'flashcards'

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTopicName(new URLSearchParams(window.location.search).get('topicName') ?? '')
  }, [])

  useEffect(() => {
    if (!supportsTopics) return
    fetch('/api/admin/topics').then((r) => r.json()).then((d) => setTopics(Array.isArray(d.topics) ? d.topics : [])).catch(() => {})
  }, [supportsTopics])

  const topicMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const t of topics) m[t.id] = `${t.objectiveId} ${t.title}`
    return m
  }, [topics])

  const fetchPage = useCallback(async (pageNum: number) => {
    const sp = new URLSearchParams()
    if (filters.status) sp.set('status', filters.status)
    if (filters.topic) sp.set('topic', filters.topic)
    if (filters.source) sp.set('source', filters.source)
    if (filters.q) sp.set('q', filters.q)
    if (type === 'questions' && sort === 'missed') sp.set('sort', 'missed')
    sp.set('page', String(pageNum))
    sp.set('pageSize', String(PAGE_SIZE))
    const res = await fetch(`/api/admin/content/${type}?${sp}`)
    return await res.json() as { items: ContentItem[]; total: number }
  }, [type, filters, sort])

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
      <ContentFilters type={type} filters={filters} topics={supportsTopics ? topics : []} onChange={setFilters} onNew={() => setEditing('new')} />
      <div className="flex items-center gap-2 flex-wrap">
        {filters.topic && (
          <div className="flex items-center gap-2 rounded-full bg-[var(--apple-blue)]/10 px-3 py-1 text-[12px] font-medium text-[var(--apple-blue)]">
            <span>Topic: {topicMap[filters.topic] || topicName || filters.topic}</span>
            <button onClick={() => { setTopicName(''); setFilters((f) => ({ ...f, topic: '' })) }} aria-label="Clear topic filter" className="hover:opacity-70">✕</button>
          </div>
        )}
        {items && items.length > 0 && (
          <button onClick={() => setReaderIndex(0)} className="flex items-center gap-1.5 rounded-full bg-[var(--apple-fill)] px-3 py-1 text-[12px] font-medium hover:opacity-80">
            <BookOpen className="w-3.5 h-3.5" /> Read through ({items.length})
          </button>
        )}
        {type === 'questions' && (
          <button
            onClick={() => setSort((s) => (s === 'newest' ? 'missed' : 'newest'))}
            className="ml-auto rounded-full bg-[var(--apple-fill)] px-3 py-1 text-[12px] font-medium hover:opacity-80"
          >
            Sort: {sort === 'missed' ? 'Most missed' : 'Newest'}
          </button>
        )}
      </div>
      <ContentTable
        type={type}
        items={items}
        selected={selected}
        topicMap={topicMap}
        onToggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })}
        onSelectAll={(ids) => setSelected((s) => s.size === ids.length ? new Set() : new Set(ids))}
        onEdit={setEditing}
        onRead={(index) => setReaderIndex(index)}
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
      {readerIndex !== null && items && items[readerIndex] && (
        <ContentReader
          items={items}
          startIndex={readerIndex}
          title={filters.topic ? (topicMap[filters.topic] || topicName) : undefined}
          onClose={() => setReaderIndex(null)}
          onEdit={(item) => { setReaderIndex(null); setEditing(item) }}
        />
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
