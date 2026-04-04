# Activity Heatmap + Pomodoro Timer Design Spec
**Date:** 2026-04-03
**Status:** Approved

---

## Overview

Add a GitHub-style activity heatmap to the dashboard measuring real study time, plus a persistent pomodoro timer in the top nav. Study time is measured via a hybrid approach: passive visibility + idle detection always running, with the idle check relaxed during an active pomodoro work session.

**Single-user app — no auth scoping required.**

---

## Data Model

### New table: `studyActivityLog`

One row per calendar day. Add to `src/db/schema.ts` — also add `unique` to the imports from `drizzle-orm/sqlite-core`.

```typescript
// Add 'unique' to the existing drizzle-orm/sqlite-core import
import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core'

export const studyActivityLog = sqliteTable('study_activity_log', {
  date: text('date').primaryKey(),           // "2026-04-03"
  minutesActive: integer('minutes_active').notNull().default(0),
})
```

### New table: `studyTopicVisits`

Deduplication log — ensures each topic is counted once per day for the tooltip. Uses the same array-based constraint syntax as all other tables in this schema.

```typescript
export const studyTopicVisits = sqliteTable('study_topic_visits', {
  date: text('date').notNull(),
  topicId: text('topic_id').notNull(),
}, (t) => [
  unique().on(t.date, t.topicId),
])
```

No primary key column — SQLite rowid serves as the implicit PK. This is intentional; no `id` column needed.

No changes to any existing tables.

### Migration

After editing `schema.ts`, run:
```bash
npm run db:generate
```
This produces a new migration file in `src/db/migrations/`. Commit that file alongside the schema change, then the migration runs automatically on next `npm run dev` (via `migrate.ts`).

### Heatmap query

```sql
SELECT l.date, l.minutes_active, COUNT(v.topic_id) as topics_visited
FROM study_activity_log l
LEFT JOIN study_topic_visits v ON l.date = v.date
WHERE l.date >= date('now', '-364 days')
GROUP BY l.date
ORDER BY l.date ASC
```

---

## Activity Detection

### Signals

**Signal 1 — Page Visibility API**
Listen to `visibilitychange`. Tab hidden → pause all counting. Only counts time when the tab is in the foreground.

**Signal 2 — Idle detection (60s window)**
Track `scroll`, `mousemove`, `keydown` → update `lastInteractionAt` ref. If more than 60 seconds pass with zero interaction and no active pomodoro, the minute does not count.

**Signal 3 — Pomodoro override**
When a pomodoro work phase is active, the 60s idle check is bypassed. Tab visible = counts. Break phases do not count toward study time.

### Heartbeat logic (every 60 seconds)

```
if tab is hidden → skip
if tab is visible AND (pomodoroActive OR Date.now() - lastInteractionAt < 60_000):
  POST /api/activity/heartbeat { topicId? }
else:
  skip
```

Each heartbeat fire credits exactly 1 minute to `minutesActive`. `setInterval` drifts slightly from wall-clock time — this is an intentional approximation, not a bug. Do not attempt to compensate for drift.

The heartbeat is fire-and-forget telemetry. The hook must silently swallow all errors (network failures, non-204 responses) with no retry logic and no user-visible error. A `catch(() => {})` or equivalent is correct here — this is a deliberate exception to the project's general error-handling rule.

### API endpoint: `POST /api/activity/heartbeat`

Request body:
```typescript
{ topicId?: string }
```

Server-side (two writes, in order):
1. Only when `topicId` is provided: `INSERT OR IGNORE INTO study_topic_visits(date, topic_id) VALUES(today, topicId)`
2. Always: `INSERT INTO study_activity_log(date, minutes_active) VALUES(today, 1) ON CONFLICT(date) DO UPDATE SET minutes_active = minutes_active + 1`

Use `new Date().toISOString().slice(0, 10)` for `today` (produces `"2026-04-03"`).

Returns `204 No Content` on success. On error, return a 500 — the client ignores it either way.

### `useActivityTracker` hook

```typescript
// src/hooks/use-activity-tracker.ts
// No 'use client' needed here — hooks are not components.
// The wrapping component (ActivityTracker) provides the 'use client' boundary.
function useActivityTracker(topicId?: string): void
```

