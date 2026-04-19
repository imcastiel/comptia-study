import Link from 'next/link'
import { Clock, Layers, Trophy, Zap } from 'lucide-react'

const EXAM_MODES = [
  {
    id: 'simulation',
    title: 'Exam Simulation',
    description: '90 questions · 90 minutes · Exact exam conditions',
    icon: Trophy,
    color: 'var(--apple-orange)',
    href: '/practice/session?mode=simulation',
  },
  {
    id: 'quick',
    title: 'Quick Drill',
    description: '20 questions · 20 minutes · Focused practice',
    icon: Zap,
    color: 'var(--apple-blue)',
    href: '/practice/session?mode=quick',
  },
  {
    id: 'study',
    title: 'Study Mode',
    description: 'Untimed · Instant feedback after each answer',
    icon: Layers,
    color: 'var(--apple-green)',
    href: '/practice/session?mode=study',
  },
]

export default function PracticePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Practice Tests</h1>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">
          Realistic exam questions with timed pressure — just like the real thing.
        </p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col gap-3 mb-8">
        {EXAM_MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <Link
              key={mode.id}
              href={mode.href}
              className="flex items-center gap-4 bg-card rounded-[16px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm"
            >
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${mode.color}18` }}
              >
                <Icon className="w-5 h-5" style={{ color: mode.color }} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{mode.title}</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)]">{mode.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Exam info */}
      <div className="bg-[var(--apple-fill)] rounded-[16px] p-4">
        <p className="text-[12px] font-semibold text-[var(--apple-label-secondary)] mb-3 uppercase tracking-wide">Exam Details</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Core 1 (220-1201)', value: 'Pass: 675/900', icon: '🎯' },
            { label: 'Core 2 (220-1202)', value: 'Pass: 700/900', icon: '🎯' },
            { label: 'Question Types', value: 'MCQ + PBQs', icon: '📝' },
            { label: 'Time per Question', value: '~1 minute', icon: '⏱️' },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]">
              <p className="text-[18px] mb-0.5">{item.icon}</p>
              <p className="text-[13px] font-semibold text-foreground">{item.value}</p>
              <p className="text-[11px] text-[var(--apple-label-secondary)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PBQ info */}
      <div className="mt-4 bg-[var(--apple-blue)]/5 border border-[var(--apple-blue)]/20 rounded-[14px] p-4">
        <p className="text-[12px] font-semibold text-[var(--apple-blue)] mb-1">Performance-Based Questions (PBQs)</p>
        <p className="text-[13px] text-[var(--apple-label-secondary)]">
          PBQs appear first in the real exam. This simulator includes drag-and-drop, hot spot, ordering, fill-in-the-blank, and simulated interface questions.
        </p>
      </div>
    </div>
  )
}
