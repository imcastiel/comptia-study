/**
 * Objective keyword coverage.
 *
 * Topic descriptions already encode the official exam-objective bullet items
 * ("Common ports (21,22,…), TCP vs UDP, DNS, DHCP, …"). Treating each
 * top-level comma-separated phrase as a keyword lets us ask, per topic:
 * does at least one question or flashcard exercise this item? Uncovered
 * keywords are the platform's content gaps — what a zero-experience learner
 * would never get tested on.
 */

const STOPWORDS = new Set(['and', 'or', 'vs', 'the', 'of', 'to', 'for', 'with', 'a', 'an', 'in', 'on', 'by', 'their'])

/** Split a description on top-level commas (commas inside parens don't count). */
export function extractKeywords(description: string): string[] {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const ch of description) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      out.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  out.push(current)

  return out
    .map((k) => k.replace(/\([^)]*\)/g, ' ')) // parentheticals are detail, not the keyword
    .map((k) => k.replace(/\s+/g, ' ').replace(/[.]+$/, '').trim())
    .filter((k) => k.length >= 3 && !/^etc\b/i.test(k))
}

// Hyphen/slash spelling variants (Wi-Fi vs WiFi, HTTP/S vs HTTPS) must match,
// so both keyword tokens and item texts drop those characters before compare.
function canonical(text: string): string {
  return text.toLowerCase().replace(/[-/]/g, '')
}

function significantTokens(keyword: string): string[] {
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9/+.-]+/)
    .map(canonical)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

/**
 * A keyword is covered when one single item's text contains every
 * significant token of the keyword (so "TCP vs UDP" needs an item that
 * mentions both protocols, not two unrelated items).
 */
export function findUncovered(keywords: string[], itemTexts: string[]): string[] {
  const lowered = itemTexts.map(canonical)
  return keywords.filter((keyword) => {
    const tokens = significantTokens(keyword)
    if (tokens.length === 0) return false
    return !lowered.some((text) => tokens.every((tok) => text.includes(tok)))
  })
}
