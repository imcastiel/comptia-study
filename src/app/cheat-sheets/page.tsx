'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FileText, ChevronRight, BookMarked } from 'lucide-react'
import { CHEAT_SHEETS, type CheatSheetExam, type CheatSheetDomain } from '@/data/cheat-sheets'
import { cn } from '@/lib/utils'

const EXAM_FILTERS: { id: CheatSheetExam | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'core1', label: 'Core 1 (220-1201)' },
  { id: 'core2', label: 'Core 2 (220-1202)' },
]

const DOMAIN_COLORS: Record<CheatSheetDomain, string> = {
  'mobile-devices': 'var(--apple-teal)',
  'networking': 'var(--apple-blue)',
  'hardware': 'var(--apple-indigo)',
  'virtualization-cloud': 'var(--apple-purple)',
  'hw-network-troubleshooting': 'var(--apple-orange)',
  'operating-systems': 'var(--apple-blue)',
  'security': 'var(--apple-red)',
  'software-troubleshooting': 'var(--apple-orange)',
  'operational-procedures': 'var(--apple-green)',
}

export default function CheatSheetsPage() {
  const [activeExam, setActiveExam] = useState<CheatSheetExam | 'all'>('all')
  const [activeDomain, setActiveDomain] = useState<CheatSheetDomain | 'all'>('all')

  const examFiltered = activeExam === 'all'
    ? CHEAT_SHEETS
    : CHEAT_SHEETS.filter((s) => s.exam === activeExam)

  const domains = [...new Set(examFiltered.map((s) => s.domainSlug))]

  const filtered = activeDomain === 'all'
    ? examFiltered
    : examFiltered.filter((s) => s.domainSlug === activeDomain)

  const handleExamChange = (exam: CheatSheetExam | 'all') => {
    setActiveExam(exam)
    setActiveDomain('all')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--apple-indigo)]/15 flex items-center justify-center">
            <BookMarked className="w-4 h-4 text-[var(--apple-indigo)]" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">Cheat Sheets</h1>
        </div>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">
          {CHEAT_SHEETS.length} quick-reference sheets — condensed facts, tables, and processes for exam day.
        </p>
      </div>

      {/* Exam filter tabs */}
      <div className="flex gap-1 bg-[var(--apple-fill)] rounded-[10px] p-0.5 mb-4 w-fit">
        {EXAM_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => handleExamChange(f.id as CheatSheetExam | 'all')}
            className={cn(
              'px-3 py-1.5 text-[12px] font-medium rounded-[8px] transition-all duration-200 whitespace-nowrap',
              activeExam === f.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-[var(--apple-label-secondary)] hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Domain filter pills */}
      {domains.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveDomain('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150',
              activeDomain === 'all'
                ? 'text-white shadow-sm bg-[var(--apple-indigo)]'
                : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground'
            )}
          >
            All Domains
          </button>
          {domains.map((slug) => {
            const sheet = CHEAT_SHEETS.find((s) => s.domainSlug === slug)!
            const color = DOMAIN_COLORS[slug]
            const isActive = activeDomain === slug
            return (
              <button
                key={slug}
                onClick={() => setActiveDomain(slug)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150',
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground'
                )}
                style={isActive ? { backgroundColor: color } : undefined}
              >
                {sheet.domainName}
              </button>
            )
          })}
        </div>
      )}

      {/* Sheet cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((sheet) => (
          <Link
            key={sheet.topicSlug}
            href={`/cheat-sheets/${sheet.topicSlug}`}
            className="group flex bg-card rounded-[16px] border border-[var(--apple-separator)] card-lift shadow-sm overflow-hidden"
          >
            {/* Accent strip */}
            <div className="w-1 shrink-0" style={{ backgroundColor: sheet.accentColor }} />

            <div className="flex flex-1 items-center gap-4 p-4 min-w-0">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${sheet.accentColor} 12%, transparent)` }}
              >
                <FileText style={{ color: sheet.accentColor, width: '18px', height: '18px' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px]"
                    style={{ backgroundColor: `color-mix(in srgb, ${sheet.accentColor} 12%, transparent)`, color: sheet.accentColor }}
                  >
                    {sheet.objectiveId}
                  </span>
                  <span className="text-[10px] text-[var(--apple-label-tertiary)] font-medium bg-[var(--apple-fill)] px-1.5 py-0.5 rounded-full">
                    {sheet.examCode}
                  </span>
                  <span className="text-[10px] text-[var(--apple-label-tertiary)]">{sheet.domainName}</span>
                </div>
                <p className="text-[14px] font-semibold text-foreground leading-snug">{sheet.title}</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)] mt-0.5 leading-relaxed line-clamp-2">{sheet.summary}</p>
              </div>

              <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[14px] text-[var(--apple-label-secondary)]">No cheat sheets in this category yet.</p>
        </div>
      )}
    </div>
  )
}
