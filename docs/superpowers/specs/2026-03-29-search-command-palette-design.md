# Search — Command Palette Design Spec
**Date:** 2026-03-29
**Status:** Approved

---

## Overview

Add a working full-content search to the CompTIA A+ study app. The search button in `TopNav` is currently a placeholder with no `onClick`. This spec covers the full implementation: a search index built from all 63 MDX content files and a command palette UI triggered by clicking the search icon or pressing ⌘K.

**Single-user app — no auth scoping required.**

---

## Search Index

**Endpoint:** `GET /api/search/index`

**When fetched:** Lazily on first palette open. Result cached in a module-level variable (`let cachedIndex: SearchEntry[] | null = null`) at the top of `command-palette.tsx` — never re-fetched during the page session. This is intentional (not a bug): a module-level variable is used, not `useRef`, because the cache must survive component unmount/remount.

**How built (server-side, in the route handler):**
1. Query DB using Drizzle: join `topics → domains → exams`. Retrieve `topics.slug`, `topics.title`, `domains.slug as domainSlug`, `domains.name as domainName`, `exams.id as rawExamId`, `exams.code as examCode`.
2. Derive `examDir` from `rawExamId` by stripping the `'exam-'` prefix: `rawExamId.replace('exam-', '')`. This produces `'core1'` or `'core2'` — the actual directory names under `src/content/`.  Example: `exams.id = 'exam-core1'` → `examDir = 'core1'`.
3. For each topic, read the MDX file at `path.join(process.cwd(), 'src', 'content', examDir, `${topic.slug}.mdx`)`.
4. Strip all non-content syntax from the MDX to produce plain searchable text (see MDX Stripping below).
5. Build `path` as `` `/study/${examDir}/${domainSlug}/${slug}` `` — this matches the app's URL structure.
6. Return `SearchEntry[]` as JSON.

**Response payload size:** ~300–500 KB for 63 entries (full plain text per topic). This is intentional — the payload is fetched once per session and cached client-side. No compression needed at this scale.

**`SearchEntry` shape:**
```typescript
interface SearchEntry {
  slug: string        // "3-5-dhcp-dns"
  title: string       // "3.5 DHCP and DNS"
  domainName: string  // "Networking"
  examCode: string    // "Core 1"
  examId: string      // "core1"  (= examDir, already stripped of 'exam-' prefix)
  domainSlug: string  // "networking"
  path: string        // "/study/core1/networking/3-5-dhcp-dns"
  text: string        // plain text content, MDX stripped
}
```

**Error handling:** If an MDX file is missing for a topic, skip it (`console.warn` server-side, do not throw). The entry is omitted from the response — do not include it with an empty `text`.

---

## MDX Stripping

The MDX files in this codebase contain JSX component tags (e.g., `<Callout>`, `<KeyTerm>`, `<ComparisonTable>`), standard markdown syntax, and code fences. Strip all of the following to produce plain text:

