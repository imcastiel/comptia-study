import type { CheatSheetTermsSection } from '@/data/cheat-sheets'

export function TermsSection({ section }: { section: CheatSheetTermsSection }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-foreground mb-3 pb-2 border-b border-[var(--apple-separator)]">
        {section.title}
      </h2>
      <dl className="space-y-0">
        {section.items.map((item) => (
          <div
            key={item.term}
            className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 py-2.5 border-b border-[var(--apple-separator)]/50 last:border-0"
          >
            <dt className="text-[13px] font-semibold text-foreground leading-snug">{item.term}</dt>
            <dd className="text-[13px] text-[var(--apple-label-secondary)] leading-relaxed m-0">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
