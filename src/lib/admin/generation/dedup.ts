export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Jaccard similarity over word sets — cheap, dependency-free, good enough to flag near-dupes.
export function similarity(a: string, b: string): number {
  const sa = new Set(normalize(a).split(' ').filter(Boolean))
  const sb = new Set(normalize(b).split(' ').filter(Boolean))
  if (sa.size === 0 && sb.size === 0) return 1
  let inter = 0
  for (const w of sa) if (sb.has(w)) inter++
  const union = sa.size + sb.size - inter
  return union === 0 ? 0 : inter / union
}

export interface DraftText { key: string; text: string }
export interface ExistingText { id: string; text: string }

// Returns { [draftKey]: existingId } for drafts whose best match exceeds threshold.
export function flagDuplicates(drafts: DraftText[], existing: ExistingText[], threshold = 0.6): Record<string, string> {
  const flags: Record<string, string> = {}
  for (const d of drafts) {
    let best: { id: string; score: number } | null = null
    for (const e of existing) {
      const score = similarity(d.text, e.text)
      if (!best || score > best.score) best = { id: e.id, score }
    }
    if (best && best.score >= threshold) flags[d.key] = best.id
  }
  return flags
}
