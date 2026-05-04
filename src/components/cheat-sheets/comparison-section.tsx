import type { CheatSheetComparisonSection } from '@/data/cheat-sheets'

export function ComparisonSection({ section }: { section: CheatSheetComparisonSection }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-foreground mb-3 pb-2 border-b border-[var(--apple-separator)]">
        {section.title}
      </h2>
      <div className="overflow-x-auto rounded-[12px] border border-[var(--apple-separator)]">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[var(--apple-fill)]">
              <th className="text-left px-3 py-2 font-semibold text-[var(--apple-label-secondary)] w-[30%] border-b border-[var(--apple-separator)]">
                Feature
              </th>
              <th className="text-left px-3 py-2 font-semibold border-b border-[var(--apple-separator)] text-[var(--apple-blue)]">
                {section.leftLabel}
              </th>
              <th className="text-left px-3 py-2 font-semibold border-b border-[var(--apple-separator)] text-[var(--apple-orange)]">
                {section.rightLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--apple-separator)]/50 last:border-0 even:bg-[var(--apple-fill)]/40">
                <td className="px-3 py-2 font-semibold text-[var(--apple-label-secondary)] align-top">{row.attribute}</td>
                <td className="px-3 py-2 text-foreground align-top leading-snug">{row.left}</td>
                <td className="px-3 py-2 text-foreground align-top leading-snug">{row.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
