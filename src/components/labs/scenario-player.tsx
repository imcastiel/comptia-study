'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, Terminal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { type PBQScenario, type PBQChoice } from '@/data/pbq-scenarios'
import { cn } from '@/lib/utils'

interface StepResult {
  stepId: string
  choiceId: string
  isCorrect: boolean
}

type PlayerState = 'question' | 'feedback' | 'done'

export function ScenarioPlayer({ scenario }: { scenario: PBQScenario }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playerState, setPlayerState] = useState<PlayerState>('question')
  const [selectedChoice, setSelectedChoice] = useState<PBQChoice | null>(null)
  const [results, setResults] = useState<StepResult[]>([])
  const [contextExpanded, setContextExpanded] = useState(true)

  const currentStep = scenario.steps[stepIndex]
  const progress = (stepIndex / scenario.steps.length) * 100

  const handleSelect = useCallback((choice: PBQChoice) => {
    if (playerState !== 'question') return
    setSelectedChoice(choice)
    setResults((prev) => [...prev, { stepId: currentStep.id, choiceId: choice.id, isCorrect: choice.isCorrect }])
    setPlayerState('feedback')
  }, [playerState, currentStep])

  const handleNext = useCallback(() => {
    if (stepIndex + 1 >= scenario.steps.length) {
      setPlayerState('done')
    } else {
      setStepIndex((i) => i + 1)
      setSelectedChoice(null)
      setPlayerState('question')
      setContextExpanded(false)
    }
  }, [stepIndex, scenario.steps.length])

  const handleRestart = useCallback(() => {
    setStepIndex(0)
    setPlayerState('question')
    setSelectedChoice(null)
    setResults([])
    setContextExpanded(true)
  }, [])

  // ── Done screen ────────────────────────────────────────────────────────────
  if (playerState === 'done') {
    const correct = results.filter((r) => r.isCorrect).length
    const total = results.length
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = pct >= 70

    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: passed ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)' }}
        >
          {passed
            ? <CheckCircle2 className="w-8 h-8 text-[var(--apple-green)]" />
            : <XCircle className="w-8 h-8 text-[var(--apple-red)]" />
          }
        </div>

        <h2 className="text-[24px] font-bold mb-1">
          {passed ? 'Lab Complete!' : 'Lab Finished'}
        </h2>
        <p className="text-[var(--apple-label-secondary)] mb-2 text-[14px]">{scenario.title}</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className="text-[32px] font-bold"
            style={{ color: passed ? 'var(--apple-green)' : 'var(--apple-red)' }}
          >
            {pct}%
          </span>
          <span className="text-[var(--apple-label-secondary)] text-[14px]">
            {correct}/{total} correct
          </span>
        </div>

        {/* Step-by-step results */}
        <div className="mb-8 text-left">
          <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-3">Step Results</p>
          <div className="flex flex-col gap-2">
            {results.map((result, i) => {
              const step = scenario.steps.find((s) => s.id === result.stepId)
              const choice = step?.choices.find((c) => c.id === result.choiceId)
              return (
                <div
                  key={result.stepId}
                  className="flex items-start gap-3 bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: result.isCorrect ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)',
                    }}
                  >
                    {result.isCorrect
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--apple-green)]" />
                      : <XCircle className="w-3.5 h-3.5 text-[var(--apple-red)]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground mb-0.5">Step {i + 1}</p>
                    <p className="text-[11px] text-[var(--apple-label-secondary)] truncate">{choice?.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/labs"
            className="px-5 py-2.5 bg-[var(--apple-fill)] rounded-full text-[14px] font-medium"
          >
            Back to Labs
          </Link>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--apple-blue)] text-white rounded-full text-[14px] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Session screen ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/labs"
          className="flex items-center gap-1.5 text-[13px] text-[var(--apple-label-secondary)] hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Labs
        </Link>
        <span className="text-[13px] font-medium text-[var(--apple-label-secondary)]">
          Step {stepIndex + 1} / {scenario.steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--apple-fill)] rounded-full h-1 mb-6 overflow-hidden">
        <div
          className="h-full bg-[var(--apple-blue)] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Context panel */}
      <div className="mb-5 bg-card border border-[var(--apple-separator)] rounded-[14px] overflow-hidden">
        <button
          onClick={() => setContextExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--apple-fill)] transition-colors"
        >
          <span className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide">
            Scenario
          </span>
          {contextExpanded
            ? <ChevronUp className="w-3.5 h-3.5 text-[var(--apple-label-tertiary)]" />
            : <ChevronDown className="w-3.5 h-3.5 text-[var(--apple-label-tertiary)]" />
          }
        </button>
        {contextExpanded && (
          <div className="px-4 pb-4">
            <p className="text-[13px] font-semibold text-foreground mb-1">{scenario.title}</p>
            <p className="text-[12px] text-[var(--apple-label-secondary)] leading-relaxed whitespace-pre-line">
              {scenario.context}
            </p>
          </div>
        )}
      </div>

      {/* Tool output */}
      {currentStep.toolOutput && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3.5 h-3.5 text-[var(--apple-label-tertiary)]" />
            <span className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide">
              {currentStep.toolOutput.label}
            </span>
          </div>
          <div className="bg-[#1a1a1a] dark:bg-[#0d0d0d] rounded-[12px] p-4 overflow-x-auto">
            <pre className="text-[12px] text-[#e5e5e5] font-mono leading-relaxed whitespace-pre">
              {currentStep.toolOutput.content}
            </pre>
          </div>
        </div>
      )}

      {/* Question prompt */}
      <div className="mb-5">
        <p className="text-[15px] font-semibold text-foreground leading-snug">{currentStep.prompt}</p>
        {currentStep.hint && playerState === 'question' && (
          <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-1.5 italic">{currentStep.hint}</p>
        )}
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2.5 mb-5">
        {currentStep.choices.map((choice) => {
          const isSelected = selectedChoice?.id === choice.id
          const showResult = playerState === 'feedback'

          let borderColor = 'var(--apple-separator)'
          let bgColor = 'var(--card)'
          let textColor = 'var(--foreground)'

          if (showResult && isSelected) {
            if (choice.isCorrect) {
              borderColor = 'var(--apple-green)'
              bgColor = 'rgba(52,199,89,0.08)'
            } else {
              borderColor = 'var(--apple-red)'
              bgColor = 'rgba(255,59,48,0.08)'
            }
          } else if (showResult && choice.isCorrect && !isSelected) {
            // Show the correct answer if user got it wrong
            borderColor = 'var(--apple-green)'
            bgColor = 'rgba(52,199,89,0.05)'
            textColor = 'var(--apple-green)'
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice)}
              disabled={playerState !== 'question'}
              className={cn(
                'w-full text-left flex items-start gap-3 p-3.5 rounded-[12px] border transition-all duration-200',
                playerState === 'question' && 'hover:border-[var(--apple-blue)] hover:bg-[var(--apple-blue)]/5 cursor-pointer',
                playerState !== 'question' && 'cursor-default'
              )}
              style={{ borderColor, backgroundColor: bgColor }}
            >
              {/* Letter badge */}
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: showResult && isSelected
                    ? choice.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)'
                    : showResult && choice.isCorrect && !isSelected
                      ? 'var(--apple-green)'
                      : 'var(--apple-fill)',
                  color: showResult && (isSelected || (choice.isCorrect && !isSelected)) ? 'white' : 'var(--apple-label-secondary)',
                }}
              >
                {choice.id.toUpperCase()}
              </span>
              <span
                className="text-[13px] leading-relaxed flex-1"
                style={{ color: textColor }}
              >
                {choice.text}
              </span>
              {showResult && isSelected && (
                <span className="shrink-0 mt-0.5">
                  {choice.isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-[var(--apple-green)]" />
                    : <XCircle className="w-4 h-4 text-[var(--apple-red)]" />
                  }
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback box */}
      {playerState === 'feedback' && selectedChoice && (
        <div
          className="mb-5 rounded-[12px] p-4 border"
          style={{
            borderColor: selectedChoice.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)',
            backgroundColor: selectedChoice.isCorrect ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          }}
        >
          <p
            className="text-[12px] font-semibold mb-1"
            style={{ color: selectedChoice.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)' }}
          >
            {selectedChoice.isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </p>
          <p className="text-[13px] text-foreground leading-relaxed">
            {selectedChoice.feedback}
          </p>
        </div>
      )}

      {/* Next button */}
      {playerState === 'feedback' && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--apple-blue)] text-white rounded-[12px] text-[14px] font-semibold hover:opacity-90 transition-opacity"
        >
          {stepIndex + 1 >= scenario.steps.length ? 'See Results' : 'Next Step'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
