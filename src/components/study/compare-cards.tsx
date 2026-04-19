import type { ComponentType } from 'react'
import {
  Wifi, Zap, HardDrive, Database, Cpu, Server, Globe, Lock, Shield,
  Monitor, Package, Layers, Cloud, Plug, Activity, Network, Boxes,
  ArrowRight, MemoryStick, Router, Cable, Printer, Laptop,
} from 'lucide-react'

type ColorKey = 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'teal' | 'indigo'

const COLORS: Record<ColorKey, { from: string; to: string; bg: string; border: string; dot: string }> = {
  blue:   { from: '#007AFF', to: '#0055D4', bg: 'rgba(0,122,255,0.07)',   border: 'rgba(0,122,255,0.18)',   dot: '#007AFF' },
  orange: { from: '#FF9F0A', to: '#E07000', bg: 'rgba(255,159,10,0.07)',  border: 'rgba(255,159,10,0.18)',  dot: '#FF9F0A' },
  green:  { from: '#34C759', to: '#1E8B40', bg: 'rgba(52,199,89,0.07)',   border: 'rgba(52,199,89,0.18)',   dot: '#34C759' },
  red:    { from: '#FF3B30', to: '#C01020', bg: 'rgba(255,59,48,0.07)',   border: 'rgba(255,59,48,0.18)',   dot: '#FF3B30' },
  purple: { from: '#AF52DE', to: '#7B2B9E', bg: 'rgba(175,82,222,0.07)', border: 'rgba(175,82,222,0.18)', dot: '#AF52DE' },
  teal:   { from: '#5AC8FA', to: '#178EBB', bg: 'rgba(90,200,250,0.07)', border: 'rgba(90,200,250,0.18)', dot: '#5AC8FA' },
  indigo: { from: '#5856D6', to: '#3634A3', bg: 'rgba(88,86,214,0.07)',  border: 'rgba(88,86,214,0.18)',  dot: '#5856D6' },
}

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Wifi, Zap, HardDrive, Database, Cpu, Server, Globe, Lock, Shield,
  Monitor, Package, Layers, Cloud, Plug, Activity, Network, Boxes,
  ArrowRight, MemoryStick, Router, Cable, Printer, Laptop,
}

interface Side {
  title: string
  icon?: string
  color?: ColorKey
  points: string[]
}

interface CompareCardsProps {
  left: Side
  right: Side
  title?: string
}

export function CompareCards({ left, right, title }: CompareCardsProps) {
  if (!left || !right) return null
  const sides = [
    { ...left,  color: (left.color  ?? 'blue')   as ColorKey },
    { ...right, color: (right.color ?? 'orange') as ColorKey },
  ]

  return (
    <div className="my-8">
      {title && (
        <p className="text-center text-[11px] font-bold text-[var(--apple-label-tertiary)] uppercase tracking-[0.12em] mb-4">
          {title}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
        {/* VS badge */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-[var(--apple-bg-primary)] border border-[var(--apple-separator)] rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-bold text-[var(--apple-label-secondary)]">VS</span>
          </div>
        </div>

        {sides.map((side, idx) => {
          const c = COLORS[side.color]
          const IconEl = side.icon ? ICONS[side.icon] : null

          return (
            <div
              key={idx}
              className="rounded-[18px] border overflow-hidden"
              style={{ borderColor: c.border, background: c.bg }}
            >
              {/* Gradient header */}
              <div
                className="px-4 py-3.5 flex items-center gap-2.5"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              >
                {IconEl && (
                  <div className="bg-white/20 rounded-[8px] p-1.5 shrink-0">
                    <IconEl size={16} className="text-white" />
                  </div>
                )}
                <span className="text-white font-bold text-[15px] tracking-tight">{side.title}</span>
              </div>

              {/* Points list */}
              <ul className="px-4 py-3.5 space-y-2">
                {(side.points ?? []).map((point, pi) => (
                  <li key={pi} className="flex items-start gap-2 text-[13px] leading-snug text-foreground">
                    <span
                      className="w-[5px] h-[5px] rounded-full mt-[5px] shrink-0"
                      style={{ background: c.dot }}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