- Sets up `visibilitychange` listener on `document`
- Sets up `scroll`, `mousemove`, `keydown` listeners on `document` — each updates a `lastInteractionAt` ref (no debounce needed — ref writes are cheap)
- Reads `pomodoroActive` from `PomodoroContext` via `usePomodoroContext()`
- Runs `setInterval` every 60_000ms — fires heartbeat if conditions met
- Cleans up all listeners and interval on unmount

### `ActivityTracker` component

```typescript
// src/components/study/activity-tracker.tsx
'use client'   // REQUIRED — this file uses useEffect and browser APIs

import { useActivityTracker } from '@/hooks/use-activity-tracker'

export function ActivityTracker({ topicId }: { topicId: string }) {
  useActivityTracker(topicId)
  return null
}
```

**Where it renders:** Inside `src/app/study/[examId]/[domainSlug]/[topicSlug]/page.tsx` (an `async` Server Component). Server Components can render Client Component children — this is valid App Router pattern.

```tsx
// Inside the topic page JSX
<ActivityTracker topicId={topic.id} />
```

---

## Pomodoro Timer

### Context

```typescript
// src/contexts/pomodoro-context.tsx
'use client'   // REQUIRED — uses useState, useEffect, setInterval

interface PomodoroState {
  phase: 'idle' | 'work' | 'break'
  secondsLeft: number
  pomodoroCount: number        // number of completed work sessions since last long break
  pomodoroActive: boolean      // true only when phase === 'work'
  start: () => void
  pause: () => void
  reset: () => void            // returns to idle from any state
  skipBreak: () => void        // ends break phase immediately, returns to idle
}
```

`PomodoroProvider` wraps the app in `src/app/layout.tsx`. **`<TopNav />` must be rendered as a descendant inside `<PomodoroProvider>` — not as a sibling.** Correct nesting:

```tsx
// src/app/layout.tsx (Server Component — no 'use client')
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PomodoroProvider>       {/* Client Component boundary */}
          <TopNav />             {/* must be inside provider */}
          {children}
        </PomodoroProvider>
      </body>
    </html>
  )
}
```

`PomodoroProvider` accepts `children: React.ReactNode`. The Server Component tree passes through `children` unchanged — this is standard App Router composition.

### Timing (standard pomodoro, not configurable)

| Phase | Duration |
|-------|----------|
| Work | 25 minutes |
| Short break | 5 minutes |
| Long break (after every 4 completed work sessions) | 15 minutes |

### Timer mechanics

- `setInterval` every 1000ms inside the provider when `phase !== 'idle'`
- On work phase end (`secondsLeft` reaches 0 during `'work'`):
  - Increment `pomodoroCount`
  - Transition to `'break'`
  - Break duration: 15 minutes if `pomodoroCount % 4 === 0`, otherwise 5 minutes
  - Reset `pomodoroCount` to 0 after the long break phase ends (i.e., when `secondsLeft` reaches 0 during a long break, before transitioning to idle)
  - Show `Notification` if `Notification.permission === 'granted'` (request permission on first `start()`)
- On break phase end (`secondsLeft` reaches 0 during `'break'`):
  - If long break: reset `pomodoroCount` to 0, then transition to `'idle'`
  - If short break: transition to `'idle'`
  - User must manually start the next work session
- Interval is cleared when `phase` transitions to `'idle'` and on unmount

### UI: top nav pill

Rendered inside `TopNav` (already `'use client'`). Reads from `PomodoroContext` via `usePomodoroContext()`.

Insert the pill between the flex spacer and the search button in the existing actions row.

**Visual states:**

| State | Appearance |
|-------|-----------|
| Idle | `▶ 25:00` — no background, text `var(--apple-label-tertiary)` |
| Work — running | Indigo pill: pulsing dot + `MM:SS` — `background: rgba(99,102,241,0.12)`, `border: 1px solid rgba(99,102,241,0.3)`, text `#c7d2fe` |
| Work — paused | Same indigo pill, no pulse dot: `⏸ MM:SS` |
| Break | Green pill: `MM:SS break` — `background: rgba(52,211,153,0.1)`, `border: 1px solid rgba(52,211,153,0.3)`, text `#6ee7b7` |

Use `font-variant-numeric: tabular-nums` on the time display so width does not jump as digits change.

**Interactions:**

