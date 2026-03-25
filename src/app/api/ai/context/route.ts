// src/app/api/ai/context/route.ts
import { db } from '@/db'
import { flashcardReviews, flashcards, topics, domains, exams, studyProgress, questionAttempts, examAttempts, questions } from '@/db/schema'
import { eq, lte, and, count, sql } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topicSlug = searchParams.get('topicSlug')
  const domainSlug = searchParams.get('domainSlug')

  try {
    // Step 1a: resolve domainId + current topic info from URL slugs
    let domainId: string | null = null
    let topicTitle: string | null = null
    let examCode: string | null = null
    let domainName: string | null = null
    if (topicSlug && domainSlug) {
      const rows = await db
        .select({
          domainId: topics.domainId,
          topicTitle: topics.title,
          examCode: exams.code,
          domainName: domains.name,
        })
        .from(topics)
        .innerJoin(domains, eq(topics.domainId, domains.id))
        .innerJoin(exams, eq(domains.examId, exams.id))
        .where(and(eq(topics.slug, topicSlug), eq(domains.slug, domainSlug)))
        .limit(1)
      if (rows[0]) {
        domainId = rows[0].domainId
        topicTitle = rows[0].topicTitle
        examCode = rows[0].examCode
        domainName = rows[0].domainName
      }
    }

    // Step 1b: due card count (domain-scoped if domainId known, else global)
    const now = new Date().toISOString()
    let dueCount = 0
    if (domainId) {
      const [row] = await db
        .select({ cnt: count() })
        .from(flashcardReviews)
        .innerJoin(flashcards, eq(flashcardReviews.flashcardId, flashcards.id))
        .innerJoin(topics, eq(flashcards.topicId, topics.id))
        .where(and(lte(flashcardReviews.nextReviewAt, now), eq(topics.domainId, domainId)))
      dueCount = Number(row?.cnt ?? 0)
    } else {
      const [row] = await db
        .select({ cnt: count() })
        .from(flashcardReviews)
        .where(lte(flashcardReviews.nextReviewAt, now))
      dueCount = Number(row?.cnt ?? 0)
    }

    // Step 1c: last studied topic from study_progress
    let lastTopicSlug: string | null = null
    let lastTopicTitle: string | null = null
    let lastTopicPath: string | null = null
    const lastRows = await db
      .select({
        slug: topics.slug,
        title: topics.title,
        domSlug: domains.slug,
        examId: exams.id,
      })
      .from(studyProgress)
      .innerJoin(topics, eq(studyProgress.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .innerJoin(exams, eq(domains.examId, exams.id))
      .where(sql`${studyProgress.lastStudiedAt} IS NOT NULL`)
      .orderBy(sql`${studyProgress.lastStudiedAt} DESC`)
      .limit(1)
    if (lastRows[0]) {
      lastTopicSlug = lastRows[0].slug
      lastTopicTitle = lastRows[0].title
      lastTopicPath = `/study/${lastRows[0].examId}/${lastRows[0].domSlug}/${lastRows[0].slug}`
    }

    // Step 1d: weakest domain from completed question_attempts
    let weakDomain: string | null = null
    const weakRows = await db
      .select({
        domainName: domains.name,
      })
      .from(questionAttempts)
      .innerJoin(examAttempts, eq(questionAttempts.examAttemptId, examAttempts.id))
      .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .where(eq(examAttempts.isCompleted, true))
      .groupBy(domains.id, domains.name)
      .having(sql`COUNT(*) >= 5`)
      .orderBy(sql`CAST(SUM(${questionAttempts.isCorrect}) AS REAL) / COUNT(*) ASC`)
      .limit(1)
    weakDomain = weakRows[0]?.domainName ?? null

    return Response.json({ dueCount, domainId, topicTitle, examCode, domainName, lastTopicSlug, lastTopicTitle, lastTopicPath, weakDomain })
  } catch (err) {
    console.error('[/api/ai/context]', err)
    return Response.json({ dueCount: 0, domainId: null, topicTitle: null, examCode: null, domainName: null, lastTopicSlug: null, lastTopicTitle: null, lastTopicPath: null, weakDomain: null })
  }
}
