'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, FolderOpen, Layers, Download, ArrowLeft, BookMarked, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/generate', icon: Sparkles, label: 'Generate' },
  { href: '/admin/content/questions', icon: FolderOpen, label: 'Questions' },
  { href: '/admin/content/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/admin/content/cheat_sheets', icon: BookMarked, label: 'Cheat sheets' },
  { href: '/admin/content/pbq_scenarios', icon: Terminal, label: 'PBQ Labs' },
  { href: '/admin/export', icon: Download, label: 'Export' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-[220px] shrink-0 border-r border-[var(--apple-separator)] bg-card p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-3 text-[15px] font-bold">🛡️ Admin</div>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors',
                active ? 'bg-[var(--apple-fill)] text-foreground' : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] hover:text-foreground',
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          )
        })}
        <Link href="/" className="mt-auto flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--apple-label-secondary)] hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to app
        </Link>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
