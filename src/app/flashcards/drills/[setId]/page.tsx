export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { drillSets, drillFacts } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { ArrowLeft, ArrowRight, Repeat, Grid3x3 } from 'lucide-react'

export default async function DrillSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const [set] = await db.select().from(drillSets).where(eq(drillSets.id, setId))
  if (!set || !set.published) notFound()
  const [{ total }] = await db.select({ total: count(drillFacts.id) }).from(drillFacts).where(eq(drillFacts.drillSetId, setId))

  const modes = [
    { href: `/flashcards/session?setId=${setId}`, icon: ArrowRight, title: 'Flip', desc: 'Term → value' },
    { href: `/flashcards/session?setId=${setId}&direction=reverse`, icon: Repeat, title: 'Reverse', desc: 'Value → term' },
    { href: `/flashcards/drills/${setId}/match`, icon: Grid3x3, title: 'Match', desc: 'Timed matching game' },
  ]

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <Link href="/flashcards" className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)] hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" />Back</Link>
      <div className="text-center mb-8">
        <div className="text-[40px]">{set.icon}</div>
        <h1 className="text-[26px] font-bold tracking-tight mt-2">{set.title}</h1>
        {set.description && <p className="text-[14px] text-[var(--apple-label-secondary)] mt-1">{set.description}</p>}
        <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-1">{Number(total)} facts</p>
      </div>
      <div className="flex flex-col gap-3">
        {modes.map((m) => (
          <Link key={m.title} href={m.href} className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--apple-blue)]/10 flex items-center justify-center shrink-0"><m.icon className="w-5 h-5 text-[var(--apple-blue)]" /></div>
            <div><p className="text-[15px] font-semibold">{m.title}</p><p className="text-[12px] text-[var(--apple-label-secondary)]">{m.desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
