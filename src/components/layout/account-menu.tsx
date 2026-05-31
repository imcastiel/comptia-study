'use client'

import { useEffect, useRef, useState } from 'react'
import { KeyRound, Copy, Check, LogOut } from 'lucide-react'

function groupCode(code: string): string {
  return code.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function AccountMenu() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Load the logged-in account's own code the first time the menu opens.
  useEffect(() => {
    if (!open || code !== null) return
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d: { code: string | null }) => setCode(d.code))
      .catch(() => setCode(null))
  }, [open, code])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  async function copy() {
    if (!code) return
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* manual select */ }
  }

  async function logout() {
    setLoggingOut(true)
    try { await fetch('/api/auth', { method: 'DELETE' }) } catch { /* clear anyway */ }
    window.location.href = '/login'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] transition-colors duration-150"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <KeyRound className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-[280px] rounded-[16px] border border-[var(--apple-separator)] bg-card shadow-xl p-4 flex flex-col gap-3 z-50"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-label-tertiary)]">
            Your account number
          </p>

          <button
            onClick={copy}
            disabled={!code}
            className="group rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-fill)] px-3 py-3 text-center transition-colors hover:border-[var(--apple-blue)] disabled:opacity-60"
            aria-label="Copy account number"
          >
            <span className="block font-mono text-[16px] font-semibold tracking-[0.12em] text-foreground tabular-nums">
              {code ? groupCode(code) : '····  ····  ····  ····'}
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--apple-blue)]">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Tap to copy'}
            </span>
          </button>

          <p className="text-[11px] leading-relaxed text-[var(--apple-label-tertiary)]">
            This is your only way in — there’s no email reset. Save it in a password manager.
          </p>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 rounded-[12px] border border-[var(--apple-separator)] py-2.5 text-[13px] font-semibold text-[var(--apple-red)] hover:bg-[color-mix(in_oklab,var(--apple-red)_8%,transparent)] transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  )
}
