'use client'

import { useState, useEffect, useRef, JSX } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface SearchEntry {
  slug: string
  title: string
  domainName: string
  examCode: string
  examId: string
  domainSlug: string
  path: string
  text: string
}

interface SearchResults {
  titleMatches: SearchEntry[]
  contentMatches: SearchEntry[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

// Module-level cache — survives component unmount/remount. Intentional, not useRef.
let cachedIndex: SearchEntry[] | null = null

function extractSnippet(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, 120) + '…'
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + query.length + 80)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

function highlightMatch(text: string, query: string): JSX.Element | string {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(99,102,241,0.3)', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function runSearch(entries: SearchEntry[], query: string): SearchResults {
  const q = query.toLowerCase()
  const titleMatches = entries.filter(e => e.title.toLowerCase().includes(q)).slice(0, 5)
  const titleSlugs = new Set(titleMatches.map(e => e.slug))
  const contentMatches = entries
    .filter(e => !titleSlugs.has(e.slug) && e.text.toLowerCase().includes(q))
    .slice(0, 5)
  return { titleMatches, contentMatches }
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ titleMatches: [], contentMatches: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)

  // Fetch index on first open
  useEffect(() => {
    if (!isOpen || cachedIndex) return
    setLoading(true)
    fetch('/api/search/index')
      .then(r => r.json())
      .then((data: SearchEntry[]) => {
        cachedIndex = data
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isOpen])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults({ titleMatches: [], contentMatches: [] })
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Debounced search — runs whenever query changes
  useEffect(() => {
    if (!cachedIndex || query.length < 2) {
      setResults({ titleMatches: [], contentMatches: [] })
      setSelectedIndex(0)
      return
    }
    const timer = setTimeout(() => {
      setResults(runSearch(cachedIndex!, query))
      setSelectedIndex(0)
    }, 150)
    return () => clearTimeout(timer)
  }, [query])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Keyboard handlers: Esc, arrows, Enter, Tab trap
  useEffect(() => {
    if (!isOpen) return
    const allResults = [...results.titleMatches, ...results.contentMatches]

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, allResults.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' && allResults[selectedIndex]) {
        router.push(allResults[selectedIndex].path)
        onClose()
        return
      }
      // Focus trap
      if (e.key === 'Tab' && paletteRef.current) {
        const focusable = Array.from(
          paletteRef.current.querySelectorAll<HTMLElement>(
            'button, input, [tabindex]:not([tabindex="-1"])'
          )
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, router, onClose])

  if (!isOpen) return null

  const allResults = [...results.titleMatches, ...results.contentMatches]
  const showResults = query.length >= 2

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        ref={paletteRef}
        role="dialog"
        aria-label="Search"
        aria-modal="true"
        style={{
          width: '90vw',
          maxWidth: '560px',
          background: 'var(--apple-bg-secondary, #1c1c1e)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Search size={16} color="var(--apple-label-secondary, #888)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search topics, terms…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--apple-label, #fff)',
              fontSize: '15px',
            }}
          />
          <span style={{
            fontSize: '11px',
            color: '#555',
            background: '#2a2a2e',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>ESC</span>
        </div>

        {/* Loading state — shown unconditionally when fetching */}
        {loading && (
          <div style={{ padding: '12px 16px', color: '#666', fontSize: '13px' }}>
            Loading…
          </div>
        )}

        {/* Results panel — only shown when query >= 2 chars */}
        {showResults && !loading && (
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '6px 0' }}>
            {!loading && allResults.length === 0 && (
              <div style={{ padding: '12px 16px', color: '#666', fontSize: '13px' }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Topic title matches */}
            {!loading && results.titleMatches.length > 0 && (
              <>
                <div style={{
                  padding: '6px 16px 4px',
                  fontSize: '10px',
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Topics
                </div>
                {results.titleMatches.map((entry, i) => (
                  <button
                    key={entry.slug}
                    aria-selected={selectedIndex === i}
                    onClick={() => { router.push(entry.path); onClose() }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 16px',
                      background: selectedIndex === i ? 'rgba(99,102,241,0.15)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--apple-label, #fff)' }}>
                      {highlightMatch(entry.title, query)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#555', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {entry.examCode} · {entry.domainName}
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Content matches */}
            {!loading && results.contentMatches.length > 0 && (
              <>
                <div style={{
                  padding: '6px 16px 4px',
                  marginTop: results.titleMatches.length > 0 ? '4px' : 0,
                  fontSize: '10px',
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderTop: results.titleMatches.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  In content
                </div>
                {results.contentMatches.map((entry, i) => {
                  const globalIdx = results.titleMatches.length + i
                  const snippet = extractSnippet(entry.text, query)
                  return (
                    <button
                      key={entry.slug}
                      aria-selected={selectedIndex === globalIdx}
                      onClick={() => { router.push(entry.path); onClose() }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        background: selectedIndex === globalIdx ? 'rgba(99,102,241,0.15)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '13px', color: 'var(--apple-label, #fff)' }}>
                        {entry.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                        {highlightMatch(snippet, query)}
                      </div>
                    </button>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
