'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground transition-colors"
    >
      <Printer className="w-3.5 h-3.5" />
      Print / Save PDF
    </button>
  )
}
