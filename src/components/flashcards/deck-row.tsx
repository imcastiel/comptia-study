import Link from 'next/link'
import {
  Smartphone, MonitorCog, Network, ShieldCheck, Cpu, Wrench,
  Cloud, ClipboardList, Activity, Layers, ChevronRight,
} from 'lucide-react'

interface DeckRowProps { domainId: string; domainName: string; examCode: string; cardCount: number; mastery: number }

type IconType = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

const FALLBACK_COLORS = ['--apple-blue', '--apple-green', '--apple-indigo', '--apple-orange', '--apple-purple', '--apple-teal', '--apple-red']

// Map each CompTIA domain to a recognizable icon + accent so the list reads as
// a set of distinct subjects rather than identical green rows.
function deckVisual(name: string): { Icon: IconType; color: string } {
  const n = name.toLowerCase()
  if (n.includes('mobile')) return { Icon: Smartphone, color: '--apple-blue' }
  if (n.includes('operating system')) return { Icon: MonitorCog, color: '--apple-purple' }
  if (n.includes('security')) return { Icon: ShieldCheck, color: '--apple-green' }
  if (n.includes('virtual') || n.includes('cloud')) return { Icon: Cloud, color: '--apple-indigo' }
  if (n.includes('operational') || n.includes('procedure')) return { Icon: ClipboardList, color: '--apple-blue' }
  if (n.includes('troublesho')) return { Icon: n.includes('network') ? Activity : Wrench, color: '--apple-red' }
  if (n.includes('network')) return { Icon: Network, color: '--apple-teal' }
  if (n.includes('hardware')) return { Icon: Cpu, color: '--apple-orange' }
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % FALLBACK_COLORS.length
  return { Icon: Layers, color: FALLBACK_COLORS[h] }
}

export function DeckRow({ domainId, domainName, examCode, cardCount, mastery }: DeckRowProps) {
  const { Icon, color } = deckVisual(domainName)
  return (
    <Link href={`/flashcards/session?domainId=${domainId}`} className="flex items-center gap-4 bg-card rounded-[14px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, var(${color}) 14%, transparent)` }}
      >
        <Icon className="w-4 h-4" style={{ color: `var(${color})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground truncate">{domainName}</p>
        <p className="text-[12px] text-[var(--apple-label-secondary)]">
          {examCode} · {cardCount} cards{mastery > 0 ? ` · ${mastery}% mastered` : ''}
        </p>
        {mastery > 0 && (
          <div className="h-1 bg-[var(--apple-fill)] rounded-full mt-2 overflow-hidden">
            <div className="h-1 rounded-full" style={{ width: `${mastery}%`, backgroundColor: `var(${color})` }} />
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
    </Link>
  )
}
