# Search Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the search button in the top nav functional — full-content command palette (⌘K) that searches all 63 MDX topic files.

**Architecture:** A `GET /api/search/index` route queries the DB for all topics and reads their MDX files server-side, stripping syntax to plain text. The result is fetched lazily on first palette open and cached in a module-level variable client-side. All filtering runs client-side — no server round-trips after the initial fetch.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM (SQLite), Tailwind CSS, Lucide React icons.

**Note on tests:** This project has no test framework installed (no jest/vitest). Verification steps use `curl` for the API and browser checks for the UI.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/search/index/route.ts` | Create | DB query + MDX read + strip → `SearchEntry[]` JSON |
| `src/components/search/command-palette.tsx` | Create | Palette UI: index fetch, search logic, keyboard nav, focus trap |
| `src/components/layout/top-nav.tsx` | Modify | Add `isOpen` state, ⌘K listener, render `<CommandPalette>` |

---

## Task 1: Search Index API Route

**Files:**
- Create: `src/app/api/search/index/route.ts`

**Context:** The DB `exams.id` field contains values like `'exam-core1'` and `'exam-core2'`. The MDX files live at `src/content/core1/` and `src/content/core2/`. Strip the `'exam-'` prefix to get the directory name. The Drizzle import pattern used throughout this codebase: `import { db } from '@/db'` and `import { topics, domains, exams } from '@/db/schema'`.

- [ ] **Step 1: Create the route file**

```typescript
// src/app/api/search/index/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { topics, domains, exams } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'

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

