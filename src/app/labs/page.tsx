'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Terminal, Wifi, Shield, Monitor, Cpu, Smartphone, Clock, ChevronRight, FlaskConical, Sparkles, Loader2, Play } from 'lucide-react'
import { PBQ_SCENARIOS, type PBQCategory, type PBQScenario } from '@/data/pbq-scenarios'
import { ScenarioPlayer } from '@/components/labs/scenario-player'
import { cn } from '@/lib/utils'

const CATEGORIES: { id: PBQCategory | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all', label: 'All Labs', icon: FlaskConical, color: 'var(--apple-blue)' },
  { id: 'networking', label: 'Networking', icon: Wifi, color: 'var(--apple-blue)' },
  { id: 'security', label: 'Security', icon: Shield, color: 'var(--apple-red)' },
  { id: 'os', label: 'OS', icon: Monitor, color: 'var(--apple-indigo)' },
  { id: 'hardware', label: 'Hardware', icon: Cpu, color: 'var(--apple-orange)' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, color: 'var(--apple-teal)' },
]

const CATEGORY_META: Record<PBQCategory, { color: string; bg: string; label: string }> = {
  networking: { color: 'var(--apple-blue)', bg: 'rgba(0,122,255,0.1)', label: 'Networking' },
  security: { color: 'var(--apple-red)', bg: 'rgba(255,59,48,0.1)', label: 'Security' },
  os: { color: 'var(--apple-indigo)', bg: 'rgba(88,86,214,0.1)', label: 'OS' },
  hardware: { color: 'var(--apple-orange)', bg: 'rgba(255,149,0,0.1)', label: 'Hardware' },
  mobile: { color: 'var(--apple-teal)', bg: 'rgba(90,200,250,0.1)', label: 'Mobile' },
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= level
              ? level === 1 ? 'var(--apple-green)' : level === 2 ? 'var(--apple-orange)' : 'var(--apple-red)'
              : 'var(--apple-separator)',
          }}
        />
      ))}
      <span className="text-[10px] text-[var(--apple-label-tertiary)] ml-1">
        {level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced'}
      </span>
    </div>
  )
}

