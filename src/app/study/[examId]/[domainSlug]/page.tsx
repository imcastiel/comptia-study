import Link from 'next/link'
import { ChevronRight, Lock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { existsSync } from 'fs'
import path from 'path'
import { db } from '@/db'
import { domains, topics, exams } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

interface Params { examId: string; domainSlug: string }

const EXAM_CODE: Record<string, string> = {
  core1: '220-1201',
  core2: '220-1202',
}

function hasContent(examId: string, topicSlug: string): boolean {
  const filePath = path.join(process.cwd(), 'src', 'content', examId, `${topicSlug}.mdx`)
  return existsSync(filePath)
}

export default async function DomainPage({ params }: { params: Promise<Params> }) {
  const { examId, domainSlug } = await params
  const examCode = EXAM_CODE[examId]
  if (!examCode) notFound()

  const [exam] = await db.select().from(exams).where(eq(exams.code, examCode))
  if (!exam) notFound()

  const [domain] = await db.select().from(domains)
    .where(and(eq(domains.examId, exam.id), eq(domains.slug, domainSlug)))
  if (!domain) notFound()

  const topicList = await db.select().from(topics)
    .where(eq(topics.domainId, domain.id))
    .orderBy(topics.orderIndex)

  const topicsWithContent = topicList.map((t) => ({
    ...t,
    available: hasContent(examId, t.slug),
  }))

  const availableCount = topicsWithContent.filter((t) => t.available).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--apple-label-secondary)] mb-6">
        <Link href="/" className="text-[var(--apple-blue)]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/study/${examId}`} className="text-[var(--apple-blue)]">{exam.code}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{domain.name}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-[12px] font-semibold text-[var(--apple-blue)] uppercase tracking-wide">Domain {domain.number}</p>
          <span className="text-[11px] font-semibold bg-[var(--apple-orange)]/10 text-[var(--apple-orange)] px-2 py-0.5 rounded-full">
            {domain.weightPercent}% of exam
          </span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight">{domain.name}</h1>
        {domain.description && (
          <p className="text-[15px] text-[var(--apple-label-secondary)] mt-2">{domain.description}</p>
        )}
        {availableCount < topicList.length && (
          <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-2">
            {availableCount} of {topicList.length} topics available
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {topicsWithContent.map((topic) =>
          topic.available ? (
            <Link
              key={topic.id}
              href={`/study/${examId}/${domainSlug}/${topic.slug}`}
              className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm group"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[var(--apple-fill)] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-mono font-semibold text-[var(--apple-label-secondary)]">
                  {topic.objectiveId}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{topic.title}</p>
                {topic.description && (
                  <p className="text-[12px] text-[var(--apple-label-secondary)] mt-0.5 line-clamp-1">{topic.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
            </Link>
          ) : (
            <div
              key={topic.id}
              className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] opacity-50"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[var(--apple-fill)] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-mono font-semibold text-[var(--apple-label-secondary)]">
                  {topic.objectiveId}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{topic.title}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Lock className="w-3 h-3 text-[var(--apple-label-tertiary)]" />
                <span className="text-[11px] text-[var(--apple-label-tertiary)]">Coming soon</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