| Current state | User action | Result |
|---------------|-------------|--------|
| Idle | Click | `start()` — begins 25-min work phase |
| Work (running) | Click | `pause()` |
| Work (paused) | Click | `start()` — resumes countdown |
| Break | Click | `skipBreak()` — returns to idle immediately |
| Any | Long-press (500ms `mousedown` timer) | `reset()` — returns to idle, resets `secondsLeft` to 1500 |

---

## Activity Heatmap UI

**File:** `src/components/home/activity-heatmap.tsx` — `'use client'`

### Data endpoint: `GET /api/activity/history`

Returns a plain JSON array (no envelope):
```typescript
// Response: ActivityDay[]
interface ActivityDay {
  date: string          // "2026-04-03"
  minutesActive: number
  topicsVisited: number
}
```

Empty days (no row in `studyActivityLog`) are not included — the heatmap component fills in missing dates as 0-minute cells client-side.

### Grid

- 52 columns (weeks), oldest on the left, newest on the right
- 7 rows per column (Mon = row 0 top, Sun = row 6 bottom)
- Cell size: 10×10px, gap: 2px
- Build the grid by iterating from `today - 363 days` to `today`, filling a Map keyed by date string

### Intensity levels

| Minutes | Cell color |
|---------|-----------|
| 0 | `#1a1a1f` + `border: 1px solid rgba(255,255,255,0.06)` |
| 1–15 | `rgba(99,102,241,0.2)` |
| 16–30 | `rgba(99,102,241,0.4)` |
| 31–59 | `rgba(99,102,241,0.65)` |
| 60+ (≥60) | `#6366f1` |

### Tooltip

Use the native `title` attribute on each cell div:
```
"Apr 3 — 42 min · 5 topics"
```
Format date with `new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })`.

### Month labels

Render above the grid. Walk the 52 weeks left-to-right; emit a month label (`Jan`, `Feb`, etc.) in the column where the month first appears.

### Day labels

Left of the grid: `Mon`, `Wed`, `Fri` at rows 0, 2, 4 (alternating, matches GitHub convention). Use 8px text, `color: #444`.

### Legend

Below the grid, right-aligned: `Less ■ ■ ■ ■ ■ More` using the 5 colors.

### Loading state

While fetching, render the same 52×7 grid with all cells at `opacity: 0.3` and level 0 color (skeleton). No spinner needed.

### Location in dashboard

`src/app/page.tsx` — between the 4 stat cards and the Recent Practice Tests section. Full width. Heading: `"Study Activity"` in the same style as other section headings on the page.

---

## Files Changed

| File | Change |
|------|--------|
| `src/db/schema.ts` | Add `studyActivityLog` and `studyTopicVisits` tables; add `unique` to import |
| `src/db/migrations/<generated>.sql` | **Generated** by `npm run db:generate` — commit this file |
| `src/contexts/pomodoro-context.tsx` | **New.** `'use client'` — Provider, hook, timer state |
| `src/app/layout.tsx` | Wrap `<TopNav />` and `{children}` in `<PomodoroProvider>` |
| `src/components/layout/top-nav.tsx` | Add pomodoro pill UI, reads from `usePomodoroContext()` |
| `src/hooks/use-activity-tracker.ts` | **New.** Heartbeat hook (no `'use client'` — it's a hook, not a component) |
| `src/components/study/activity-tracker.tsx` | **New.** `'use client'` — invisible component wrapping the hook |
| `src/app/study/[examId]/[domainSlug]/[topicSlug]/page.tsx` | Render `<ActivityTracker topicId={topic.id} />` |
| `src/app/api/activity/heartbeat/route.ts` | **New.** POST handler — upsert both tables, returns 204 |
| `src/app/api/activity/history/route.ts` | **New.** GET handler — last 52 weeks, returns `ActivityDay[]` |
| `src/components/home/activity-heatmap.tsx` | **New.** `'use client'` — heatmap grid component |
| `src/app/page.tsx` | Add `<ActivityHeatmap />` between stat cards and practice tests |

**No new npm dependencies.**

---

## Out of Scope

- Configurable pomodoro durations
- Sound effects on pomodoro completion
- Tracking activity on flashcard sessions or practice tests (they submit via their own API routes)
- Syncing pomodoro state across browser tabs
- Streak counters or badges
- Heatmap for anything other than topic reading time
