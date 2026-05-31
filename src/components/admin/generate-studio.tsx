'use client'

import { useEffect, useState } from 'react'
import { DraftList, type Draft } from './draft-list'

type Type = 'questions' | 'flashcards'

export function GenerateStudio() {
  const [type, setType] = useState<Type>('flashcards')
  const [brief, setBrief] = useState('')
  const [topicId, setTopicId] = useState('')
  const [count, setCount] = useState(10)
  const [options, setOptions] = useState<Record<string, boolean>>({ mnemonics: true, memoryMethods: true })
  const [masterPrompt, setMasterPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/generation-profiles/${type}`).then((r) => r.json())
      .then((d: { profile?: { masterPrompt: string } | null }) => setMasterPrompt(d.profile?.masterPrompt ?? ''))
      .catch(() => setMasterPrompt(''))
  }, [type])

  async function saveProfile() {
    await fetch(`/api/admin/generation-profiles/${type}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ masterPrompt }),
    })
  }

  async function generate() {
    setLoading(true); setError(''); setDrafts(null)
    const res = await fetch(`/api/admin/generate/${type}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, options, count, topicId: topicId || undefined }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError((d as { error?: string }).error ?? 'Generation failed'); return }
    const data = await res.json() as { drafts: Draft[] }
    setDrafts(data.drafts)
  }

  const toggle = (k: string) => setOptions((o) => ({ ...o, [k]: !o[k] }))
  const inputCls = 'w-full rounded-[10px] border border-[var(--apple-separator)] bg-card px-3 py-2 text-[13px] outline-none focus:border-[var(--apple-blue)]'
  const chip = (k: string, label: string) => (
    <button onClick={() => toggle(k)} className={`rounded-full px-3 py-1 text-[12px] ${options[k] ? 'bg-[var(--apple-blue)] text-white' : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)]'}`}>{label}</button>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--apple-separator)] bg-card p-4">
        <div className="flex gap-1 bg-[var(--apple-fill)] rounded-[10px] p-0.5 w-fit">
          {(['questions', 'flashcards'] as Type[]).map((t) => (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 text-[12px] font-medium rounded-[8px] capitalize ${type === t ? 'bg-card shadow-sm' : 'text-[var(--apple-label-secondary)]'}`}>{t}</button>
          ))}
        </div>
        <textarea className={inputCls} rows={4} placeholder="Brief — describe exactly what to generate (e.g. common TCP/UDP ports with mnemonics and memory methods)" value={brief} onChange={(e) => setBrief(e.target.value)} />
        <input className={inputCls} placeholder="Target topic ID (optional)" value={topicId} onChange={(e) => setTopicId(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          {chip('mnemonics', 'Mnemonics')}
          {chip('memoryMethods', 'Memory methods')}
          {type === 'questions' && chip('scenario', 'Scenario-based')}
          <input className="w-20 rounded-[10px] border border-[var(--apple-separator)] bg-card px-2 py-1 text-[13px]" type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <button onClick={() => setShowPrompt((s) => !s)} className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-label-tertiary)]">⚙ Master prompt</button>
        {showPrompt && (
          <div className="flex flex-col gap-2">
            <textarea className={inputCls} rows={5} value={masterPrompt} onChange={(e) => setMasterPrompt(e.target.value)} />
            <button onClick={saveProfile} className="self-start rounded-[8px] bg-[var(--apple-fill)] px-3 py-1.5 text-[12px] font-medium">Save master prompt</button>
          </div>
        )}
        <button onClick={generate} disabled={loading || !brief.trim()} className="rounded-[12px] bg-[var(--apple-blue)] py-2.5 text-[14px] font-semibold text-white hover:brightness-110 disabled:opacity-50">
          {loading ? 'Generating…' : `✨ Generate ${count}`}
        </button>
        {error && <p className="text-[12px] text-[var(--apple-red)]">{error}</p>}
      </div>

      <div className="rounded-[16px] border border-[var(--apple-separator)] bg-card p-4">
        <DraftList type={type} drafts={drafts} onChanged={() => { /* drafts persisted; manage in Content */ }} />
      </div>
    </div>
  )
}
