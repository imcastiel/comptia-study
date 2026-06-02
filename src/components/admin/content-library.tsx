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

export function ContentLibrary({ type }: { type: ContentType }) {
  const [items, setItems] = useState<ContentItem[] | null>(null)
  const [filters, setFilters] = useState<Filters>({ status: '', topic: '', source: '', q: '' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<ContentItem | 'new' | null>(null)

  const load = useCallback(async () => {
    const sp = new URLSearchParams()
    if (filters.status) sp.set('status', filters.status)
    if (filters.topic) sp.set('topic', filters.topic)
    if (filters.source) sp.set('source', filters.source)
    if (filters.q) sp.set('q', filters.q)
    const res = await fetch(`/api/admin/content/${type}?${sp}`)
    const data = await res.json() as { items: ContentItem[] }
    setItems(Array.isArray(data.items) ? data.items : [])
    setSelected(new Set())
  }, [type, filters])

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
