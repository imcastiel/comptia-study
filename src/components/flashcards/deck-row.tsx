import Link from 'next/link'
import { Layers, ChevronRight } from 'lucide-react'

interface DeckRowProps { domainId: string; domainName: string; examCode: string; cardCount: number; mastery: number }

export function DeckRow({ domainId, domainName, examCode, cardCount, mastery }: DeckRowProps) {
  return (
    <Link href={`/flashcards/session?domainId=${domainId}`} className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm">
      <div className="w-9 h-9 rounded-[10px] bg-[var(--apple-green)]/10 flex items-center justify-center shrink-0">
        <Layers className="w-4 h-4 text-[var(--apple-green)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground truncate">{domainName}</p>
        <p className="text-[12px] text-[var(--apple-label-secondary)]">{examCode} · {cardCount} cards · {mastery}% mastered</p>
        <div className="h-1 bg-[var(--apple-fill)] rounded-full mt-2 overflow-hidden">
          <div className="h-1 rounded-full bg-[var(--apple-green)]" style={{ width: `${mastery}%` }} />
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
    </Link>
  )
}
