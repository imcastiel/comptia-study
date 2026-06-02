/** Binary study outcome from the tap-through rating UI. */
export type ReviewOutcome = 'got_it' | 'miss'

/** Map the binary outcome onto the existing SM-2 quality scale. */
export function qualityFromOutcome(outcome: ReviewOutcome): 1 | 4 {
  return outcome === 'got_it' ? 4 : 1
}
