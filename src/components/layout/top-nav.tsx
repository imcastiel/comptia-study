'use client'

import Link from 'next/link'
import { Shield, Search, Sun, Moon, Menu, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandPalette } from '@/components/search/command-palette'
import { usePomodoroContext } from '@/contexts/pomodoro-context'
import { useSidebar } from '@/contexts/sidebar-context'

function ResetButton({ reset }: { reset: () => void }) {
  return (
    <button
      onClick={reset}
      className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-fill)] hover:text-foreground transition-colors"
      aria-label="Reset timer"
      title="Reset timer"
    >
      <RotateCcw className="w-3 h-3" />
    </button>
  )
}

function PomodoroTimerPill() {
  const { phase, secondsLeft, pomodoroActive, start, pause, reset, skipBreak } = usePomodoroContext()

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const time = `${mm}:${ss}`

  if (phase === 'idle') {
    return (
      <button
        onClick={start}
        className="flex items-center gap-[5px] bg-transparent border-none cursor-pointer px-2 py-1 rounded-[6px] hover:bg-[var(--apple-fill)] transition-colors"
        aria-label="Start pomodoro timer"
      >
        <span className="text-[11px] text-[var(--apple-label-tertiary)]">▶</span>
        <span className="text-[12px] text-[var(--apple-label-tertiary)] tracking-[0.5px]" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      </button>
    )
  }

  if (phase === 'work') {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={pomodoroActive ? pause : start}
          className="flex items-center gap-[5px] cursor-pointer px-[10px] py-1 rounded-[6px]"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}
          aria-label={pomodoroActive ? 'Pause pomodoro timer' : 'Resume pomodoro timer'}
        >
          {pomodoroActive
            ? <span className="w-[6px] h-[6px] bg-[#6366f1] rounded-full inline-block animate-pulse" />
            : <span className="text-[10px] text-[#6366f1]">⏸</span>
          }
          <span className="text-[12px] font-medium tracking-[0.5px] text-[#c7d2fe]" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </button>
        <ResetButton reset={reset} />
      </div>
    )
  }

  // Break phase
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={skipBreak}
        className="flex items-center gap-[5px] cursor-pointer px-[10px] py-1 rounded-[6px]"
        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}
        aria-label="Skip break"
      >
        <span className="text-[12px] font-medium tracking-[0.5px] text-[#6ee7b7]" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        <span className="text-[10px] text-[#6ee7b7]">break</span>
      </button>
      <ResetButton reset={reset} />
    </div>
  )
}

export function TopNav() {
  const [isDark, setIsDark] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { toggle } = useSidebar()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
  }, [])

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    const next = !html.classList.contains('dark')
    html.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 glass border-b border-[var(--apple-separator)]">
        <div className="flex h-full items-center px-4 gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={toggle}
            className="md:hidden w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

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
            <PomodoroTimerPill />
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
