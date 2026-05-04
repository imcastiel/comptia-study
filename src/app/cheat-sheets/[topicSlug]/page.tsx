import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import { getCheatSheet, CHEAT_SHEETS } from '@/data/cheat-sheets'
import { TermsSection } from '@/components/cheat-sheets/terms-section'
import { TableSection } from '@/components/cheat-sheets/table-section'
import { ProcessSection } from '@/components/cheat-sheets/process-section'
import { ComparisonSection } from '@/components/cheat-sheets/comparison-section'
import { PrintButton } from '@/components/cheat-sheets/print-button'
import '../print.css'

interface Params {
  topicSlug: string
}

export function generateStaticParams() {
  return CHEAT_SHEETS.map((s) => ({ topicSlug: s.topicSlug }))
}

export default async function CheatSheetPage({ params }: { params: Promise<Params> }) {
  const { topicSlug } = await params
  const sheet = getCheatSheet(topicSlug)
  if (!sheet) notFound()

  const examRoute = sheet.exam === 'core1' ? 'core1' : 'core2'

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--apple-label-secondary)] mb-6 flex-wrap animate-fade-in print:hidden">
        <Link href="/cheat-sheets" className="text-[var(--apple-blue)] hover:underline">
          Cheat Sheets
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{sheet.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-[11px] font-mono font-semibold px-2 py-1 rounded-[6px]"
                style={{ backgroundColor: `color-mix(in srgb, ${sheet.accentColor} 12%, transparent)`, color: sheet.accentColor }}
              >
                Objective {sheet.objectiveId}
              </span>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-[6px] bg-[var(--apple-fill)] text-[var(--apple-label-secondary)]">
                {sheet.examCode}
              </span>
              <span className="text-[11px] text-[var(--apple-label-secondary)]">{sheet.domainName}</span>
            </div>
            <h1 className="text-[26px] font-bold tracking-tight leading-tight">{sheet.title}</h1>
            <p className="text-[14px] text-[var(--apple-label-secondary)] mt-2 leading-relaxed">{sheet.summary}</p>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Accent divider */}
      <div className="h-[3px] rounded-full mb-8" style={{ backgroundColor: sheet.accentColor }} />

      {/* Sections */}
      <div className="space-y-2">
        {sheet.sections.map((section, i) => {
          switch (section.type) {
            case 'terms':
              return <TermsSection key={i} section={section} />
            case 'table':
              return <TableSection key={i} section={section} />
            case 'process':
              return <ProcessSection key={i} section={section} accentColor={sheet.accentColor} />
            case 'comparison':
              return <ComparisonSection key={i} section={section} />
          }
        })}
      </div>

      {/* Footer nav */}
      <div className="mt-10 pt-6 border-t border-[var(--apple-separator)] flex items-center justify-between flex-wrap gap-3 print:hidden">
        <Link href="/cheat-sheets" className="text-[13px] font-medium text-[var(--apple-blue)] hover:underline">
          ← All Cheat Sheets
        </Link>
        <Link
          href={`/study/${examRoute}/${sheet.domainSlug}/${sheet.topicSlug}`}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-label-secondary)] hover:text-foreground"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Study this topic →
        </Link>
      </div>
    </div>
  )
}
