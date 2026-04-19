'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, Terminal, RotateCcw, ChevronDown, ChevronUp, GripVertical, Keyboard } from 'lucide-react'
import { type PBQScenario, type PBQChoice, type PBQStepMultipleChoice, getStepType } from '@/data/pbq-scenarios'
import { MultipleChoiceStep } from './multiple-choice-step'
import { DragMatchStep } from './drag-match-step'
import { DragOrderStep } from './drag-order-step'
import { TerminalStep } from './terminal-step'
import { cn } from '@/lib/utils'

interface StepResult {
  stepId: string
  isCorrect: boolean
  detail: string
}

type PlayerState = 'active' | 'done'

const STEP_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  multiple_choice: { label: 'Multiple Choice', icon: ChevronRight, color: 'var(--apple-blue)' },
  drag_match:      { label: 'Drag & Match',    icon: GripVertical,  color: 'var(--apple-purple)' },
  drag_order:      { label: 'Drag & Order',    icon: GripVertical,  color: 'var(--apple-indigo)' },
  terminal:        { label: 'Terminal',         icon: Keyboard,      color: 'var(--apple-green)' },
}

export function ScenarioPlayer({ scenario }: { scenario: PBQScenario }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playerState, setPlayerState] = useState<PlayerState>('active')
  const [results, setResults] = useState<StepResult[]>([])
  const [contextExpanded, setContextExpanded] = useState(true)
  // For multiple-choice steps, track selected choice locally so feedback renders inline
  const [mcChoice, setMcChoice] = useState<PBQChoice | null>(null)
  const [stepDone, setStepDone] = useState(false)

  const currentStep = scenario.steps[stepIndex]
  const progress = ((stepIndex + (stepDone ? 1 : 0)) / scenario.steps.length) * 100
  const stepType = getStepType(currentStep)

  const handleStepComplete = useCallback((isCorrect: boolean, detail: string) => {
    setResults((prev) => [...prev, { stepId: currentStep.id, isCorrect, detail }])
    setStepDone(true)
  }, [currentStep.id])

  const handleMcSelect = useCallback((choice: PBQChoice) => {
    setMcChoice(choice)
    handleStepComplete(choice.isCorrect, choice.text)
  }, [handleStepComplete])

  const handleNext = useCallback(() => {
    if (stepIndex + 1 >= scenario.steps.length) {
      setPlayerState('done')
    } else {
      setStepIndex((i) => i + 1)
      setMcChoice(null)
      setStepDone(false)
      setContextExpanded(false)
    }
  }, [stepIndex, scenario.steps.length])

  const handleRestart = useCallback(() => {
    setStepIndex(0)
    setPlayerState('active')
    setMcChoice(null)
    setStepDone(false)
    setResults([])
    setContextExpanded(true)
  }, [])

  // ── Done screen ─────────────────────────────────────────────────────────────
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

        <h2 className="text-[24px] font-bold mb-1">{passed ? 'Lab Complete!' : 'Lab Finished'}</h2>
        <p className="text-[var(--apple-label-secondary)] mb-2 text-[14px]">{scenario.title}</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-[32px] font-bold" style={{ color: passed ? 'var(--apple-green)' : 'var(--apple-red)' }}>
            {pct}%
          </span>
          <span className="text-[var(--apple-label-secondary)] text-[14px]">{correct}/{total} correct</span>
        </div>

        <div className="mb-8 text-left">
          <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-3">Step Results</p>
          <div className="flex flex-col gap-2">
            {results.map((result, i) => (
              <div
                key={result.stepId}
                className="flex items-start gap-3 bg-card rounded-[12px] p-3 border border-[var(--apple-separator)]"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: result.isCorrect ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.12)' }}
                >
                  {result.isCorrect
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--apple-green)]" />
                    : <XCircle className="w-3.5 h-3.5 text-[var(--apple-red)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground mb-0.5">Step {i + 1}</p>
                  <p className="text-[11px] text-[var(--apple-label-secondary)] line-clamp-2">{result.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/labs" className="px-5 py-2.5 bg-[var(--apple-fill)] rounded-full text-[14px] font-medium">
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

  // ── Active step screen ──────────────────────────────────────────────────────
  const meta = STEP_TYPE_LABELS[stepType]
  const Icon = meta.icon

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
        <div className="flex items-center gap-3">
          {/* Step type badge */}
          <span
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
          >
            <Icon className="w-2.5 h-2.5" />
            {meta.label}
          </span>
          <span className="text-[13px] font-medium text-[var(--apple-label-secondary)]">
            {stepIndex + 1} / {scenario.steps.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--apple-fill)] rounded-full h-1 mb-6 overflow-hidden">
        <div
          className="h-full bg-[var(--apple-blue)] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scenario context */}
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

      {/* Tool output (non-terminal steps) */}
      {currentStep.toolOutput && stepType !== 'terminal' && (
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

      {/* Prompt */}
      <div className="mb-5">
        <p className="text-[15px] font-semibold text-foreground leading-snug">{currentStep.prompt}</p>
        {currentStep.hint && !stepDone && (
          <p className="text-[12px] text-[var(--apple-label-tertiary)] mt-1.5 italic">{currentStep.hint}</p>
        )}
      </div>

      {/* Step interaction — dispatch on type */}
      {stepType === 'multiple_choice' && (
        <MultipleChoiceStep
          step={currentStep as PBQStepMultipleChoice}
          selectedChoice={mcChoice}
          onSelect={handleMcSelect}
          showFeedback={stepDone}
        />
      )}

      {stepType === 'drag_match' && !stepDone && (
        <DragMatchStep
          step={currentStep as Parameters<typeof DragMatchStep>[0]['step']}
          onComplete={handleStepComplete}
        />
      )}

      {stepType === 'drag_order' && !stepDone && (
        <DragOrderStep
          step={currentStep as Parameters<typeof DragOrderStep>[0]['step']}
          onComplete={handleStepComplete}
        />
      )}

      {stepType === 'terminal' && !stepDone && (
        <TerminalStep
          step={currentStep as Parameters<typeof TerminalStep>[0]['step']}
          onComplete={handleStepComplete}
        />
      )}

      {/* Next button — shown after any step type completes */}
      {stepDone && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--apple-blue)] text-white rounded-[12px] text-[14px] font-semibold hover:opacity-90 transition-opacity mt-2"
        >
          {stepIndex + 1 >= scenario.steps.length ? 'See Results' : 'Next Step'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
