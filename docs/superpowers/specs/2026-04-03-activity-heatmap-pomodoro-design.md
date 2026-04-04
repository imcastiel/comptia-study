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

One row per calendar day.

```typescript
studyActivityLog = sqliteTable('study_activity_log', {
  date: text('date').primaryKey(),           // "2026-04-03"
  minutesActive: integer('minutes_active').notNull().default(0),
})
```

### New table: `studyTopicVisits`

Deduplication log — ensures each topic is counted once per day for the tooltip.

```typescript
studyTopicVisits = sqliteTable('study_topic_visits', {
  date: text('date').notNull(),
  topicId: text('topic_id').notNull(),
}, t => ({
  unq: unique().on(t.date, t.topicId),
}))
```

No changes to existing tables.

### Heatmap query

```sql
SELECT l.date, l.minutesActive, COUNT(v.topicId) as topicsVisited
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
Track `scroll`, `mousemove`, `keydown` → update `lastInteractionAt`. If more than 60 seconds pass with zero interaction and no active pomodoro, the minute does not count.

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

### API endpoint: `POST /api/activity/heartbeat`

Request body:
```typescript
{ topicId?: string }
```

Server-side (two writes, in order):
1. `INSERT OR IGNORE INTO study_topic_visits(date, topicId)` — only when `topicId` is provided
2. `INSERT INTO study_activity_log(date, minutes_active) VALUES(today, 1) ON CONFLICT(date) DO UPDATE SET minutes_active = minutes_active + 1`

Returns `204 No Content`.

### `useActivityTracker` hook

```typescript
// src/hooks/use-activity-tracker.ts
function useActivityTracker(topicId?: string): void
```

- Sets up `visibilitychange` listener
- Sets up `scroll`, `mousemove`, `keydown` listeners — debounced to update `lastInteractionAt` ref
- Reads `pomodoroActive` from `PomodoroContext`
- Runs `setInterval` every 60_000ms — fires heartbeat if conditions met
- Cleans up all listeners and interval on unmount

**Where it runs:** Rendered as an invisible client component (`<ActivityTracker topicId={topic.id} />`) inside `src/app/study/[examId]/[domainSlug]/[topicSlug]/page.tsx`.

---

## Pomodoro Timer

### State

Lives in a React context so both `TopNav` (renders the pill) and `useActivityTracker` (reads `pomodoroActive`) can access it without prop drilling.

```typescript
// src/contexts/pomodoro-context.tsx
interface PomodoroState {
  phase: 'idle' | 'work' | 'break'
  secondsLeft: number
  pomodoroCount: number        // resets to 0 after long break
  pomodoroActive: boolean      // true only during 'work' phase
  start: () => void
  pause: () => void
  reset: () => void
  skipBreak: () => void
}
```

`PomodoroProvider` wraps the app in `src/app/layout.tsx`.

### Timing (standard pomodoro, not configurable)

| Phase | Duration |
|-------|----------|
| Work | 25 minutes |
| Short break | 5 minutes |
| Long break (after 4 pomodoros) | 15 minutes |

### Timer mechanics

- `setInterval` every 1000ms inside the provider when `phase !== 'idle'`
- On work phase end: transition to break, increment `pomodoroCount`, show a subtle browser `Notification` if permission granted (no external dependency — Web Notifications API)
- On break phase end: transition back to `idle` (user must manually start next session)
- Interval clears on unmount and when `phase === 'idle'`

### UI: top nav pill

Rendered inside `TopNav`, replacing no existing element (inserted between search icon and the rightmost edge, or between the logo spacer and search).

**Visual states:**

| State | Appearance |
|-------|-----------|
| Idle | Gray pill: `▶ 25:00` — `color: var(--apple-label-tertiary)` |
| Work (running) | Indigo pill: pulsing dot + `23:47` — `background: rgba(99,102,241,0.12)`, `border: rgba(99,102,241,0.3)` |
| Break | Green pill: `04:32 break` — `background: rgba(52,211,153,0.1)`, `border: rgba(52,211,153,0.3)` |
| Paused | Indigo pill, no pulse dot: `⏸ 23:47` |

**Interactions:**
- Click → `start()` (idle) or `pause()`/`start()` toggle (work)
- Long-press (500ms) → `reset()` back to idle
- Clicking during break → `skipBreak()` (returns to idle immediately)

Uses `font-variant-numeric: tabular-nums` so the width doesn't jump as seconds tick.

---

## Activity Heatmap UI

**File:** `src/components/home/activity-heatmap.tsx`

**Data endpoint:** `GET /api/activity/history`

Returns last 52 weeks of data:
```typescript
interface ActivityDay {
  date: string        // "2026-04-03"
  minutesActive: number
  topicsVisited: number
}
```

**Layout:** 52 columns (weeks, left = oldest) × 7 rows (days, Mon top → Sun bottom). Each cell is 10×10px with 2px gap.

**Intensity levels (5 tiers):**

| Minutes | Cell color |
|---------|-----------|
| 0 | `#1a1a1f` + `1px solid rgba(255,255,255,0.06)` |
| 1–15 | `rgba(99,102,241,0.2)` |
| 16–30 | `rgba(99,102,241,0.4)` |
| 31–60 | `rgba(99,102,241,0.65)` |
| 60+ | `#6366f1` |

**Tooltip on hover:** `"Apr 3 — 42 min · 5 topics"` — plain CSS tooltip via `title` attribute or a small absolutely-positioned `<div>` on hover state.

**Month labels:** Rendered above the grid — a single pass over the 52 weeks, emit a label when the month changes.

**Day labels:** Mon / Wed / Fri on the left side (alternating, matches GitHub convention).

**Legend:** Below the grid, right-aligned: `Less ■ ■ ■ ■ ■ More` using the 5 colors.

**Location in dashboard:** `src/app/page.tsx` — between the 4 stat cards and the Recent Practice Tests section. Full width.

**Loading:** Fetch on mount, show skeleton (same grid, all cells at opacity 0.3) while loading.

---

## Files Changed

| File | Change |
|------|--------|
| `src/db/schema.ts` | Add `studyActivityLog` and `studyTopicVisits` tables |
| `src/db/migrate.ts` | Run migration to create new tables |
| `src/contexts/pomodoro-context.tsx` | **New.** Provider + hook + timer logic |
| `src/app/layout.tsx` | Wrap app in `<PomodoroProvider>` |
| `src/components/layout/top-nav.tsx` | Add pomodoro pill UI |
| `src/hooks/use-activity-tracker.ts` | **New.** Heartbeat hook |
| `src/components/study/activity-tracker.tsx` | **New.** Invisible client component wrapping the hook |
| `src/app/study/[examId]/[domainSlug]/[topicSlug]/page.tsx` | Render `<ActivityTracker topicId={...} />` |
| `src/app/api/activity/heartbeat/route.ts` | **New.** POST handler — upsert both tables |
| `src/app/api/activity/history/route.ts` | **New.** GET handler — last 52 weeks query |
| `src/components/home/activity-heatmap.tsx` | **New.** Heatmap component |
| `src/app/page.tsx` | Add `<ActivityHeatmap />` between stat cards and practice tests |

**No new npm dependencies.**

---

## Out of Scope

- Configurable pomodoro durations
- Sound effects on pomodoro completion (no audio assets)
- Tracking activity on flashcard sessions or practice tests (they have their own submit routes)
- Syncing pomodoro state across tabs
- Streak counters or badges
- Push notifications (Web Notifications API only, requires user permission)
