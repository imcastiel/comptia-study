'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Copy, Check, RefreshCw } from 'lucide-react'

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
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to generate account')
        return
      }
      const data = await res.json() as { code: string }
      setGeneratedCode(data.code)
      setView('generated')
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
        setError('Account not found — check your code and try again')
      }
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (view === 'generated') {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-[13px] text-[var(--apple-label-secondary)] mb-3">Your account number</p>
          <div className="bg-[var(--apple-fill)] border border-[var(--apple-separator)] rounded-[12px] px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-[22px] font-mono font-semibold tracking-widest text-[var(--foreground)]">
              {formatCode(generatedCode)}
            </span>
            <button
              onClick={copyCode}
              className="text-[var(--apple-blue)] hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Copy account number"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-[12px] px-4 py-3">
          <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Save this number.</strong> It is the only way to access your account — there is no email or password recovery.
          </p>
        </div>

        <button
          onClick={() => { window.location.href = from }}
          className="w-full py-3 rounded-[12px] bg-[var(--apple-blue)] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
        >
          I&apos;ve saved it — Continue
        </button>

        <button
          onClick={() => setView('choice')}
          className="text-[13px] text-[var(--apple-label-secondary)] hover:text-[var(--foreground)] transition-colors text-center"
        >
          Back
        </button>
      </div>
    )
  }

  if (view === 'enter') {
    return (
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={enteredCode}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
            setEnteredCode(digits)
          }}
          placeholder="1234 5678 9012 3456"
          className="w-full px-4 py-3 rounded-[12px] bg-[var(--apple-fill)] border border-[var(--apple-separator)] text-[18px] font-mono tracking-widest outline-none focus:border-[var(--apple-blue)] transition-colors text-center"
          autoFocus
        />
        {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || enteredCode.length !== 16}
          className="w-full py-3 rounded-[12px] bg-[var(--apple-blue)] text-white text-[15px] font-semibold disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Checking…' : 'Log in'}
        </button>
        <button
          type="button"
          onClick={() => { setView('choice'); setError('') }}
          className="text-[13px] text-[var(--apple-label-secondary)] hover:text-[var(--foreground)] transition-colors text-center"
        >
          Back
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-[13px] text-red-500 text-center mb-1">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-[12px] bg-[var(--apple-blue)] text-white text-[15px] font-semibold disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
        {loading ? 'Generating…' : 'Generate account number'}
      </button>
      <button
        onClick={() => { setView('enter'); setError('') }}
        className="w-full py-3 rounded-[12px] bg-[var(--apple-fill)] border border-[var(--apple-separator)] text-[15px] font-medium hover:border-[var(--apple-blue)] transition-colors"
      >
        I already have an account number
      </button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[18px] bg-[var(--apple-blue)]/10 flex items-center justify-center mb-4 text-2xl">
            🔑
          </div>
          <h1 className="text-[22px] font-bold tracking-tight">CompTIA Study</h1>
          <p className="text-[14px] text-[var(--apple-label-secondary)] mt-1">No email. No password. Just your number.</p>
        </div>
        <Suspense>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  )
}
