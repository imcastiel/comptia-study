import type { CheatSheetProcessSection } from '@/data/cheat-sheets'

export function ProcessSection({ section, accentColor }: { section: CheatSheetProcessSection; accentColor: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-foreground mb-3 pb-2 border-b border-[var(--apple-separator)]">
        {section.title}
      </h2>
      <ol className="space-y-3">
        {section.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-snug">{step.label}</p>
              {step.detail && (
                <p className="text-[12px] text-[var(--apple-label-secondary)] mt-0.5 leading-relaxed">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
