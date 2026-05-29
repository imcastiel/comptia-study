import type { Metadata } from 'next'
import './globals.css'
import { LayoutShell } from '@/components/layout/layout-shell'

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
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
