export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Layers, ChevronRight, BookOpen } from 'lucide-react'
import { db } from '@/db'
import { flashcards, topics, domains, exams, flashcardReviews } from '@/db/schema'
import { eq, count, lte } from 'drizzle-orm'
import { GenerateFlashcardsButton } from '@/components/ai/generate-flashcards-button'

export default async function FlashcardsPage() {
  // Get all domains with flashcard counts
  const deckData = await db
    .select({
      domainId: domains.id,
      domainName: domains.name,
      domainSlug: domains.slug,
      examCode: exams.code,
      examId: exams.id,
      cardCount: count(flashcards.id),
    })
    .from(domains)
    .innerJoin(exams, eq(domains.examId, exams.id))
    .innerJoin(topics, eq(topics.domainId, domains.id))
    .innerJoin(flashcards, eq(flashcards.topicId, topics.id))
    .groupBy(domains.id)
    .orderBy(domains.orderIndex)

  const totalCards = deckData.reduce((sum, d) => sum + Number(d.cardCount), 0)
  const now = new Date().toISOString()

  // Due today count
  const dueToday = await db
    .select({ cnt: count(flashcardReviews.id) })
    .from(flashcardReviews)
    .where(lte(flashcardReviews.nextReviewAt, now))

  const dueCount = Number(dueToday[0]?.cnt ?? 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Flashcards</h1>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">
          {totalCards} cards across {deckData.length} decks
          {dueCount > 0 && (
            <span className="ml-2 bg-[var(--apple-orange)]/15 text-[var(--apple-orange)] text-[12px] font-semibold px-2 py-0.5 rounded-full">
              {dueCount} due today
            </span>
          )}
        </p>
      </div>

      <GenerateFlashcardsButton />

      {dueCount > 0 && (
        <div className="mb-6">
          <Link
            href="/flashcards/session?mode=due"
            className="flex items-center gap-4 bg-[var(--apple-blue)] rounded-[16px] p-4 card-lift shadow-md"
          >
            <div className="w-10 h-10 rounded-[10px] bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-white">Review Due Cards</p>
              <p className="text-[12px] text-white/70">{dueCount} cards scheduled for today</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/70" />
          </Link>
        </div>
      )}

      {deckData.length === 0 ? (
        <div className="bg-[var(--apple-fill)] rounded-[20px] p-10 text-center">
          <BookOpen className="w-12 h-12 text-[var(--apple-label-tertiary)] mx-auto mb-3" />
          <p className="text-[16px] font-semibold mb-1">No flashcards yet</p>
          <p className="text-[14px] text-[var(--apple-label-secondary)]">
            Flashcard decks will appear here once content is seeded.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {deckData.map((deck) => (
            <Link
              key={deck.domainId}
              href={`/flashcards/session?domainId=${deck.domainId}`}
              className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[var(--apple-green)]/10 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[var(--apple-green)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground truncate">{deck.domainName}</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)]">
                  {deck.examCode} · {deck.cardCount} cards
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
