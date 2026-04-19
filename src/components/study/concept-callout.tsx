'use client'

import { Lightbulb, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalloutType = 'why' | 'warning' | 'info' | 'tip'

const CALLOUT_CONFIG: Record<CalloutType, {
  icon: React.ElementType
  label: string
  bgColor: string
  borderColor: string
  iconColor: string
  iconBg: string
  glow: string
}> = {
  why: {
    icon: Lightbulb,
    label: 'Why This Matters',
    bgColor: 'bg-[var(--apple-orange)]/6',
    borderColor: 'border-[var(--apple-orange)]/20',
    iconColor: 'text-[var(--apple-orange)]',
    iconBg: 'bg-[var(--apple-orange)]/12',
    glow: 'rgba(255,159,10,0.25)',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Watch Out',
    bgColor: 'bg-[var(--apple-red)]/6',
    borderColor: 'border-[var(--apple-red)]/20',
    iconColor: 'text-[var(--apple-red)]',
    iconBg: 'bg-[var(--apple-red)]/12',
    glow: 'rgba(255,59,48,0.25)',
  },
  info: {
    icon: Info,
    label: 'Key Concept',
    bgColor: 'bg-[var(--apple-blue)]/6',
    borderColor: 'border-[var(--apple-blue)]/20',
    iconColor: 'text-[var(--apple-blue)]',
    iconBg: 'bg-[var(--apple-blue)]/12',
    glow: 'rgba(0,122,255,0.25)',
  },
  tip: {
    icon: CheckCircle2,
    label: 'Exam Tip',
    bgColor: 'bg-[var(--apple-green)]/6',
    borderColor: 'border-[var(--apple-green)]/20',
    iconColor: 'text-[var(--apple-green)]',
    iconBg: 'bg-[var(--apple-green)]/12',
    glow: 'rgba(52,199,89,0.25)',
  },
}

interface ConceptCalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

export function ConceptCallout({ type = 'why', title, children }: ConceptCalloutProps) {
  const config = CALLOUT_CONFIG[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex gap-3 rounded-[16px] border p-4 my-5 relative overflow-hidden',
        config.bgColor,
        config.borderColor,
      )}
    >
      {/* Subtle background glow blob */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-60 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${config.glow}, transparent)` }}
      />

      {/* Icon */}
      <div className={cn('shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center mt-0.5 relative', config.iconBg)}>
        <Icon className={cn('w-4 h-4', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 relative">
        <p className={cn('text-[11px] font-bold mb-1.5 uppercase tracking-[0.1em]', config.iconColor)}>
          {title ?? config.label}
        </p>
        <div className="text-[14px] text-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}
