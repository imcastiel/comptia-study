import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-[var(--apple-label-tertiary)]" />
            )}
            {isLast || !item.href ? (
              <span
                className={
                  isLast
                    ? 'text-foreground font-medium'
                    : 'text-[var(--apple-label-secondary)]'
                }
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[var(--apple-blue)] hover:underline underline-offset-2"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
