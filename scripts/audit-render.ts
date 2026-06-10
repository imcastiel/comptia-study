/**
 * Render audit — loads every study topic page on a running server and fails
 * if any page 500s, 404s, or renders Next's error boundary instead of content.
 *
 *   npm run dev            # in another terminal (or set BASE_URL)
 *   npm run audit:render
 *
 * Catches broken MDX (bad component props, missing files) that type checks
 * can't see, because MDX renders server-side at request time.
 */
import { eq } from 'drizzle-orm'
import { db } from '../src/db'
import { topics, domains, exams } from '../src/db/schema'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

// Next embeds the not-found boundary template in every page's HTML, so
// negative markers like "This page could not be found" false-positive on
// healthy pages. Real 404s return HTTP 404; streamed server errors render
// the error boundary. So: trust the status code, require the one element
// every topic page renders, and catch explicit error-boundary output.
const CONTENT_MARKER = 'Mark as complete'
const ERROR_MARKER = 'Application error: a server-side exception has occurred'

async function login(): Promise<string> {
  // Prefer an existing account (AUDIT_CODE) — account generation is
  // rate-limited per IP, so repeated audit runs would lock themselves out.
  const code = process.env.AUDIT_CODE
  const res = code
    ? await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
    : await fetch(`${BASE_URL}/api/auth/generate`, { method: 'POST' })
  if (!res.ok) throw new Error(`Audit login failed: HTTP ${res.status}${code ? '' : ' (rate-limited? set AUDIT_CODE to reuse an account)'}`)
  const cookie = res.headers.get('set-cookie')
  if (!cookie) throw new Error('No auth cookie returned')
  return cookie.split(';')[0]
}

async function main() {
  const rows = await db
    .select({ examId: exams.id, domainSlug: domains.slug, topicSlug: topics.slug, title: topics.title })
    .from(topics)
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .innerJoin(exams, eq(domains.examId, exams.id))

  if (rows.length === 0) {
    console.error('No topics found — is the right DATABASE_URL configured?')
    process.exit(1)
  }

  const cookie = await login()
  const failures: string[] = []
  let checked = 0

  for (const row of rows) {
    // URL exam segment is 'core1'/'core2'; the DB id is 'exam-core1'.
    const examSegment = row.examId.replace(/^exam-/, '')
    const url = `${BASE_URL}/study/${examSegment}/${row.domainSlug}/${row.topicSlug}`
    try {
      const res = await fetch(url, { headers: { cookie } })
      const body = await res.text()
      if (!res.ok) {
        failures.push(`${url} — HTTP ${res.status}`)
      } else if (body.includes(ERROR_MARKER)) {
        failures.push(`${url} — server-side exception while rendering`)
      } else if (!body.includes(CONTENT_MARKER)) {
        failures.push(`${url} — rendered without topic content`)
      }
    } catch (err) {
      failures.push(`${url} — fetch failed: ${err instanceof Error ? err.message : String(err)}`)
    }
    checked++
    if (checked % 20 === 0) console.log(`…${checked}/${rows.length}`)
  }

  for (const f of failures) console.log(`[FAIL] ${f}`)
  console.log(`\nChecked ${checked} topic pages against ${BASE_URL}: ${failures.length} failing.`)
  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Render audit failed to run:', err)
  process.exit(1)
})