function stripMdx(raw: string): string {
  return raw
    .replace(/^---[\s\S]*?---\n/, '')              // frontmatter
    .replace(/```[\s\S]*?```/g, '')                 // code fences
    .replace(/<[^>]+>/g, ' ')                       // JSX/HTML tags
    .replace(/^#{1,6}\s+/gm, '')                    // headings
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')       // bold/italic
    .replace(/`([^`]+)`/g, '$1')                    // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')        // links
    .replace(/\s+/g, ' ')                           // collapse whitespace
    .trim()
}

export async function GET() {
  const rows = await db
    .select({
      slug: topics.slug,
      title: topics.title,
      domainSlug: domains.slug,
      domainName: domains.name,
      rawExamId: exams.id,
      examCode: exams.code,
    })
    .from(topics)
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .innerJoin(exams, eq(domains.examId, exams.id))

  const entries: SearchEntry[] = []

  for (const row of rows) {
    const examDir = row.rawExamId.replace('exam-', '')
    const filePath = join(process.cwd(), 'src', 'content', examDir, `${row.slug}.mdx`)

    let text = ''
    try {
      const raw = readFileSync(filePath, 'utf-8')
      text = stripMdx(raw)
    } catch {
      console.warn(`[search] Missing MDX file: ${filePath}`)
      continue
    }

    entries.push({
      slug: row.slug,
      title: row.title,
      domainName: row.domainName,
      examCode: row.examCode,
      examId: examDir,
      domainSlug: row.domainSlug,
      path: `/study/${examDir}/${row.domainSlug}/${row.slug}`,
      text,
    })
  }

  return NextResponse.json(entries)
}
```

- [ ] **Step 2: Start the dev server if not running**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 3: Test the endpoint**

```bash
curl -s http://localhost:3000/api/search/index | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Total entries: {len(data)}')
print('First entry:')
e = data[0]
print(f'  slug: {e[\"slug\"]}')
print(f'  title: {e[\"title\"]}')
print(f'  path: {e[\"path\"]}')
print(f'  text (first 100 chars): {e[\"text\"][:100]}')
print(f'  examId: {e[\"examId\"]}')
"
```

Expected output (exact numbers may vary):
```
Total entries: 63
First entry:
  slug: 1-1-mobile-device-hardware
  title: 1.1 Mobile Device Hardware Components
  path: /study/core1/mobile-devices/1-1-mobile-device-hardware
  text (first 100 chars): Mobile Device Hardware Components Laptop Display Technology Display Types Laptop displays come in s
  examId: core1
```

- [ ] **Step 4: Verify no JSX tags leak into text**

```bash
curl -s http://localhost:3000/api/search/index | python3 -c "
import json, sys
data = json.load(sys.stdin)
leaks = [(e['slug'], e['text']) for e in data if '<' in e['text'] or '>' in e['text']]
if leaks:
    for slug, text in leaks[:3]:
        print(f'LEAK in {slug}: {text[:200]}')
else:
    print('OK — no JSX/HTML leaking into text')
"
```

Expected: `OK — no JSX/HTML leaking into text`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/search/index/route.ts
git commit -m "feat: add search index API route"
```

---

## Task 2: Command Palette Component

**Files:**
- Create: `src/components/search/command-palette.tsx`

**Context:** This is a `'use client'` component. The app uses CSS variables for theming — `var(--apple-bg-secondary)`, `var(--apple-label)`, `var(--apple-label-secondary)`, etc. The accent color for highlights is `rgba(99,102,241,0.3)`. Use `useRouter` from `'next/navigation'` for navigation. Import `Search` icon from `'lucide-react'`.

The module-level cache (`let cachedIndex`) sits outside the component function — this is intentional. It survives unmount/remount. Do NOT move it inside the component or convert it to `useRef`.

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/components/search
```

- [ ] **Step 2: Write the component**

```tsx
// src/components/search/command-palette.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
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

        {/* Results panel */}
        {showResults && (
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '6px 0' }}>
            {loading && (
              <div style={{ padding: '12px 16px', color: '#666', fontSize: '13px' }}>
                Loading…
              </div>
            )}

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
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors (or only pre-existing unrelated errors)

- [ ] **Step 4: Commit**

```bash
git add src/components/search/command-palette.tsx
git commit -m "feat: add command palette search component"
```

---

## Task 3: Wire TopNav

**Files:**
- Modify: `src/components/layout/top-nav.tsx`

**Context:** The current `top-nav.tsx` is already `'use client'`. It has a search `<button>` with `aria-label="Search"` and no `onClick`. Add: (1) `searchOpen` state, (2) a `useEffect` that listens for ⌘K/Ctrl+K globally, (3) `onClick={() => setSearchOpen(true)}` on the search button, (4) import and render `<CommandPalette>` outside the `<header>` (as a sibling, wrapped in a fragment `<>`).

- [ ] **Step 1: Read the current file to get exact line content before editing**

Read `src/components/layout/top-nav.tsx` (it's ~57 lines).

- [ ] **Step 2: Replace the file with the updated version**

```tsx
// src/components/layout/top-nav.tsx
'use client'

import Link from 'next/link'
import { Shield, Search, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [isDark, setIsDark] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(document.documentElement.classList.contains('dark') || mq.matches)
  }, [])

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    const next = !html.classList.contains('dark')
    html.classList.toggle('dark', next)
    setIsDark(next)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-[var(--apple-separator)]">
        <div className="flex h-full items-center px-4 gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--apple-blue)] font-semibold text-[15px] tracking-tight shrink-0"
          >
            <div className="w-7 h-7 rounded-[8px] bg-[var(--apple-blue)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-foreground">CompTIA A+</span>
          </Link>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors

- [ ] **Step 4: Manual browser verification**

Open http://localhost:3000. Verify:
1. Clicking the search icon (🔍) in the top right opens the palette overlay
2. ⌘K (or Ctrl+K) opens the palette from anywhere on the page
3. Typing "dhcp" (min 2 chars) shows topic results under "Topics" and content results under "In content"
4. Clicking a result navigates to the correct `/study/...` URL
5. Pressing Esc closes the palette
6. Pressing Enter on a highlighted result navigates
7. Clicking the backdrop (outside the card) closes the palette
8. On first open, a brief "Loading…" state appears while the index fetches (~300-500ms); subsequent opens show results immediately

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/top-nav.tsx
git commit -m "feat: wire search button and cmd+k to command palette"
```
