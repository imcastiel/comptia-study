'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Send, RotateCcw, Minimize2, Layers, Terminal, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface TutorContext {
  dueCount: number
  domainId: string | null
  topicTitle: string | null    // title of the currently-viewed topic (topic page only)
  examCode: string | null      // e.g. "220-1201" (topic page only)
  domainName: string | null    // e.g. "Hardware" (topic page only)
  lastTopicSlug: string | null
  lastTopicTitle: string | null
  lastTopicPath: string | null
  weakDomain: string | null
}

const TOPIC_PROMPTS: Record<string, string[]> = {
  dhcp:        ['What ports does DHCP use?', 'Explain the DORA process', 'What is APIPA and when does it trigger?'],
  dns:         ['What ports does DNS use?', 'Difference between A and AAAA records?', 'How does DNS caching affect troubleshooting?'],
  raid:        ['What RAID level gives the most redundancy?', 'RAID 5 vs RAID 6 — when do you pick each?', 'How much usable capacity does RAID 5 give with 4 drives?'],
  motherboard: ['What CPU socket types does the exam test?', 'Explain PCIe lanes and bandwidth', "What's the difference between BIOS and UEFI?"],
  cpu:         ['What CPU socket types does the exam test?', 'Explain thermal paste application', 'What is overclocking and why does it matter?'],
  subnet:      ['Walk me through subnetting a /26 network', 'What is CIDR notation?', 'How do I find the broadcast address of a subnet?'],
  network:     ["What's the difference between a hub and a switch?", 'Explain VLANs in plain terms', 'What ports does SSH use?'],
  malware:     ['Walk me through the malware removal steps in order', 'What is ransomware and how does it spread?', 'Difference between a virus and a worm?'],
  security:    ['WPA2 vs WPA3 — what changed?', 'What is a zero-day vulnerability?', 'Explain the principle of least privilege'],
}
const FALLBACK_PROMPTS = ['What topics are on the Core 1 exam?', 'What should I study first?']

const DOMAIN_PROMPTS: Record<string, string> = {
  'Networking':        'Walk me through subnetting basics',
  'Hardware':          'What CPU socket types does the exam cover?',
  'Security':          'Walk me through the malware removal steps in order',
  'Operating Systems': "What's the difference between Windows Home and Pro?",
  'Mobile Devices':    'What connector types do mobile devices use?',
}
const FALLBACK_WEAK_PROMPT = 'What are the hardest topics on CompTIA A+?'

function getTopicPrompts(slug: string): string[] {
  for (const [key, prompts] of Object.entries(TOPIC_PROMPTS)) {
    if (slug.includes(key)) return prompts
  }
  return FALLBACK_PROMPTS
}

interface TopicPageParams {
  examId: string
  domainSlug: string
  topicSlug: string
}

