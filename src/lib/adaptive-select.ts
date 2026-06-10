/**
 * Adaptive question selection — the practice loop acting on mastery data.
 *
 * Each candidate question is weighted by how weak the user is on its topic
 * and how recently they saw that exact question, then sampled without
 * replacement. Weak topics dominate, but every question keeps a nonzero
 * weight so sessions never become deterministic drills of one topic.
 */

export interface CandidateQuestion {
  id: string
  topicId: string
}

export interface AdaptiveSelectInput {
  candidates: CandidateQuestion[]
  /** topicId → masteryScore (0–100). Topics absent = never practiced. */
  masteryByTopic: Record<string, number>
  /** Question ids seen in the last few days — strongly deprioritized. */
  recentQuestionIds: ReadonlySet<string>
  /** Question ids ever seen — mildly deprioritized vs. fresh ones. */
  seenQuestionIds: ReadonlySet<string>
  count: number
  /** Injectable for deterministic tests; defaults to Math.random. */
  random?: () => number
}

/** Mastery floor keeps strong topics in rotation for retention. */
const MIN_TOPIC_WEIGHT = 0.05
/** Unpracticed topics rank between weak and strong: explore, don't flood. */
const UNSEEN_TOPIC_WEIGHT = 0.6
const RECENT_FACTOR = 0.15
const SEEN_FACTOR = 0.6

export function questionWeight(
  q: CandidateQuestion,
  masteryByTopic: Record<string, number>,
  recentQuestionIds: ReadonlySet<string>,
  seenQuestionIds: ReadonlySet<string>,
): number {
  const mastery = masteryByTopic[q.topicId]
  const topicWeight = mastery === undefined
    ? UNSEEN_TOPIC_WEIGHT
    : Math.max(MIN_TOPIC_WEIGHT, (100 - mastery) / 100)

  const recencyFactor = recentQuestionIds.has(q.id) ? RECENT_FACTOR
    : seenQuestionIds.has(q.id) ? SEEN_FACTOR
    : 1

  return topicWeight * recencyFactor
}

export function selectAdaptive(input: AdaptiveSelectInput): string[] {
  const { candidates, masteryByTopic, recentQuestionIds, seenQuestionIds, count } = input
  const random = input.random ?? Math.random

  const pool = candidates.map((q) => ({
    id: q.id,
    weight: questionWeight(q, masteryByTopic, recentQuestionIds, seenQuestionIds),
  }))

  const selected: string[] = []
  let totalWeight = pool.reduce((s, p) => s + p.weight, 0)

  while (selected.length < count && pool.length > 0) {
    let target = random() * totalWeight
    let picked = pool.length - 1
    for (let i = 0; i < pool.length; i++) {
      target -= pool[i].weight
      if (target <= 0) { picked = i; break }
    }
    const [winner] = pool.splice(picked, 1)
    totalWeight -= winner.weight
    selected.push(winner.id)
  }

  return selected
}
