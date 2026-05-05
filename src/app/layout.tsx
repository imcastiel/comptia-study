import type { Metadata } from 'next'
import './globals.css'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { AiTutor } from '@/components/ai/ai-tutor'
import { PomodoroProvider } from '@/contexts/pomodoro-context'
import { SidebarProvider } from '@/contexts/sidebar-context'

export const metadata: Metadata = {
  title: 'CompTIA A+ Study',
  description: 'Study platform for CompTIA A+ 220-1201 (Core 1) and 220-1202 (Core 2) certification exams.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')})()` }} />
      </head>
      <body className="h-full bg-[var(--apple-bg-primary)]">
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
      </body>
    </html>
  )
}
