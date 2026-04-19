'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { type PBQStepMultipleChoice, type PBQChoice } from '@/data/pbq-scenarios'
import { cn } from '@/lib/utils'

interface Props {
  step: PBQStepMultipleChoice
  selectedChoice: PBQChoice | null
  onSelect: (choice: PBQChoice) => void
  showFeedback: boolean
}

export function MultipleChoiceStep({ step, selectedChoice, onSelect, showFeedback }: Props) {
  return (
    <>
      <div className="flex flex-col gap-2.5 mb-5">
        {step.choices.map((choice) => {
          const isSelected = selectedChoice?.id === choice.id

          let borderColor = 'var(--apple-separator)'
          let bgColor = 'var(--card)'
          let textColor = 'var(--foreground)'

          if (showFeedback && isSelected) {
            borderColor = choice.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)'
            bgColor = choice.isCorrect ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.08)'
          } else if (showFeedback && choice.isCorrect && !isSelected) {
            borderColor = 'var(--apple-green)'
            bgColor = 'rgba(52,199,89,0.05)'
            textColor = 'var(--apple-green)'
          }

          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice)}
              disabled={showFeedback}
              className={cn(
                'w-full text-left flex items-start gap-3 p-3.5 rounded-[12px] border transition-all duration-200',
                !showFeedback && 'hover:border-[var(--apple-blue)] hover:bg-[var(--apple-blue)]/5 cursor-pointer',
                showFeedback && 'cursor-default',
              )}
              style={{ borderColor, backgroundColor: bgColor }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor:
                    showFeedback && isSelected
                      ? choice.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)'
                      : showFeedback && choice.isCorrect && !isSelected
                        ? 'var(--apple-green)'
                        : 'var(--apple-fill)',
                  color:
                    showFeedback && (isSelected || (choice.isCorrect && !isSelected))
                      ? 'white'
                      : 'var(--apple-label-secondary)',
                }}
              >
                {choice.id.toUpperCase()}
              </span>
              <span className="text-[13px] leading-relaxed flex-1" style={{ color: textColor }}>
                {choice.text}
              </span>
              {showFeedback && isSelected && (
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

      {showFeedback && selectedChoice && (
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
          <p className="text-[13px] text-foreground leading-relaxed">{selectedChoice.feedback}</p>
        </div>
      )}
    </>
  )
}