export default function LabsPage() {
  const [activeFilter, setActiveFilter] = useState<PBQCategory | 'all'>('all')
  const [generatingCategory, setGeneratingCategory] = useState<PBQCategory>('networking')
  const [generatingDifficulty, setGeneratingDifficulty] = useState<1 | 2 | 3>(2)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScenario, setGeneratedScenario] = useState<PBQScenario | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showGeneratePanel, setShowGeneratePanel] = useState(false)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setGenerateError(null)
    setGeneratedScenario(null)
    try {
      const res = await fetch('/api/ai/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: generatingCategory, difficulty: generatingDifficulty }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGeneratedScenario(data.scenario)
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [generatingCategory, generatingDifficulty])

  // If a generated scenario is ready to play, show the player
  if (generatedScenario && !isGenerating) {
    return (
      <div>
        <div className="max-w-xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--apple-purple)]/10 text-[var(--apple-purple)]">
              <Sparkles className="w-3 h-3" />
              AI-Generated Scenario
            </div>
            <button
              onClick={() => setGeneratedScenario(null)}
              className="text-[12px] text-[var(--apple-label-secondary)] hover:text-foreground"
            >
              ← Back to Labs
            </button>
          </div>
        </div>
        <ScenarioPlayer scenario={generatedScenario} />
      </div>
    )
  }

  const filtered = activeFilter === 'all'
    ? PBQ_SCENARIOS
    : PBQ_SCENARIOS.filter((s) => s.category === activeFilter)

  const totalScenarios = PBQ_SCENARIOS.length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--apple-purple)]/15 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[var(--apple-purple)]" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">PBQ Labs</h1>
        </div>
        <p className="text-[var(--apple-label-secondary)] text-[14px]">
          {totalScenarios} hands-on scenarios — work through real problems step by step, just like the exam.
        </p>
      </div>

      {/* What are PBQs callout */}
      <div className="mb-6 bg-[var(--apple-purple)]/5 border border-[var(--apple-purple)]/20 rounded-[14px] p-4">
        <p className="text-[12px] font-semibold text-[var(--apple-purple)] mb-1">What are Performance-Based Questions?</p>
        <p className="text-[13px] text-[var(--apple-label-secondary)] leading-relaxed">
          PBQs appear <strong>first</strong> in the real CompTIA exam and test practical skills — not just memorization.
          Each lab walks you through a real troubleshooting scenario with tool outputs, multiple choices, and detailed feedback explaining <em>why</em> each answer is right or wrong.
        </p>
      </div>

      {/* AI Generate panel */}
      <div className="mb-6">
        <button
          onClick={() => setShowGeneratePanel((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--apple-purple)]/10 to-[var(--apple-blue)]/10 border border-[var(--apple-purple)]/20 rounded-[14px] hover:from-[var(--apple-purple)]/15 hover:to-[var(--apple-blue)]/15 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[var(--apple-purple)]/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[var(--apple-purple)]" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-foreground">Generate a New Scenario</p>
              <p className="text-[11px] text-[var(--apple-label-secondary)]">AI creates a unique PBQ scenario on any topic</p>
            </div>
          </div>
          <ChevronRight className={cn('w-4 h-4 text-[var(--apple-label-tertiary)] transition-transform', showGeneratePanel && 'rotate-90')} />
        </button>

        {showGeneratePanel && (
          <div className="mt-2 p-4 bg-card border border-[var(--apple-separator)] rounded-[14px]">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-2">Category</p>
                <div className="flex flex-col gap-1">
                  {(['networking', 'security', 'os', 'hardware', 'mobile'] as PBQCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGeneratingCategory(cat)}
                      className={cn(
                        'text-left px-2.5 py-1.5 rounded-[8px] text-[12px] font-medium capitalize transition-colors',
                        generatingCategory === cat
                          ? 'bg-[var(--apple-purple)]/15 text-[var(--apple-purple)]'
                          : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)]'
                      )}
                    >
                      {cat === 'os' ? 'OS' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-2">Difficulty</p>
                <div className="flex flex-col gap-1">
                  {([1, 2, 3] as const).map((d) => {
                    const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' }
                    const colors = { 1: 'var(--apple-green)', 2: 'var(--apple-orange)', 3: 'var(--apple-red)' }
                    return (
                      <button
                        key={d}
                        onClick={() => setGeneratingDifficulty(d)}
                        className={cn(
                          'text-left px-2.5 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors',
                          generatingDifficulty === d
                            ? 'bg-[var(--apple-fill)]'
                            : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)]'
                        )}
                        style={generatingDifficulty === d ? { color: colors[d] } : undefined}
                      >
                        {labels[d]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {generateError && (
              <p className="text-[12px] text-[var(--apple-red)] mb-3">{generateError}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all',
                isGenerating
                  ? 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] cursor-wait'
                  : 'bg-[var(--apple-purple)] text-white hover:opacity-90'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating scenario…
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Generate &amp; Start
                </>
              )}
            </button>
            {isGenerating && (
              <p className="text-[10px] text-center text-[var(--apple-label-tertiary)] mt-2">
                Claude is writing your scenario — usually takes 15-30 seconds
              </p>
            )}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? totalScenarios : PBQ_SCENARIOS.filter((s) => s.category === cat.id).length
          const isActive = activeFilter === cat.id
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150',
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] hover:text-foreground'
              )}
              style={isActive ? { backgroundColor: cat.color } : undefined}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--apple-separator)] text-[var(--apple-label-tertiary)]'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scenario cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((scenario) => {
          const meta = CATEGORY_META[scenario.category]
          return (
            <Link
              key={scenario.id}
              href={`/labs/${scenario.id}`}
              className="group flex gap-4 bg-card rounded-[16px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm"
            >
              {/* Category icon */}
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: meta.bg }}
              >
                <Terminal className="w-5 h-5" style={{ color: meta.color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-[var(--apple-label-tertiary)] font-medium bg-[var(--apple-fill)] px-2 py-0.5 rounded-full">
                      {scenario.examCode}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <p className="text-[14px] font-semibold text-foreground mb-1 leading-snug">{scenario.title}</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)] mb-2.5 leading-relaxed">{scenario.summary}</p>

                <div className="flex items-center gap-4">
                  <DifficultyDots level={scenario.difficulty} />
                  <div className="flex items-center gap-1 text-[11px] text-[var(--apple-label-tertiary)]">
                    <Clock className="w-3 h-3" />
                    {scenario.estimatedMinutes} min
                  </div>
                  <div className="text-[11px] text-[var(--apple-label-tertiary)]">
                    {scenario.steps.length} steps
                  </div>
                  {scenario.objectives.length > 0 && (
                    <div className="text-[10px] text-[var(--apple-label-tertiary)] font-mono">
                      Obj {scenario.objectives.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[14px] text-[var(--apple-label-secondary)]">No labs in this category yet.</p>
        </div>
      )}
    </div>
  )
}
