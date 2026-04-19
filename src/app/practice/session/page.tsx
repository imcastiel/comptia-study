'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ExamTimer } from '@/components/practice/exam-timer'
import { Flag, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Choice {
  id: string
  text: string
}

interface Question {
  id: string
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'ordered_list' | 'drag_drop'
  stem: string
  choices: Choice[]
  objectiveId: string
  topicTitle: string
}

interface SessionState {
  questions: Question[]
  answers: Record<string, string | string[]>
  flagged: Set<string>
  timeSpent: Record<string, number>
  currentIndex: number
  submitted: boolean
  startTime: number
}

const MODE_CONFIG = {
  simulation: { count: 90, timeMinutes: 90, label: 'Exam Simulation' },
  quick: { count: 20, timeMinutes: 20, label: 'Quick Drill' },
  study: { count: 20, timeMinutes: 0, label: 'Study Mode' },
}

function ExamSessionInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') ?? 'quick') as keyof typeof MODE_CONFIG
  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.quick

  const [session, setSession] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)
  const questionStartRef = useRef<number>(Date.now())

  useEffect(() => {
    fetch(`/api/practice/questions?count=${config.count}`)
      .then((r) => r.json())
      .then((data) => {
        setSession({
          questions: data.questions ?? [],
          answers: {},
          flagged: new Set(),
          timeSpent: {},
          currentIndex: 0,
          submitted: false,
          startTime: Date.now(),
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [config.count])

  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    setSession((s) => s ? { ...s, answers: { ...s.answers, [questionId]: value } } : s)
  }, [])

  const handleFlag = useCallback((questionId: string) => {
    setSession((s) => {
      if (!s) return s
      const flagged = new Set(s.flagged)
      flagged.has(questionId) ? flagged.delete(questionId) : flagged.add(questionId)
      return { ...s, flagged }
    })
  }, [])

  const handleNavigate = useCallback((index: number) => {
    setSession((s) => {
      if (!s) return s
      const current = s.questions[s.currentIndex]
      const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000)
      questionStartRef.current = Date.now()
      return {
        ...s,
        currentIndex: index,
        timeSpent: { ...s.timeSpent, [current.id]: (s.timeSpent[current.id] ?? 0) + elapsed },
      }
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!session) return
    const res = await fetch('/api/practice/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions: session.questions,
        answers: session.answers,
        timeSpent: session.timeSpent,
        mode,
        totalTimeSeconds: Math.round((Date.now() - session.startTime) / 1000),
      }),
    })
    const { attemptId } = await res.json()
    router.push(`/practice/review/${attemptId}`)
  }, [session, mode, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-[18px] font-semibold mb-2">No questions available yet</p>
        <p className="text-[var(--apple-label-secondary)] mb-6 text-[14px]">
          Add questions to the question bank to start practicing.
        </p>
        <Link href="/practice" className="text-[var(--apple-blue)] font-medium">← Back</Link>
      </div>
    )
  }

  const q = session.questions[session.currentIndex]
  const answered = Object.keys(session.answers).length
  const isFlagged = session.flagged.has(q.id)
  const currentAnswer = session.answers[q.id]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] font-semibold text-[var(--apple-label-secondary)]">{config.label}</p>
          <p className="text-[12px] text-[var(--apple-label-tertiary)]">
            {answered}/{session.questions.length} answered
          </p>
        </div>

        {config.timeMinutes > 0 && (
          <ExamTimer
            totalSeconds={config.timeMinutes * 60}
            onTimeUp={handleSubmit}
          />
        )}

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-[var(--apple-blue)] text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          <Send className="w-3.5 h-3.5" />
          Submit
        </button>
      </div>

      {/* Question */}
      <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] px-2 py-1 rounded-[6px]">
              Q{session.currentIndex + 1}
            </span>
            <span className="text-[11px] text-[var(--apple-label-tertiary)]">
              Objective {q.objectiveId}
            </span>
          </div>
          <button
            onClick={() => handleFlag(q.id)}
            className={cn(
              'flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors',
              isFlagged
                ? 'bg-[var(--apple-orange)]/15 text-[var(--apple-orange)]'
                : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground'
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            {isFlagged ? 'Flagged' : 'Flag'}
          </button>
        </div>

        <p className="text-[16px] leading-relaxed text-foreground font-medium mb-6">{q.stem}</p>

        {/* Choices */}
        {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
          <div className="flex flex-col gap-2">
            {q.choices.map((choice) => {
              const isSelected = q.type === 'multiple_choice'
                ? Array.isArray(currentAnswer) && currentAnswer.includes(choice.id)
                : currentAnswer === choice.id

              return (
                <button
                  key={choice.id}
                  onClick={() => {
                    if (q.type === 'multiple_choice') {
                      const prev = Array.isArray(currentAnswer) ? currentAnswer : []
                      const next = prev.includes(choice.id)
                        ? prev.filter((id) => id !== choice.id)
                        : [...prev, choice.id]
                      handleAnswer(q.id, next)
                    } else {
                      handleAnswer(q.id, choice.id)
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-[12px] border text-left transition-all duration-150',
                    isSelected
                      ? 'bg-[var(--apple-blue)]/10 border-[var(--apple-blue)]/40 text-foreground'
                      : 'bg-[var(--apple-fill)] border-transparent hover:border-[var(--apple-separator)] text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 shrink-0 flex items-center justify-center text-[11px] font-bold',
                      q.type === 'multiple_choice' ? 'rounded-[4px]' : 'rounded-full',
                      isSelected
                        ? 'bg-[var(--apple-blue)] text-white'
                        : 'border border-[var(--apple-label-tertiary)] text-[var(--apple-label-tertiary)]'
                    )}
                  >
                    {isSelected ? '✓' : String.fromCharCode(65 + q.choices.indexOf(choice))}
                  </span>
                  <span className="text-[14px] leading-snug">{choice.text}</span>
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'fill_blank' && (
          <div>
            <p className="text-[12px] text-[var(--apple-label-secondary)] mb-2">Type your answer:</p>
            <input
              type="text"
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Enter answer..."
              className="w-full bg-[var(--apple-fill)] border border-[var(--apple-separator)] rounded-[10px] px-4 py-3 text-[15px] font-mono outline-none focus:border-[var(--apple-blue)] transition-colors"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => session.currentIndex > 0 && handleNavigate(session.currentIndex - 1)}
          disabled={session.currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[var(--apple-fill)] text-foreground disabled:opacity-40 hover:bg-[var(--apple-bg-tertiary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question grid */}
        <div className="flex items-center gap-1 flex-wrap justify-center max-w-xs">
          {session.questions.slice(0, 20).map((q2, i) => (
            <button
              key={q2.id}
              onClick={() => handleNavigate(i)}
              className={cn(
                'w-7 h-7 text-[11px] font-medium rounded-[6px] transition-colors',
                i === session.currentIndex
                  ? 'bg-[var(--apple-blue)] text-white'
                  : session.answers[q2.id]
                  ? session.flagged.has(q2.id)
                    ? 'bg-[var(--apple-orange)]/20 text-[var(--apple-orange)]'
                    : 'bg-[var(--apple-green)]/15 text-[var(--apple-green)]'
                  : session.flagged.has(q2.id)
                  ? 'bg-[var(--apple-orange)]/10 text-[var(--apple-orange)]'
                  : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)]'
              )}
            >
              {i + 1}
            </button>
          ))}
          {session.questions.length > 20 && (
            <span className="text-[11px] text-[var(--apple-label-tertiary)]">
              +{session.questions.length - 20}
            </span>
          )}
        </div>

        <button
          onClick={() => session.currentIndex < session.questions.length - 1 && handleNavigate(session.currentIndex + 1)}
          disabled={session.currentIndex === session.questions.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[var(--apple-fill)] text-foreground disabled:opacity-40 hover:bg-[var(--apple-bg-tertiary)] transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" /></div>}>
      <ExamSessionInner />
    </Suspense>
  )
}
