type ColorKey = 'blue' | 'orange' | 'green' | 'purple'

const COLORS: Record<ColorKey, { bg: string; line: string }> = {
  blue:   { bg: '#007AFF', line: 'rgba(0,122,255,0.22)'   },
  orange: { bg: '#FF9F0A', line: 'rgba(255,159,10,0.22)'  },
  green:  { bg: '#34C759', line: 'rgba(52,199,89,0.22)'   },
  purple: { bg: '#AF52DE', line: 'rgba(175,82,222,0.22)'  },
}

interface Step {
  title: string
  description: string
}

interface ProcessStepsProps {
  steps: Step[]
  color?: ColorKey
  title?: string
}

export function ProcessSteps({ steps, color = 'blue', title }: ProcessStepsProps) {
  const c = COLORS[color]

  return (
    <div className="my-6">
      {title && (
        <p className="text-[11px] font-bold text-[var(--apple-label-tertiary)] uppercase tracking-[0.12em] mb-4">
          {title}
        </p>
      )}

      <div className="space-y-0">
        {(steps ?? []).map((step, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-[19px] top-[40px] w-[2px]"
                style={{ bottom: 0, background: c.line }}
              />
            )}

            {/* Step circle */}
            <div className="shrink-0 z-10 pt-0.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shadow-sm"
                style={{ background: c.bg }}
              >
                {i + 1}
              </div>
            </div>

            {/* Content */}
            <div className={`${i < steps.length - 1 ? 'pb-6' : 'pb-0'} min-w-0`}>
              <p className="font-semibold text-[14px] text-foreground mt-2 leading-tight">{step.title}</p>
              <p className="text-[13px] text-[var(--apple-label-secondary)] mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
