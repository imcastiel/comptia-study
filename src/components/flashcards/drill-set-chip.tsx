import Link from 'next/link'

interface DrillSetChipProps { id: string; title: string; icon: string; factCount: number; mastery: number }

export function DrillSetChip({ id, title, icon, factCount, mastery }: DrillSetChipProps) {
  return (
    <Link href={`/flashcards/drills/${id}`} className="block min-w-[120px] bg-card rounded-[14px] p-3 border border-[var(--apple-separator)] card-lift shadow-sm">
      <div className="text-[22px]">{icon}</div>
      <p className="text-[13px] font-semibold mt-2 truncate">{title}</p>
      <p className="text-[11px] text-[var(--apple-label-secondary)]">{factCount} facts</p>
      <div className="h-1 bg-[var(--apple-fill)] rounded-full mt-2 overflow-hidden">
        <div className="h-1 rounded-full bg-[var(--apple-blue)]" style={{ width: `${mastery}%` }} />
      </div>
    </Link>
  )
}
