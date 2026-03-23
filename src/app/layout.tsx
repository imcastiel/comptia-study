import type { Metadata } from 'next'
import './globals.css'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'

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
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-[var(--apple-bg-primary)]">
        <TopNav />
        <div className="flex pt-14 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[260px] min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