Apply these regex replacements in order:
1. Frontmatter blocks: `/^---[\s\S]*?---\n/` → `''`
2. Code fences (triple backtick blocks): `/```[\s\S]*?```/g` → `''`
3. JSX/HTML tags (opening, closing, self-closing): `/<[^>]+>/g` → `' '`
4. Markdown headings: `/^#{1,6}\s+/gm` → `''`
5. Bold/italic: `/\*{1,3}([^*]+)\*{1,3}/g` → `'$1'`
6. Inline code: `/`([^`]+)`/g` → `'$1'`
7. Links: `/\[([^\]]+)\]\([^)]+\)/g` → `'$1'`
8. Collapse whitespace: `/\s+/g` → `' '`, then `.trim()`

---

## Search Logic (client-side)

Triggered on input change, debounced 150ms, minimum 2 characters.

```typescript
function search(entries: SearchEntry[], query: string): SearchResults {
  const q = query.toLowerCase()
  const titleMatches = entries.filter(e => e.title.toLowerCase().includes(q))
  const titleSlugs = new Set(titleMatches.map(e => e.slug))
  const contentMatches = entries
    .filter(e => !titleSlugs.has(e.slug) && e.text.toLowerCase().includes(q))
  return { titleMatches, contentMatches }
}
```

**Snippet extraction** (for content matches):
- Find index of first match in `text`
- Extract ~120 chars centered on the match: 40 chars before, match, 80 chars after
- Prefix with `…` if truncated at start, suffix with `…` if truncated at end

**Result limits:** Max 5 title matches, max 5 content matches displayed.

---

## Command Palette UI

**File:** `src/components/search/command-palette.tsx`

**Props:**
```typescript
interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}
```

**State and trigger:** `TopNav` owns the `isOpen` boolean state. It passes `isOpen` and `onClose` to `CommandPalette`. `TopNav` also attaches the global ⌘K / Ctrl+K listener in a `useEffect`. The `CommandPalette` is rendered inside `TopNav`'s JSX (no portal needed — `position: fixed` handles placement regardless of DOM location).

**Trigger:**
- Click the search icon button in `TopNav` → set `isOpen = true`
- ⌘K (macOS) / Ctrl+K (Windows/Linux) → `useEffect` in `TopNav` calls `setIsOpen(true)`

**Visual:**
- Centered overlay, `position: fixed`, `z-index: 9999`
- Backdrop: `rgba(0,0,0,0.5)` with `backdrop-filter: blur(4px)`
- Palette card: `max-width: 560px`, `width: 90vw`, rounded corners, dark background matching app theme
- Press Esc or click backdrop to close

**Input:**
- Auto-focused on open (use `autoFocus` attribute or `useEffect` + `ref.current.focus()`)
- Placeholder: "Search topics, terms…"
- Search icon on left, Esc badge on right

**Results panel** (shown only when query ≥ 2 chars):
- Section label "Topics" → `titleMatches` list
- Section label "In content" → `contentMatches` list (with snippet below title)
- Matched text highlighted with `<mark>` (styled with subtle indigo background, matching app accent `rgba(99,102,241,0.3)`)
- Empty state: `No results for "[query]"` if both arrays are empty

**Keyboard navigation:**
- ↑ / ↓ to move between result items (tracked via `selectedIndex` state)
- Enter to navigate to the highlighted item
- Esc to close

**Navigation on select:** `router.push(entry.path)` then call `onClose()`.

**Loading state:** While index is fetching (first open only), show a single "Loading…" row in the results panel.

---

## Accessibility

- `role="dialog"`, `aria-label="Search"`, `aria-modal="true"` on the palette card
- **Focus trap** — hand-rolled (no new dependencies): on `Tab` / `Shift+Tab` keydown, query all focusable elements inside the palette (`button, input, [tabindex]:not([tabindex="-1"])`), find the first/last, and wrap focus to the other end. Implement in a `useEffect` that attaches a `keydown` listener to `document` while the palette is open.
- Result items are `<button>` elements (keyboard accessible)
- `aria-selected` on the currently highlighted result

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/search/index/route.ts` | **New.** GET handler — DB query + MDX read + strip → `SearchEntry[]` |
| `src/components/search/command-palette.tsx` | **New.** Palette component: index fetch + module-level cache, search logic, keyboard nav, focus trap |
| `src/components/layout/top-nav.tsx` | Wire search button `onClick` + ⌘K `useEffect` → `isOpen` state; render `<CommandPalette>` |

**No new npm dependencies. No schema changes. No build scripts.**

---

## Out of Scope

- Fuzzy/typo-tolerant matching (exact substring is sufficient for 63 topics)
- Persistent search history
- Filtering by exam (Core 1 / Core 2)
- Mobile-specific treatment (palette works on mobile as-is)
- Indexed flashcard content (topic titles + body text only)
