export interface DrillFactLite {
  id: string
  term: string
  value: string
}

export type TileKind = 'term' | 'value'

export interface MatchTile {
  factId: string
  kind: TileKind
  text: string
}

export interface MatchRound {
  terms: MatchTile[]
  values: MatchTile[]
}

/**
 * Build a shuffled match round from facts.
 * @param rng injectable RNG (defaults to Math.random) for deterministic tests
 */
export function buildMatchRound(
  facts: DrillFactLite[],
  size: number,
  rng: () => number = Math.random,
): MatchRound {
  const chosen = shuffle(facts, rng).slice(0, Math.min(size, facts.length))
  const terms = shuffle(
    chosen.map((f): MatchTile => ({ factId: f.id, kind: 'term', text: f.term })),
    rng,
  )
  const values = shuffle(
    chosen.map((f): MatchTile => ({ factId: f.id, kind: 'value', text: f.value })),
    rng,
  )
  return { terms, values }
}

export function isCorrectPair(a: MatchTile, b: MatchTile): boolean {
  return a.factId === b.factId && a.kind !== b.kind
}

export interface ScoreInput {
  pairs: number
  mistakes: number
  elapsedMs: number
}

/** Higher is better. Base per pair, time bonus, mistake penalty, floored at 0. */
export function scoreRound({ pairs, mistakes, elapsedMs }: ScoreInput): number {
  const base = pairs * 100
  const seconds = elapsedMs / 1000
  const timeBonus = Math.max(0, Math.round((pairs * 5 - seconds) * 10))
  const penalty = mistakes * 50
  return Math.max(0, base + timeBonus - penalty)
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
