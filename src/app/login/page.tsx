'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      const from = searchParams.get('from') ?? '/'
      window.location.href = from
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="on">
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        autoComplete="username"
        className="w-full px-4 py-3 rounded-[12px] bg-[var(--apple-fill)] border border-[var(--apple-separator)] text-[15px] outline-none focus:border-[var(--apple-blue)] transition-colors"
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        className="w-full px-4 py-3 rounded-[12px] bg-[var(--apple-fill)] border border-[var(--apple-separator)] text-[15px] outline-none focus:border-[var(--apple-blue)] transition-colors"
      />
      {error && (
        <p className="text-[13px] text-red-500 text-center">Incorrect password</p>
      )}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 rounded-[12px] bg-[var(--apple-blue)] text-white text-[15px] font-semibold disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Checking...' : 'Continue'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[18px] bg-[var(--apple-blue)]/10 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-[var(--apple-blue)]" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight">CompTIA Study</h1>
          <p className="text-[14px] text-[var(--apple-label-secondary)] mt-1">Enter your password to continue</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
