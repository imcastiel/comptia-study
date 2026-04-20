'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Zap, Trophy, ChevronRight, Brain, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveTopicScore } from '@/components/home/weak-spots'

interface Choice {
  id: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  stem: string
  choices: Choice[]
  explanation: string
  difficulty: 1 | 2 | 3
}

type AnswerState = 'unanswered' | 'correct' | 'wrong'

const XP_PER_DIFFICULTY: Record<number, number> = { 1: 50, 2: 100, 3: 150 }
const XP_COMPLETION_BONUS = 100
const XP_PERFECT_BONUS = 100
const XP_KEY = 'comptia-total-xp'

function getStoredXP(): number {
  try { return parseInt(localStorage.getItem(XP_KEY) ?? '0', 10) || 0 } catch { return 0 }
}
function addStoredXP(amount: number): number {
  const next = getStoredXP() + amount
  try { localStorage.setItem(XP_KEY, String(next)) } catch {}
  return next
}

function DifficultyPip({ level }: { level: number }) {
  const colors: Record<number, string> = { 1: 'var(--apple-green)', 2: 'var(--apple-orange)', 3: 'var(--apple-red)' }
  const labels: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${colors[level]}18`, color: colors[level] }}
    >
      {labels[level]}
    </span>
  )
}

interface QuizProps {
  topicId: string
  topicTitle: string
  topicSlug: string
  domainSlug: string
  examId: string
  onComplete?: () => void
}

export function TopicQuiz({ topicId, topicTitle, topicSlug, domainSlug, examId, onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [sessionXP, setSessionXP] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [animateXP, setAnimateXP] = useState(false)

  const fetchQuestions = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/study/quiz?topicId=${topicId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setQuestions(data)
        else setError(true)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [topicId])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const currentQ = questions[qIndex]
  const progress = questions.length > 0
    ? ((qIndex + (answerState !== 'unanswered' ? 1 : 0)) / questions.length) * 100
    : 0

  const handleSelect = useCallback((choiceId: string) => {
    if (answerState !== 'unanswered' || !currentQ) return
    const choice = currentQ.choices.find((c) => c.id === choiceId)
    if (!choice) return
    setSelected(choiceId)
    const isCorrect = choice.isCorrect
    setAnswerState(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      const earned = XP_PER_DIFFICULTY[currentQ.difficulty] ?? 100
      setSessionXP((x) => x + earned)
      setCorrectCount((n) => n + 1)
      setAnimateXP(true)
      setTimeout(() => setAnimateXP(false), 600)
    }
  }, [answerState, currentQ])

  const handleNext = useCallback(() => {
    const wasCorrect = answerState === 'correct'
    if (qIndex + 1 >= questions.length) {
      const finalCorrect = correctCount + (wasCorrect ? 1 : 0)
      const isPerfect = finalCorrect === questions.length
      const bonus = XP_COMPLETION_BONUS + (isPerfect ? XP_PERFECT_BONUS : 0)
      const finalXP = sessionXP + bonus
      const newTotal = addStoredXP(finalXP)
      setTotalXP(newTotal)
      setSessionXP(finalXP)
      saveTopicScore({
        topicId, topicTitle, topicSlug, domainSlug, examId,
        correct: finalCorrect,
        total: questions.length,
        pct: Math.round((finalCorrect / questions.length) * 100),
        lastAttempt: new Date().toISOString().slice(0, 10),
      })
      setDone(true)
      onComplete?.()
    } else {
      setQIndex((i) => i + 1)
      setSelected(null)
      setAnswerState('unanswered')
    }
  }, [qIndex, questions.length, answerState, correctCount, sessionXP, onComplete])

  const handleRestart = useCallback(() => {
    setQIndex(0)
    setSelected(null)
    setAnswerState('unanswered')
    setSessionXP(0)
    setCorrectCount(0)
    setDone(false)
    fetchQuestions()
  }, [fetchQuestions])

  if (loading) {
    return (
      <div className="mt-10 border-t border-[var(--apple-separator)] pt-8">
        <SectionHeader sessionXP={0} qIndex={0} total={0} animateXP={false} />
        <div className="flex flex-col gap-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-[12px] bg-[var(--apple-fill)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) return null

  if (done) {
    const finalCorrect = correctCount
    const pct = Math.round((finalCorrect / questions.length) * 100)
    const passed = pct >= 60
    const perfect = pct === 100
    return (
      <div className="mt-10 border-t border-[var(--apple-separator)] pt-8">
        <div className="flex flex-col items-center py-8 px-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: perfect ? 'rgba(255,214,10,0.15)' : passed ? 'rgba(52,199,89,0.12)' : 'rgba(255,149,0,0.10)' }}
          >
            {perfect
              ? <Trophy className="w-8 h-8" style={{ color: 'var(--apple-yellow)' }} />
              : passed
                ? <CheckCircle2 className="w-8 h-8 text-[var(--apple-green)]" />
                : <Brain className="w-8 h-8 text-[var(--apple-orange)]" />}
          </div>
          <h3 className="text-[20px] font-bold mb-1">
            {perfect ? 'Perfect score!' : passed ? 'Nice work!' : 'Keep going!'}
          </h3>
          <p className="text-[13px] text-[var(--apple-label-secondary)] mb-5">
            {finalCorrect}/{questions.length} correct on &ldquo;{topicTitle}&rdquo;
          </p>
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-[14px] mb-6"
            style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Zap className="w-4 h-4 text-[var(--apple-indigo)]" />
            <span className="text-[15px] font-bold text-[var(--apple-indigo)]">+{sessionXP} XP</span>
            <span className="text-[12px] text-[var(--apple-label-secondary)]">— Total: {totalXP.toLocaleString()} XP</span>
          </div>
          <div className="text-left w-full max-w-sm bg-[var(--apple-fill)] rounded-[12px] p-4 mb-6">
            <p className="text-[11px] font-semibold text-[var(--apple-purple)] mb-1">Why this works 🧠</p>
            <p className="text-[12px] text-[var(--apple-label-secondary)] leading-relaxed">
              Testing yourself right after reading boosts long-term retention by up to 50% compared to re-reading (retrieval practice effect).
              {pct < 80 && ' Review the explanations above, then retry to lock it in.'}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Quiz
          </button>
        </div>
      </div>
    )
  }

  const correctChoice = currentQ.choices.find((c) => c.isCorrect)

  return (
    <div className="mt-10 border-t border-[var(--apple-separator)] pt-8">
      <SectionHeader sessionXP={sessionXP} qIndex={qIndex} total={questions.length} animateXP={animateXP} />

      {/* Progress bar */}
      <div className="w-full bg-[var(--apple-fill)] rounded-full h-1.5 mt-4 mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: 'var(--apple-purple)' }}
        />
      </div>

      {/* Question card */}
      <div className="bg-card border border-[var(--apple-separator)] rounded-[16px] p-5 mb-4 shadow-sm">
        <div className="mb-3">
          <DifficultyPip level={currentQ.difficulty} />
        </div>
        <p className="text-[15px] font-semibold text-foreground leading-snug">{currentQ.stem}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2.5 mb-4">
        {currentQ.choices.map((choice) => {
          const isSelected = selected === choice.id
          const isCorrect = choice.isCorrect
          const revealed = answerState !== 'unanswered'

          let borderColor = 'var(--apple-separator)'
          let bgColor = 'transparent'
          let textColor = 'var(--foreground)'
          let icon: React.ReactNode = null

          if (revealed) {
            if (isCorrect) {
              borderColor = 'var(--apple-green)'
              bgColor = 'rgba(52,199,89,0.08)'
              textColor = 'var(--apple-green)'
              icon = <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--apple-green)]" />
            } else if (isSelected) {
              borderColor = 'var(--apple-red)'
              bgColor = 'rgba(255,59,48,0.08)'
              textColor = 'var(--apple-red)'
              icon = <XCircle className="w-4 h-4 shrink-0 text-[var(--apple-red)]" />
            } else {
              textColor = 'var(--apple-label-tertiary)'
              borderColor = 'var(--apple-separator)'
            }
          } else if (isSelected) {
            borderColor = 'var(--apple-blue)'
            bgColor = 'rgba(0,122,255,0.08)'
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={revealed}
              className={cn(
                'w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-[12px] border-2 text-[14px] font-medium transition-all duration-200',
                !revealed && 'hover:border-[var(--apple-blue)]/60 hover:bg-[var(--apple-fill)] cursor-pointer active:scale-[0.99]',
                revealed && 'cursor-default',
              )}
              style={{ borderColor, backgroundColor: bgColor, color: textColor }}
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="flex-1">{choice.text}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answerState !== 'unanswered' && (
        <div
          className="rounded-[12px] p-4 mb-4 border animate-fade-up"
          style={{
            borderColor: answerState === 'correct' ? 'var(--apple-green)' : 'var(--apple-red)',
            backgroundColor: answerState === 'correct' ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          }}
        >
          <p
            className="text-[12px] font-semibold mb-1.5"
            style={{ color: answerState === 'correct' ? 'var(--apple-green)' : 'var(--apple-red)' }}
          >
            {answerState === 'correct'
              ? `✓ Correct — +${XP_PER_DIFFICULTY[currentQ.difficulty]} XP`
              : `✗ Incorrect — correct: "${correctChoice?.text}"`}
          </p>
          <p className="text-[13px] text-foreground leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {answerState !== 'unanswered' && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: 'var(--apple-blue)' }}
        >
          {qIndex + 1 >= questions.length ? <><Trophy className="w-4 h-4" /> See Results</> : <>Next Question <ChevronRight className="w-4 h-4" /></>}
        </button>
      )}
    </div>
  )
}

function SectionHeader({ sessionXP, qIndex, total, animateXP }: { sessionXP: number; qIndex: number; total: number; animateXP: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-[6px] bg-[var(--apple-purple)]/15 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-[var(--apple-purple)]" />
        </div>
        <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          Knowledge Check
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={cn('flex items-center gap-1 text-[12px] font-bold transition-transform duration-200', animateXP && 'scale-125')}
          style={{ color: 'var(--apple-indigo)' }}
        >
          <Zap className="w-3 h-3" />
          {sessionXP} XP
        </div>
        {total > 0 && (
          <span className="text-[12px] text-[var(--apple-label-tertiary)]">{qIndex + 1} / {total}</span>
        )}
      </div>
    </div>
  )
}