function parseTopicPage(pathname: string | null): TopicPageParams | null {
  if (!pathname) return null
  const match = pathname.match(/^\/study\/([^/]+)\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { examId: match[1], domainSlug: match[2], topicSlug: match[3] }
}

interface InitialStateProps {
  topicPage: TopicPageParams
  context: TutorContext
  onSend: (text: string) => void
  onNavigate: () => void
}

function TopicPageInitialState({ topicPage, context, onSend, onNavigate }: InitialStateProps) {
  const prompts = getTopicPrompts(topicPage.topicSlug)
  const flashcardsHref = context.domainId
    ? `/flashcards/session?domainId=${context.domainId}`
    : '/flashcards'
  // Use DB-resolved title for Quiz me message; fall back to slug-derived label
  const quizLabel = context.topicTitle
    ?? topicPage.topicSlug.replace(/-/g, ' ').replace(/^\d+-\d+\s/, '')

  return (
    <div className="flex flex-col gap-3 px-1 py-2">
      {/* Topic badge — hidden if context not resolved */}
      {context.topicTitle && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[var(--apple-purple)]/10 border border-[var(--apple-purple)]/20">
          <span className="text-[10px] text-[var(--apple-label-tertiary)] uppercase tracking-wide">Currently studying</span>
          <span className="text-[11px] font-semibold text-[var(--apple-purple)] truncate">
            {context.topicTitle}
            {context.examCode && <span className="font-normal text-[var(--apple-label-tertiary)]"> · {context.examCode}</span>}
            {context.domainName && <span className="font-normal text-[var(--apple-label-tertiary)]"> · {context.domainName}</span>}
          </span>
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-2">
        <Link
          href={flashcardsHref}
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[var(--apple-blue)]/15 text-[var(--apple-blue)] border border-[var(--apple-blue)]/25 hover:bg-[var(--apple-blue)]/25 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          Flashcards
        </Link>
        <Link
          href="/labs"
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[var(--apple-purple)]/15 text-[var(--apple-purple)] border border-[var(--apple-purple)]/25 hover:bg-[var(--apple-purple)]/25 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          Lab
        </Link>
        <button
          onClick={() => onSend(`Quiz me on ${quizLabel}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[var(--apple-green)]/15 text-[var(--apple-green)] border border-[var(--apple-green)]/30 hover:bg-[var(--apple-green)]/25 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Quiz me
        </button>
      </div>

      {/* Due cards pill */}
      {context.dueCount > 0 && (
        <Link
          href="/flashcards/session?mode=due"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[var(--apple-orange)]/10 border border-[var(--apple-orange)]/25 hover:bg-[var(--apple-orange)]/15 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--apple-orange)] shrink-0" />
          <span className="text-[12px] font-medium text-[var(--apple-orange)]">
            {context.dueCount} card{context.dueCount !== 1 ? 's' : ''} due
          </span>
          <span className="ml-auto text-[11px] text-[var(--apple-orange)]/60">Review now →</span>
        </Link>
      )}

      {/* Chat prompts */}
      <div>
        <p className="text-[10px] text-[var(--apple-label-tertiary)] uppercase tracking-wide mb-1.5 px-1">Or ask me anything</p>
        <div className="flex flex-col gap-1">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              className="w-full text-left text-[11px] px-3 py-2 rounded-[10px] bg-[var(--apple-fill)] hover:bg-[var(--apple-blue)]/10 hover:text-[var(--apple-blue)] transition-colors text-[var(--apple-label-secondary)]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AiTutor() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [context, setContext] = useState<TutorContext>({
    dueCount: 0, domainId: null, topicTitle: null, examCode: null, domainName: null,
    lastTopicSlug: null, lastTopicTitle: null, lastTopicPath: null, weakDomain: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    const topicPage = parseTopicPage(pathname)
    const params = new URLSearchParams()
    if (topicPage) {
      params.set('topicSlug', topicPage.topicSlug)
      params.set('domainSlug', topicPage.domainSlug)
    }
    fetch(`/api/ai/context?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: TutorContext) => setContext(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') {
          // silently fail — UI degrades to empty state
        }
      })
    return () => controller.abort()
  }, [pathname])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMessage: Message = { role: 'assistant', content: '', streaming: true }
    setMessages([...newMessages, assistantMessage])

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          topicSlug: parseTopicPage(pathname)?.topicSlug,
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages([...newMessages, { role: 'assistant', content: accumulated, streaming: true }])
      }

      setMessages([...newMessages, { role: 'assistant', content: accumulated, streaming: false }])
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        streaming: false,
      }])
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, pathname])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setMessages((prev) => prev.map((m, i) =>
      i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m
    ))
  }

  const handleClear = () => {
    setMessages([])
    setInput('')
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg',
            'flex items-center justify-center transition-all duration-200',
            'bg-[var(--apple-purple)] hover:scale-105 active:scale-95'
          )}
          aria-label="Open AI Tutor"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-50',
            'w-[380px] max-w-[calc(100vw-2rem)]',
            'bg-card border border-[var(--apple-separator)] rounded-[20px] shadow-2xl',
            'flex flex-col overflow-hidden',
            'transition-all duration-300'
          )}
          style={{ height: 'min(560px, calc(100vh - 100px))' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)] shrink-0">
            <div className="w-7 h-7 rounded-full bg-[var(--apple-purple)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">AI Tutor</p>
              <p className="text-[10px] text-[var(--apple-label-tertiary)]">CompTIA A+ Expert</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-separator)] transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-separator)] transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-separator)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.length === 0 ? (
              (() => {
                const topicPage = parseTopicPage(pathname)
                if (topicPage) {
                  return <TopicPageInitialState
                    topicPage={topicPage}
                    context={context}
                    onSend={sendMessage}
                    onNavigate={() => setOpen(false)}
                  />
                }
                return <div className="px-3 py-6 text-center text-[11px] text-[var(--apple-label-tertiary)]">Loading…</div>
              })()
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[var(--apple-blue)] text-white rounded-br-[4px]'
                        : 'bg-[var(--apple-fill)] text-foreground rounded-bl-[4px]'
                    )}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : msg.content ? (
                      <div className="prose-tutor">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            li: ({ children }) => <li className="leading-snug">{children}</li>,
                            code: ({ children }) => <code className="bg-[var(--apple-separator)] text-[var(--apple-red)] px-1 py-0.5 rounded text-[12px] font-mono">{children}</code>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                        {msg.streaming && (
                          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
                        )}
                      </div>
                    ) : msg.streaming ? (
                      <span className="inline-flex gap-0.5 items-center">
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 py-2.5 border-t border-[var(--apple-separator)] shrink-0">
            <div className="flex items-end gap-2 bg-[var(--apple-fill)] rounded-[14px] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any CompTIA A+ topic…"
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder-[var(--apple-label-tertiary)] resize-none outline-none leading-relaxed max-h-[80px] overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
              />
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="w-7 h-7 rounded-full bg-[var(--apple-red)] flex items-center justify-center shrink-0 mb-0.5"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-colors',
                    input.trim()
                      ? 'bg-[var(--apple-blue)] text-white'
                      : 'bg-[var(--apple-separator)] text-[var(--apple-label-tertiary)]'
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[9px] text-[var(--apple-label-tertiary)] text-center mt-1.5">
              Powered by Claude · Enter to send, Shift+Enter for newline
            </p>
          </div>
        </div>
      )}
    </>
  )
}
