'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, Check, ShieldCheck, KeyRound, ArrowRight, ArrowLeft, Loader2, Lock } from 'lucide-react'

function formatCode(raw: string): string {
  return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function LoginContent() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'

  const [view, setView] = useState<'choice' | 'generated' | 'enter'>('choice')
  const [generatedCode, setGeneratedCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/generate', { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string }
      if (!res.ok || !data.code) {
        setError(data.error ?? 'Could not create an account. Please try again.')
        return
      }
      setGeneratedCode(data.code)
      setView('generated')
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: enteredCode }),
      })
      if (res.ok) {
        window.location.href = from
      } else {
        setError('That number isn’t recognized. Check the digits and try again.')
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — user can select manually */
    }
  }

  // ── Generated: show the new account number ────────────────────────────────
  if (view === 'generated') {
    return (
      <div className="flex flex-col gap-5 animate-fade-up">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--apple-label-tertiary)]">
            Your account number
          </span>
        </div>

        <button
          onClick={copyCode}
          className="group relative w-full rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-fill)] px-5 py-5 text-center transition-all hover:border-[var(--apple-blue)] active:scale-[0.99]"
          aria-label="Copy account number"
        >
          <span className="block text-[clamp(1.25rem,6vw,1.6rem)] font-mono font-semibold tracking-[0.18em] text-foreground tabular-nums">
            {formatCode(generatedCode)}
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--apple-blue)]">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied to clipboard' : 'Tap to copy'}
          </span>
        </button>

        <div className="flex gap-3 rounded-[14px] border border-[var(--apple-separator)] bg-[color-mix(in_oklab,var(--apple-blue)_7%,transparent)] px-4 py-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--apple-blue)]" />
          <p className="text-[13px] leading-relaxed text-[var(--apple-label-secondary)]">
            This number <strong className="font-semibold text-foreground">is</strong> your account. Save it in a
            password manager. There’s no email reset — by design, we store nothing that could identify you.
          </p>
        </div>

        <button
          onClick={() => { window.location.href = from }}
          className="group flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--apple-blue)] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.99]"
        >
          I’ve saved it — continue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={() => setView('choice')}
          className="mx-auto text-[13px] text-[var(--apple-label-secondary)] transition-colors hover:text-foreground"
        >
          Back
        </button>
      </div>
    )
  }

  // ── Enter: log in with an existing number ─────────────────────────────────
  if (view === 'enter') {
    return (
      <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-fade-up">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--apple-label-tertiary)]">
            Account number
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatCode(enteredCode)}
            onChange={(e) => {
              setError('')
              setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 16))
            }}
            placeholder="1234 5678 9012 3456"
            className="w-full rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-fill)] px-4 py-3.5 text-center font-mono text-[18px] tracking-[0.16em] text-foreground outline-none transition-colors placeholder:text-[var(--apple-label-tertiary)] focus:border-[var(--apple-blue)] focus:bg-card"
            autoFocus
          />
        </label>

        {error && (
          <p className="text-center text-[13px] font-medium text-[var(--apple-red)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || enteredCode.length !== 16}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--apple-blue)] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Checking…' : 'Log in'}
        </button>

        <button
          type="button"
          onClick={() => { setView('choice'); setError('') }}
          className="mx-auto inline-flex items-center gap-1 text-[13px] text-[var(--apple-label-secondary)] transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </form>
    )
  }

  // ── Choice: create or enter ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 animate-fade-up">
      {error && (
        <p className="mb-1 text-center text-[13px] font-medium text-[var(--apple-red)]">{error}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--apple-blue)] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {loading ? 'Creating…' : 'Create account number'}
      </button>

      <button
        onClick={() => { setView('enter'); setError('') }}
        className="w-full rounded-[14px] border border-[var(--apple-separator)] bg-card py-3.5 text-[15px] font-medium text-foreground transition-colors hover:border-[var(--apple-blue)]"
      >
        I already have a number
      </button>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-[var(--apple-label-tertiary)]">
        <Lock className="h-3 w-3" />
        Private by design — no email, no tracking.
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--apple-blue) 16%, transparent), transparent 70%), radial-gradient(40% 40% at 85% 90%, color-mix(in oklab, var(--apple-indigo) 12%, transparent), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Brand mark */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] text-white shadow-lg"
            style={{ background: 'linear-gradient(140deg, var(--apple-blue), var(--apple-indigo))' }}
          >
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-foreground">CompTIA A+ Study</h1>
          <p className="mt-1.5 max-w-[300px] text-[14px] leading-relaxed text-[var(--apple-label-secondary)]">
            No email. No password. Just a number that’s yours alone.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[24px] border border-[var(--apple-separator)] bg-card/80 p-6 shadow-xl backdrop-blur-xl">
          <Suspense>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
