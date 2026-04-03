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
    .replace(/^---[\s\S]*?---\n?/, '')              // frontmatter
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
    if (!/^[a-z0-9-]+$/i.test(examDir)) {
      console.warn(`[search] Invalid examDir: ${examDir}`)
      continue
    }
    if (!/^[a-z0-9-]+$/i.test(row.slug)) {
      console.warn(`[search] Invalid slug: ${row.slug}`)
      continue
    }
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

  return NextResponse.json(entries, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}
