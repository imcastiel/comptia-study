'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, CornerDownLeft } from 'lucide-react'
import { type PBQStepTerminal, type TerminalCommand } from '@/data/pbq-scenarios'
import { cn } from '@/lib/utils'

interface Props {
  step: PBQStepTerminal
  onComplete: (isCorrect: boolean, detail: string) => void
}

interface HistoryEntry {
  input: string
  output: string
  matched: TerminalCommand | null
}

const PROMPT = 'C:\\Users\\user> '

function matchCommand(input: string, commands: TerminalCommand[]): TerminalCommand | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ')
  for (const cmd of commands) {
    const candidates = [cmd.command, ...(cmd.aliases ?? [])]
    if (candidates.some((c) => c.toLowerCase().replace(/\s+/g, ' ') === normalized)) {
      return cmd
    }
  }
  return null
}

export function TerminalStep({ step, onComplete }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pendingCommand, setPendingCommand] = useState<TerminalCommand | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleRun = useCallback(() => {
    const raw = inputValue.trim()
    if (!raw) return

    const matched = matchCommand(raw, step.commands)
    const output = matched
      ? matched.output
      : step.defaultOutput.replace('{{cmd}}', raw.split(' ')[0])

    setHistory((prev) => [...prev, { input: raw, output, matched }])
    setInputValue('')

    if (matched) {
      setPendingCommand(matched)
    }
  }, [inputValue, step.commands, step.defaultOutput])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRun()
  }, [handleRun])

  const handleSubmit = useCallback(() => {
    if (!pendingCommand) return
    setSubmitted(true)
    onComplete(pendingCommand.isCorrect, `Ran: ${pendingCommand.command}`)
  }, [pendingCommand, onComplete])

  return (
    <div>
      {/* Terminal window */}
      <div className="mb-4 rounded-[14px] overflow-hidden border border-[var(--apple-separator)] bg-[#1a1a1a]">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#2a2a2a] border-b border-[#333]">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[11px] text-[#888] font-mono">Command Prompt</span>
        </div>

        {/* Output area */}
        <div
          className="p-4 font-mono text-[12px] text-[#e5e5e5] leading-relaxed max-h-72 overflow-y-auto cursor-text"
          onClick={() => !submitted && inputRef.current?.focus()}
        >
          {/* Initial tool output / context */}
          {step.toolOutput && (
            <pre className="whitespace-pre-wrap mb-3 text-[#aaa]">{step.toolOutput.content}</pre>
          )}

          {/* Command history */}
          {history.map((entry, i) => (
            <div key={i} className="mb-2">
              <div className="text-[#e5e5e5]">
                <span className="text-[#4ec9b0]">{PROMPT}</span>
                <span>{entry.input}</span>
              </div>
              {entry.output && (
                <pre className="whitespace-pre-wrap text-[#ccc] mt-1">{entry.output}</pre>
              )}
            </div>
          ))}

          {/* Current input line */}
          {!submitted && (
            <div className="flex items-center">
              <span className="text-[#4ec9b0] shrink-0">{PROMPT}</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-1 bg-transparent outline-none text-[#e5e5e5] font-mono text-[12px] caret-[#e5e5e5]"
                placeholder=""
                aria-label="Command input"
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Run button (mobile / keyboard fallback) */}
      {!submitted && (
        <button
          onClick={handleRun}
          disabled={!inputValue.trim()}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold mb-3 transition-opacity',
            inputValue.trim()
              ? 'bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#333]'
              : 'bg-[var(--apple-fill)] text-[var(--apple-label-tertiary)] opacity-50 cursor-default',
          )}
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          Run command
        </button>
      )}

      {/* Submit panel — appears after a recognized command is typed */}
      {pendingCommand && !submitted && (
        <div className="mb-4 p-3.5 rounded-[12px] border border-[var(--apple-blue)]/30 bg-[var(--apple-blue)]/5">
          <p className="text-[11px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-1">
            Submit this as your answer?
          </p>
          <p className="text-[13px] font-mono text-[var(--apple-blue)] mb-3">{pendingCommand.command}</p>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 rounded-[10px] bg-[var(--apple-blue)] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Answer
            </button>
            <button
              onClick={() => setPendingCommand(null)}
              className="px-4 py-2 rounded-[10px] bg-[var(--apple-fill)] text-[var(--apple-label-secondary)] text-[13px] font-medium hover:text-foreground"
            >
              Keep exploring
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {submitted && pendingCommand && (
        <div
          className="mb-5 rounded-[12px] p-4 border"
          style={{
            borderColor: pendingCommand.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)',
            backgroundColor: pendingCommand.isCorrect ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {pendingCommand.isCorrect
              ? <CheckCircle2 className="w-4 h-4 text-[var(--apple-green)]" />
              : <XCircle className="w-4 h-4 text-[var(--apple-red)]" />
            }
            <p
              className="text-[12px] font-semibold"
              style={{ color: pendingCommand.isCorrect ? 'var(--apple-green)' : 'var(--apple-red)' }}
            >
              {pendingCommand.isCorrect ? 'Correct command!' : 'Not the best choice'}
            </p>
          </div>
          <p className="text-[13px] text-foreground leading-relaxed">{pendingCommand.feedback}</p>
        </div>
      )}

      {step.hint && !submitted && history.length === 0 && (
        <p className="text-[12px] text-[var(--apple-label-tertiary)] italic text-center">
          Hint: {step.hint}
        </p>
      )}
    </div>
  )
}
