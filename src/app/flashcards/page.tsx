export const dynamic = 'force-dynamic'

import { db } from '@/db'
import { flashcards, topics, domains, exams, flashcardReviews, drillSets, drillFacts } from '@/db/schema'
import { eq, count, and, gte } from 'drizzle-orm'
import { getUserCode } from '@/lib/auth'
import { masteryPercent, MATURE_INTERVAL_DAYS } from '@/lib/flashcard-stats'
import { TodayPlanCard } from '@/components/flashcards/today-plan-card'
import { DrillSetChip } from '@/components/flashcards/drill-set-chip'
import { DeckRow } from '@/components/flashcards/deck-row'
import { BookOpen } from 'lucide-react'

export default async function FlashcardsPage() {
  const userId = await getUserCode()

  const deckData = await db
    .select({
      domainId: domains.id, domainName: domains.name, examCode: exams.code,
      cardCount: count(flashcards.id),
    })
    .from(domains)
    .innerJoin(exams, eq(domains.examId, exams.id))
    .innerJoin(topics, eq(topics.domainId, domains.id))
    .innerJoin(flashcards, eq(flashcards.topicId, topics.id))
    .groupBy(domains.id)
    .orderBy(domains.orderIndex)

  const masteryByDomain: Record<string, number> = {}
  if (userId) {
    for (const d of deckData) {
      const rows = await db.select({ interval: flashcardReviews.intervalDays })
        .from(flashcardReviews)
        .innerJoin(flashcards, eq(flashcardReviews.flashcardId, flashcards.id))
        .innerJoin(topics, eq(flashcards.topicId, topics.id))
        .where(and(eq(topics.domainId, d.domainId), eq(flashcardReviews.userId, userId), eq(flashcardReviews.cardType, 'flashcard'), gte(flashcardReviews.intervalDays, MATURE_INTERVAL_DAYS)))
      masteryByDomain[d.domainId] = masteryPercent(rows.map((r) => r.interval), Number(d.cardCount))
    }
  }

  const sets = await db.select().from(drillSets).where(eq(drillSets.published, true)).orderBy(drillSets.orderIndex)
  const drillData = await Promise.all(sets.map(async (s) => {
    const [{ total }] = await db.select({ total: count(drillFacts.id) }).from(drillFacts).where(eq(drillFacts.drillSetId, s.id))
    let mastery = 0
    if (userId && Number(total) > 0) {
      const rows = await db.select({ interval: flashcardReviews.intervalDays })
        .from(flashcardReviews)
        .innerJoin(drillFacts, eq(flashcardReviews.drillFactId, drillFacts.id))
        .where(and(eq(drillFacts.drillSetId, s.id), eq(flashcardReviews.userId, userId), eq(flashcardReviews.cardType, 'drill'), gte(flashcardReviews.intervalDays, MATURE_INTERVAL_DAYS)))
      mastery = masteryPercent(rows.map((r) => r.interval), Number(total))
    }
    return { id: s.id, title: s.title, icon: s.icon, factCount: Number(total), mastery }
  }))

  const totalCards = deckData.reduce((sum, d) => sum + Number(d.cardCount), 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Flashcards</h1>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">{totalCards} cards · {deckData.length} decks · {drillData.length} drill sets</p>
      </div>

      <div className="mb-6"><TodayPlanCard /></div>

      {drillData.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[12px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">Drill sets · memorize</h2>
          {/* Right-edge fade signals there are more chips to scroll to */}
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_92%,transparent)]">
            {drillData.map((d) => <DrillSetChip key={d.id} {...d} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-[var(--apple-label-secondary)] mb-3">Concept decks · understand</h2>
        {deckData.length === 0 ? (
          <div className="bg-[var(--apple-fill)] rounded-[20px] p-10 text-center">
            <BookOpen className="w-12 h-12 text-[var(--apple-label-tertiary)] mx-auto mb-3" />
            <p className="text-[16px] font-semibold mb-1">No flashcards yet</p>
            <p className="text-[14px] text-[var(--apple-label-secondary)]">Decks appear here once content is seeded.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {deckData.map((d) => (
              <DeckRow key={d.domainId} domainId={d.domainId} domainName={d.domainName} examCode={d.examCode} cardCount={Number(d.cardCount)} mastery={masteryByDomain[d.domainId] ?? 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
