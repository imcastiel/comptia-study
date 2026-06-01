'use client'

import { useState } from 'react'
import type { ContentType, QuestionChoice } from '@/lib/admin/content-types'
import { isBlobType } from '@/lib/admin/content-types'
import type { ContentItem } from './content-library'

const LETTERS = ['a', 'b', 'c', 'd'] as const

function parseChoices(item: ContentItem | null): QuestionChoice[] {
  if (item?.choices) { try { return JSON.parse(item.choices) } catch { /* fall through */ } }
  return LETTERS.map((id) => ({ id, text: '', isCorrect: id === 'a' }))
}

function prettyData(item: ContentItem | null): string {
  if (!item?.data) return '{}'
  try { return JSON.stringify(JSON.parse(item.data), null, 2) } catch { return item.data }
}

export function EditDrawer({
  type, item, onClose, onSaved,
}: {
  type: ContentType
  item: ContentItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = item === null
  const isBlob = isBlobType(type)

  // Blob fields
  const [blobTitle, setBlobTitle] = useState(item?.title ?? '')
  const [blobData, setBlobData] = useState(() => prettyData(item))

  // Question/flashcard fields
  const [topicId, setTopicId] = useState(item?.topicId ?? '')
  const [difficulty, setDifficulty] = useState(item?.difficulty ?? 2)
  const [stem, setStem] = useState(item?.stem ?? '')
  const [explanation, setExplanation] = useState(item?.explanation ?? '')
  const [choices, setChoices] = useState<QuestionChoice[]>(parseChoices(item))
  const [front, setFront] = useState(item?.front ?? '')
  const [back, setBack] = useState(item?.back ?? '')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function setCorrect(id: string) {
    setChoices((cs) => cs.map((c) => ({ ...c, isCorrect: c.id === id })))
  }

  async function save() {
    setSaving(true); setError('')
    let payload: Record<string, unknown>
    if (isBlob) {
      payload = { title: blobTitle, data: blobData }
    } else {
      const correctAnswer = choices.find((c) => c.isCorrect)?.id ?? 'a'
      payload = type === 'questions'
        ? { topicId, type: 'single', stem, choices, correctAnswer, explanation, difficulty }
        : { topicId, front, back, difficulty }
    }
    const url = isNew ? `/api/admin/content/${type}` : `/api/admin/content/${type}/${item!.id}`
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError((d as { error?: string }).error ?? 'Save failed'); return }
    onSaved()
  }

  const inputCls = 'w-full rounded-[10px] border border-[var(--apple-separator)] bg-card px-3 py-2 text-[13px] outline-none focus:border-[var(--apple-blue)]'
  const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-label-tertiary)]'

  const typeLabel = type.replace(/_/g, ' ')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-background border-l border-[var(--apple-separator)] overflow-y-auto p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold capitalize">{isNew ? `New ${typeLabel.slice(0, -1)}` : `Edit ${typeLabel}`}</h2>
          <button onClick={onClose} className="text-[var(--apple-label-secondary)] text-[13px]">Close</button>
        </div>

        {isBlob ? (
          <>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={blobTitle} onChange={(e) => setBlobTitle(e.target.value)} placeholder="Title" />
            <label className={labelCls}>Data (JSON)</label>
            <textarea
              className={`${inputCls} font-mono text-[12px]`}
              rows={20}
              value={blobData}
              onChange={(e) => setBlobData(e.target.value)}
              spellCheck={false}
            />
          </>
        ) : (
          <>
            <label className={labelCls}>Topic ID</label>
            <input className={inputCls} value={topicId} onChange={(e) => setTopicId(e.target.value)} placeholder="topic id" />

            {type === 'questions' ? (
              <>
                <label className={labelCls}>Stem</label>
                <textarea className={inputCls} rows={3} value={stem} onChange={(e) => setStem(e.target.value)} />
                <label className={labelCls}>Choices (select the correct one)</label>
                {choices.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={c.isCorrect} onChange={() => setCorrect(c.id)} />
                    <span className="text-[12px] w-4">{c.id}.</span>
                    <input className={inputCls} value={c.text} onChange={(e) => setChoices((cs) => cs.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
                  </div>
                ))}
                <label className={labelCls}>Explanation</label>
                <textarea className={inputCls} rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
              </>
            ) : (
              <>
                <label className={labelCls}>Front</label>
                <textarea className={inputCls} rows={2} value={front} onChange={(e) => setFront(e.target.value)} />
                <label className={labelCls}>Back</label>
                <textarea className={inputCls} rows={3} value={back} onChange={(e) => setBack(e.target.value)} />
              </>
            )}

            <label className={labelCls}>Difficulty (1–3)</label>
            <input className={inputCls} type="number" min={1} max={3} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} />
          </>
        )}

        {error && <p className="text-[12px] text-[var(--apple-red)]">{error}</p>}
        <button onClick={save} disabled={saving} className="mt-2 rounded-[12px] bg-[var(--apple-blue)] py-2.5 text-[14px] font-semibold text-white hover:brightness-110 disabled:opacity-50">
          {saving ? 'Saving…' : isNew ? 'Create draft' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
