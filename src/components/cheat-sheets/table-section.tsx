import type { CheatSheetTableSection } from '@/data/cheat-sheets'

export function TableSection({ section }: { section: CheatSheetTableSection }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-foreground mb-3 pb-2 border-b border-[var(--apple-separator)]">
        {section.title}
      </h2>
      <div className="overflow-x-auto rounded-[12px] border border-[var(--apple-separator)]">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[var(--apple-fill)]">
              {section.columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2 font-semibold text-[var(--apple-label-secondary)] whitespace-nowrap border-b border-[var(--apple-separator)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-[var(--apple-separator)]/50 last:border-0 even:bg-[var(--apple-fill)]/40"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 text-foreground leading-snug align-top ${ci === 0 ? 'font-semibold whitespace-nowrap' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section.caption && (
        <p className="text-[11px] text-[var(--apple-label-tertiary)] mt-2 px-1">{section.caption}</p>
      )}
    </div>
  )
}
