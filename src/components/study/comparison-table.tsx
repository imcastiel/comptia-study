interface ComparisonTableProps {
  headers: string[]
  rows: string[][]
  caption?: string
}

export function ComparisonTable({ headers, rows, caption }: ComparisonTableProps) {
  return (
    <div className="my-5 overflow-x-auto rounded-[14px] border border-[var(--apple-separator)]">
      <table className="w-full text-[14px] border-collapse">
        {caption && (
          <caption className="text-[12px] text-[var(--apple-label-secondary)] mb-2 text-left px-4 pt-3">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="bg-[var(--apple-fill)] border-b border-[var(--apple-separator)]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-[var(--apple-separator)] last:border-0 hover:bg-[var(--apple-fill)] transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-3 ${ci === 0 ? 'font-medium text-foreground' : 'text-[var(--apple-label-secondary)]'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
