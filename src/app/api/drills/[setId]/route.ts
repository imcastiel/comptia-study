import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { drillSets, drillFacts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params
  const direction = req.nextUrl.searchParams.get('direction') === 'reverse' ? 'reverse' : 'forward'

  const [set] = await db.select().from(drillSets).where(eq(drillSets.id, setId))
  if (!set || !set.published) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const facts = await db.select().from(drillFacts).where(eq(drillFacts.drillSetId, setId)).orderBy(drillFacts.orderIndex)

  const cards = facts.map((f) => ({
    id: f.id,
    front: direction === 'reverse' ? f.value : f.term,
    back: direction === 'reverse' ? f.term : f.value,
    hint: f.hint,
    term: f.term,
    value: f.value,
    aliases: f.aliases,
  }))

  return NextResponse.json({ set: { id: set.id, title: set.title, icon: set.icon, description: set.description }, direction, cards })
}
