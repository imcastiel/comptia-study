'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { PBQStepHotspot } from '@/data/pbq-scenarios'
import { MotherboardDiagram, MOTHERBOARD_REGIONS, type DiagramRegion } from './diagrams/motherboard-diagram'

// Registry: add a diagram component + its regions here and new hotspot
// scenarios can reference it by key — no player changes needed.
const DIAGRAMS: Record<PBQStepHotspot['diagram'], { Component: typeof MotherboardDiagram; regions: DiagramRegion[] }> = {
  motherboard: { Component: MotherboardDiagram, regions: MOTHERBOARD_REGIONS },
}

interface HotspotStepProps {
  step: PBQStepHotspot
  onComplete: (isCorrect: boolean, detail: string) => void
}

export function HotspotStep({ step, onComplete }: HotspotStepProps) {
  const [clickedId, setClickedId] = useState<string | null>(null)
  const diagram = DIAGRAMS[step.diagram]

  const handleClick = useCallback((regionId: string) => {
    if (clickedId) return
    setClickedId(regionId)
    const isCorrect = regionId === step.targetRegionId
    const clickedLabel = diagram.regions.find((r) => r.id === regionId)?.label ?? regionId
    onComplete(isCorrect, clickedLabel)
  }, [clickedId, step.targetRegionId, diagram.regions, onComplete])

  const answered = clickedId !== null
  const isCorrect = clickedId === step.targetRegionId
  const clickedLabel = diagram.regions.find((r) => r.id === clickedId)?.label
  const targetLabel = diagram.regions.find((r) => r.id === step.targetRegionId)?.label

  return (
    <div>
      <div className="bg-card border border-[var(--apple-separator)] rounded-[16px] p-4">
        <diagram.Component
          clickedId={clickedId}
          correctId={answered ? step.targetRegionId : null}
          showFeedback={answered}
          onRegionClick={handleClick}
        />
      </div>

      {answered && (
        <div
          className="mt-3 flex items-start gap-2.5 rounded-[12px] p-3.5 text-[13px] leading-relaxed"
          style={{ backgroundColor: isCorrect ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.08)' }}
        >
          {isCorrect
            ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[var(--apple-green)]" />
            : <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--apple-red)]" />}
          <div>
            <p className="font-semibold mb-0.5" style={{ color: isCorrect ? 'var(--apple-green)' : 'var(--apple-red)' }}>
              {isCorrect ? `Correct — that's the ${targetLabel}.` : `You clicked the ${clickedLabel}.`}
            </p>
            <p className="text-[var(--apple-label-secondary)]">
              {isCorrect ? step.feedback.correct : step.feedback.incorrect}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
