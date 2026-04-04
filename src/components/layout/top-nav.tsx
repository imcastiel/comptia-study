'use client'

import Link from 'next/link'
import { Shield, Search, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [isDark, setIsDark] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(document.documentElement.classList.contains('dark') || mq.matches)
  }, [])

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    const next = !html.classList.contains('dark')
    html.classList.toggle('dark', next)
    setIsDark(next)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-[var(--apple-separator)]">
        <div className="flex h-full items-center px-4 gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--apple-blue)] font-semibold text-[15px] tracking-tight shrink-0"
          >
            <div className="w-7 h-7 rounded-[8px] bg-[var(--apple-blue)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-foreground">CompTIA A+</span>
          </Link>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
