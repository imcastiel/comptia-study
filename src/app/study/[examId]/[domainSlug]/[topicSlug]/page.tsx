import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Clock, Layers } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { rehypeGlossary } from '@/lib/rehype-glossary'
import { readFile } from 'fs/promises'
import path from 'path'
import { getMDXComponents } from '@/components/study/mdx-components'
import { CompleteButton } from '@/components/study/complete-button'
import { ReadingProgress } from '@/components/study/reading-progress'
import { ActivityTracker } from '@/components/study/activity-tracker'
import { ArticleWrapper } from '@/components/study/article-wrapper'
import { db } from '@/db'
import { domains, topics, exams, studyProgress } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

interface Params {
  examId: string
  domainSlug: string
  topicSlug: string
}

const EXAM_CODE: Record<string, string> = {
  core1: '220-1201',
  core2: '220-1202',
}

async function getProgress(topicId: string) {
  const [existing] = await db.select().from(studyProgress).where(eq(studyProgress.topicId, topicId))
  return existing ?? null
}

async function getMDXContent(examId: string, topicSlug: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), 'src', 'content', examId, `${topicSlug}.mdx`)
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const { examId, domainSlug, topicSlug } = await params
  const examCode = EXAM_CODE[examId]
  if (!examCode) notFound()

  const [exam] = await db.select().from(exams).where(eq(exams.code, examCode))
  if (!exam) notFound()

  const [domain] = await db.select().from(domains)
    .where(and(eq(domains.examId, exam.id), eq(domains.slug, domainSlug)))
  if (!domain) notFound()

  const [topic] = await db.select().from(topics)
    .where(and(eq(topics.domainId, domain.id), eq(topics.slug, topicSlug)))
  if (!topic) notFound()

  // Get adjacent topics for prev/next navigation
  const allTopics = await db.select().from(topics)
    .where(eq(topics.domainId, domain.id))
    .orderBy(topics.orderIndex)
  const currentIndex = allTopics.findIndex((t) => t.id === topic.id)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  const [progress, mdxContent] = await Promise.all([
    getProgress(topic.id),
    getMDXContent(examId, topicSlug),
  ])

  return (
    <>
    <ReadingProgress />
    <ActivityTracker topicId={topic.id} />
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--apple-label-secondary)] mb-6 flex-wrap animate-fade-in">
        <Link href={`/study/${examId}`} className="text-[var(--apple-blue)] hover:underline">{exam.code}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/study/${examId}/${domainSlug}`} className="text-[var(--apple-blue)] hover:underline">{domain.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{topic.title}</span>
      </div>

      {/* Topic header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono font-semibold bg-[var(--apple-blue)]/10 text-[var(--apple-blue)] px-2 py-1 rounded-[6px]">
            Objective {topic.objectiveId}
          </span>
          <span className="text-[11px] text-[var(--apple-label-tertiary)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~10 min read
          </span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight leading-tight">{topic.title}</h1>
        {topic.description && (
          <p className="text-[15px] text-[var(--apple-label-secondary)] mt-2 leading-relaxed">{topic.description}</p>
        )}
      </div>

      {/* Complete button */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[var(--apple-separator)]">
        <CompleteButton
          topicId={topic.id}
          initialStatus={(progress?.status ?? 'not_started') as 'not_started' | 'in_progress' | 'completed' | 'needs_review'}
        />
      </div>

      {/* MDX Content */}
      <ArticleWrapper>
        {mdxContent ? (
          <MDXRemote
            source={mdxContent}
            components={getMDXComponents()}
            options={{
              mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeGlossary] },
              // Allow JS expressions in MDX (our content files are trusted — not user input)
              blockJS: false,
            }}
          />
        ) : (
          <div className="bg-[var(--apple-fill)] rounded-[16px] p-8 text-center">
            <Layers className="w-10 h-10 text-[var(--apple-label-tertiary)] mx-auto mb-3" />
            <p className="text-[16px] font-semibold text-foreground mb-1">Content coming soon</p>
            <p className="text-[14px] text-[var(--apple-label-secondary)]">
              Study content for objective {topic.objectiveId} is being prepared.
            </p>
          </div>
        )}
      </ArticleWrapper>

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--apple-separator)]">
        {prevTopic ? (
          <Link
            href={`/study/${examId}/${domainSlug}/${prevTopic.slug}`}
            className="flex items-center gap-2 text-[13px] font-medium text-[var(--apple-blue)] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="line-clamp-1 max-w-[200px]">{prevTopic.objectiveId} {prevTopic.title}</span>
          </Link>
        ) : <div />}

        {nextTopic ? (
          <Link
            href={`/study/${examId}/${domainSlug}/${nextTopic.slug}`}
            className="flex items-center gap-2 text-[13px] font-medium text-[var(--apple-blue)] hover:underline"
          >
            <span className="line-clamp-1 max-w-[200px]">{nextTopic.objectiveId} {nextTopic.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
    </>
  )
}
