import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { examAttempts, questionAttempts, questions, topics, domains } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, Trophy, ChevronRight, Flag } from 'lucide-react'

interface Params {
  attemptId: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function ReviewPage({ params }: { params: Promise<Params> }) {
  const { attemptId } = await params

  const [attempt] = await db
    .select()
    .from(examAttempts)
    .where(eq(examAttempts.id, attemptId))

  if (!attempt) notFound()

  const reviewRows = await db
    .select({
      qa_selectedAnswer: questionAttempts.selectedAnswer,
      qa_isCorrect: questionAttempts.isCorrect,
      qa_timeSpentSeconds: questionAttempts.timeSpentSeconds,
      qa_isFlagged: questionAttempts.isFlagged,
      q_id: questions.id,
      q_stem: questions.stem,
      q_type: questions.type,
      q_choices: questions.choices,
      q_correctAnswer: questions.correctAnswer,
      q_explanation: questions.explanation,
      t_title: topics.title,
      t_objectiveId: topics.objectiveId,
      d_name: domains.name,
      d_id: domains.id,
    })
    .from(questionAttempts)
    .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .innerJoin(domains, eq(topics.domainId, domains.id))
    .where(eq(questionAttempts.examAttemptId, attemptId))

  // Domain breakdown
  const domainMap = new Map<string, { name: string; correct: number; total: number }>()
  for (const row of reviewRows) {
    const entry = domainMap.get(row.d_id) ?? { name: row.d_name, correct: 0, total: 0 }
    entry.total++
    if (row.qa_isCorrect) entry.correct++
    domainMap.set(row.d_id, entry)
  }
  const domainStats = Array.from(domainMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  const scorePercent = attempt.scorePercent ?? 0
  const scaledScore = Math.round((scorePercent / 100) * 900)
  const passed = scorePercent >= 75
  const total = attempt.totalQuestions
  const correct = attempt.correctCount ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Score header */}
      <div className="bg-card rounded-[24px] border border-[var(--apple-separator)] shadow-sm p-8 mb-6 text-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1 rounded-full mb-4',
            passed
              ? 'bg-[var(--apple-green)]/15 text-[var(--apple-green)]'
              : 'bg-[var(--apple-red)]/15 text-[var(--apple-red)]'
          )}
        >
          {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {passed ? 'Practice Pass' : 'Practice Fail'}
        </div>

        <div
          className={cn(
            'text-[64px] font-bold leading-none mb-1',
            passed ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'
          )}
        >
          {Math.round(scorePercent)}%
        </div>
        <p className="text-[16px] text-[var(--apple-label-secondary)] mb-6">
          Scaled score: <span className="font-semibold text-foreground">{scaledScore}</span>/900
          <span className="mx-2 text-[var(--apple-separator-opaque)]">·</span>
          Pass threshold: 675/900
        </p>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-[22px] font-bold text-foreground">{correct}/{total}</p>
            <p className="text-[12px] text-[var(--apple-label-tertiary)]">Correct</p>
          </div>
          <div className="w-px h-8 bg-[var(--apple-separator)]" />
          <div className="text-center">
            <p className="text-[22px] font-bold text-foreground">{total - correct}</p>
            <p className="text-[12px] text-[var(--apple-label-tertiary)]">Incorrect</p>
          </div>
          {attempt.timeSpentSeconds != null && (
            <>
              <div className="w-px h-8 bg-[var(--apple-separator)]" />
              <div className="text-center">
                <p className="text-[22px] font-bold text-foreground">{formatTime(attempt.timeSpentSeconds)}</p>
                <p className="text-[12px] text-[var(--apple-label-tertiary)]">Time</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Domain breakdown */}
      {domainStats.length > 0 && (
        <div className="bg-card rounded-[20px] border border-[var(--apple-separator)] shadow-sm p-5 mb-6">
          <p className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-4">
            Domain Performance
          </p>
          <div className="flex flex-col gap-3">
            {domainStats.map((d) => {
              const pct = Math.round((d.correct / d.total) * 100)
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-foreground truncate max-w-[200px]">{d.name}</span>
                    <span
                      className={cn(
                        'text-[12px] font-semibold',
                        pct >= 75 ? 'text-[var(--apple-green)]' : 'text-[var(--apple-red)]'
                      )}
                    >
                      {d.correct}/{d.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--apple-fill)] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        pct >= 75 ? 'bg-[var(--apple-green)]' : 'bg-[var(--apple-red)]'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="flex flex-col gap-3 mb-8">
        <p className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide">
          Question Review
        </p>
        {reviewRows.map((row, i) => {
          const choices: Array<{ id: string; text: string; isCorrect: boolean }> = JSON.parse(row.q_choices)
          const correct = JSON.parse(row.q_correctAnswer)
          const correctIds: string[] = Array.isArray(correct) ? correct : [String(correct)]
          const selectedRaw = JSON.parse(row.qa_selectedAnswer)
          const selectedIds: string[] = selectedRaw === null
            ? []
            : Array.isArray(selectedRaw) ? selectedRaw : [String(selectedRaw)]

          return (
            <div
              key={row.q_id}
              className={cn(
                'bg-card rounded-[16px] border shadow-sm overflow-hidden',
                row.qa_isCorrect ? 'border-[var(--apple-green)]/30' : 'border-[var(--apple-red)]/30'
              )}
            >
              {/* Question header */}
              <div
                className={cn(
                  'flex items-center gap-3 px-5 py-3 border-b',
                  row.qa_isCorrect
                    ? 'bg-[var(--apple-green)]/5 border-[var(--apple-green)]/20'
                    : 'bg-[var(--apple-red)]/5 border-[var(--apple-red)]/20'
                )}
              >
                {row.qa_isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--apple-green)] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[var(--apple-red)] shrink-0" />
                )}
                <span className="text-[11px] font-mono font-semibold text-[var(--apple-label-secondary)]">
                  Q{i + 1}
                </span>
                <span className="text-[11px] text-[var(--apple-label-tertiary)]">
                  {row.t_objectiveId} · {row.d_name}
                </span>
                {row.qa_isFlagged && (
                  <Flag className="w-3.5 h-3.5 text-[var(--apple-orange)] ml-auto" />
                )}
                {row.qa_timeSpentSeconds != null && (
                  <span className="text-[11px] text-[var(--apple-label-tertiary)] flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" />
                    {row.qa_timeSpentSeconds}s
                  </span>
                )}
              </div>

              <div className="p-5">
                <p className="text-[15px] font-medium text-foreground leading-relaxed mb-4">{row.q_stem}</p>

                {/* Choices */}
                {(row.q_type === 'single_choice' || row.q_type === 'multiple_choice') && (
                  <div className="flex flex-col gap-1.5 mb-4">
                    {choices.map((c, ci) => {
                      const isCorrect = correctIds.includes(c.id)
                      const isSelected = selectedIds.includes(c.id)
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-[10px] border text-[13px]',
                            isCorrect && isSelected
                              ? 'bg-[var(--apple-green)]/10 border-[var(--apple-green)]/40'
                              : isCorrect
                              ? 'bg-[var(--apple-green)]/8 border-[var(--apple-green)]/30'
                              : isSelected
                              ? 'bg-[var(--apple-red)]/10 border-[var(--apple-red)]/40'
                              : 'bg-[var(--apple-fill)] border-transparent'
                          )}
                        >
                          <span
                            className={cn(
                              'w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-bold',
                              row.q_type === 'multiple_choice' ? 'rounded-[4px]' : 'rounded-full',
                              isCorrect
                                ? 'bg-[var(--apple-green)] text-white'
                                : isSelected
                                ? 'bg-[var(--apple-red)] text-white'
                                : 'border border-[var(--apple-label-tertiary)] text-[var(--apple-label-tertiary)]'
                            )}
                          >
                            {isCorrect ? '✓' : isSelected ? '✗' : String.fromCharCode(65 + ci)}
                          </span>
                          <span
                            className={cn(
                              'leading-snug',
                              isCorrect
                                ? 'text-[var(--apple-green)] font-medium'
                                : isSelected
                                ? 'text-[var(--apple-red)]'
                                : 'text-[var(--apple-label-secondary)]'
                            )}
                          >
                            {c.text}
                          </span>
                          {isCorrect && !isSelected && (
                            <span className="ml-auto text-[10px] font-semibold text-[var(--apple-green)]">
                              Correct answer
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {row.q_type === 'fill_blank' && (
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[var(--apple-label-secondary)]">Your answer:</span>
                      <span className={cn(
                        'font-mono text-[13px] px-2 py-0.5 rounded',
                        row.qa_isCorrect
                          ? 'bg-[var(--apple-green)]/10 text-[var(--apple-green)]'
                          : 'bg-[var(--apple-red)]/10 text-[var(--apple-red)]'
                      )}>
                        {selectedIds[0] ?? '(no answer)'}
                      </span>
                    </div>
                    {!row.qa_isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[var(--apple-label-secondary)]">Correct answer:</span>
                        <span className="font-mono text-[13px] px-2 py-0.5 rounded bg-[var(--apple-green)]/10 text-[var(--apple-green)]">
                          {correctIds[0]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <details className="group">
                  <summary className="list-none cursor-pointer flex items-center gap-1.5 text-[12px] font-semibold text-[var(--apple-blue)] select-none">
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                    Explanation
                  </summary>
                  <p className="mt-2 text-[13px] text-[var(--apple-label-secondary)] leading-relaxed pl-5">
                    {row.q_explanation}
                  </p>
                </details>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="text-[13px] font-medium text-[var(--apple-blue)] hover:underline"
        >
          ← Back to Practice
        </Link>
        <Link
          href="/practice/session?mode=quick"
          className="flex items-center gap-2 bg-[var(--apple-blue)] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          <Trophy className="w-3.5 h-3.5" />
          Try Again
        </Link>
      </div>
    </div>
  )
}
