'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { AiTutor } from '@/components/ai/ai-tutor'
import { PomodoroProvider } from '@/contexts/pomodoro-context'
import { SidebarProvider } from '@/contexts/sidebar-context'

// Routes that render full-screen without the authenticated app chrome.
const BARE_ROUTES = ['/login', '/admin']

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (BARE_ROUTES.some((r) => pathname?.startsWith(r))) {
    return <>{children}</>
  }

  return (
    <PomodoroProvider>
      <SidebarProvider>
        <TopNav />
        <div className="flex pt-14 min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-[260px] min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
            {children}
          </main>
        </div>
        <AiTutor />
      </SidebarProvider>
    </PomodoroProvider>
  )
}
