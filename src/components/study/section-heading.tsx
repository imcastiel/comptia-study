import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  level: 2 | 3 | 4
}

export function SectionHeading({ children, level }: Props) {
  if (level === 2) {
    return (
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground mt-7 mb-3 pb-2 border-b border-[var(--apple-separator)] flex items-center gap-2.5">
        <span className="w-[3px] h-[18px] rounded-full bg-[var(--apple-blue)] shrink-0" />
        <span>{children}</span>
      </h2>
    )
  }

  if (level === 3) {
    return (
      <h3 className="text-[16px] font-semibold text-foreground mt-5 mb-2">
        {children}
      </h3>
    )
  }

  return (
    <h4 className="text-[14px] font-semibold text-foreground mt-4 mb-1.5">
      {children}
    </h4>
  )
}
