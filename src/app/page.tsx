export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { BookOpen, Layers, Trophy, ChevronRight, Target, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { db } from '@/db'
import { examAttempts, questionAttempts, questions as questionsTable, topics, domains, flashcardReviews, studyProgress } from '@/db/schema'
import { eq, lte, desc, sql, count } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import { ActivityHeatmap } from '@/components/home/activity-heatmap'

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getDashboardData() {
  const now = new Date().toISOString()

  const [
    [{ dueCount }],
    [{ topicsStudied }],
    [{ totalTopics }],
    [{ testsCompleted }],
    [{ avgScore }],
    recentAttempts,
    domainPerf,
  ] = await Promise.all([
    // Cards due for review right now
    db.select({ dueCount: count() })
      .from(flashcardReviews)
      .where(lte(flashcardReviews.nextReviewAt, now)),

    // Topics explicitly marked as completed
    db.select({ topicsStudied: count() })
      .from(studyProgress)
      .where(eq(studyProgress.status, 'completed')),

    // Total topics across all exams
    db.select({ totalTopics: count() }).from(topics),

    // Completed practice tests
    db.select({ testsCompleted: count() })
      .from(examAttempts)
      .where(eq(examAttempts.isCompleted, true)),

    // Average score across all completed tests
    db.select({ avgScore: sql<number | null>`avg(${examAttempts.scorePercent})` })
      .from(examAttempts)
      .where(eq(examAttempts.isCompleted, true)),

    // Last 5 completed attempts
    db.select({
      id: examAttempts.id,
      scorePercent: examAttempts.scorePercent,
      correctCount: examAttempts.correctCount,
      totalQuestions: examAttempts.totalQuestions,
      startedAt: examAttempts.startedAt,
      timeSpentSeconds: examAttempts.timeSpentSeconds,
    })
      .from(examAttempts)
      .where(eq(examAttempts.isCompleted, true))
      .orderBy(desc(examAttempts.startedAt))
      .limit(5),

    // Per-domain correctness from all question attempts
    db.select({
      domainName: domains.name,
      domainNumber: domains.number,
      correct: sql<number>`sum(case when ${questionAttempts.isCorrect} = 1 then 1 else 0 end)`,
      total: count(),
    })
      .from(questionAttempts)
      .innerJoin(questionsTable, eq(questionAttempts.questionId, questionsTable.id))
      .innerJoin(topics, eq(questionsTable.topicId, topics.id))
      .innerJoin(domains, eq(topics.domainId, domains.id))
      .groupBy(domains.id)
      .orderBy(domains.number),
  ])

  return {
    dueCount,
    topicsStudied,
    totalTopics,
    testsCompleted,
    avgScore: avgScore ?? null,
    recentAttempts,
    domainPerf,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(seconds: number | null): string {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DOMAIN_COLORS: Record<string, string> = {
  'Mobile Devices': 'var(--apple-teal)',
  'Networking': 'var(--apple-blue)',
  'Hardware': 'var(--apple-indigo)',
  'Virtualization and Cloud Computing': 'var(--apple-purple)',
  'Hardware and Network Troubleshooting': 'var(--apple-orange)',
  'Operating Systems': 'var(--apple-blue)',
  'Security': 'var(--apple-red)',
  'Software Troubleshooting': 'var(--apple-orange)',
  'Operational Procedures': 'var(--apple-green)',
}

// ─── Components ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[12px] font-medium text-[var(--apple-label-secondary)]">{label}</p>
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <p className="text-[26px] font-bold tracking-tight text-foreground leading-none mb-1">{value}</p>
      {sub && <p className="text-[11px] text-[var(--apple-label-tertiary)]">{sub}</p>}
    </div>
  )
}

const CORE1_DOMAINS = [
  { name: 'Mobile Devices', weight: 13, color: 'var(--apple-teal)' },
  { name: 'Networking', weight: 23, color: 'var(--apple-blue)' },
  { name: 'Hardware', weight: 25, color: 'var(--apple-indigo)' },
  { name: 'Virtualization & Cloud', weight: 11, color: 'var(--apple-purple)' },
  { name: 'HW & Network Troubleshooting', weight: 28, color: 'var(--apple-orange)' },
]

const CORE2_DOMAINS = [
  { name: 'Operating Systems', weight: 28, color: 'var(--apple-blue)' },
  { name: 'Security', weight: 28, color: 'var(--apple-red)' },
  { name: 'Software Troubleshooting', weight: 23, color: 'var(--apple-orange)' },
  { name: 'Operational Procedures', weight: 21, color: 'var(--apple-green)' },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const {
    dueCount,
    topicsStudied,
    totalTopics,
    testsCompleted,
    avgScore,
    recentAttempts,
    domainPerf,
  } = await getDashboardData()

  const greeting = getGreeting()
  const today = formatDate()
  const avgScoreDisplay = avgScore !== null ? `${Math.round(avgScore)}%` : '--'
  const hasActivity = testsCompleted > 0 || topicsStudied > 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="animate-fade-up">
        <p className="text-[13px] text-[var(--apple-label-tertiary)] mb-1">{today}</p>
        <h1 className="text-[30px] font-bold tracking-tight text-foreground">
          {greeting}
        </h1>
        <p className="text-[15px] text-[var(--apple-label-secondary)] mt-1">
          {hasActivity
            ? `${topicsStudied} of ${totalTopics} topics studied · ${dueCount} flashcard${dueCount !== 1 ? 's' : ''} due`
            : "Ready to start your CompTIA A+ prep?"}
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <StatCard
          label="Topics Studied"
          value={`${topicsStudied}`}
          sub={`of ${totalTopics} total`}
          icon={BookOpen}
          color="var(--apple-blue)"
        />
        <StatCard
          label="Cards Due Today"
          value={`${dueCount}`}
          sub={dueCount === 0 ? 'All caught up!' : 'needs review'}
          icon={Layers}
          color={dueCount > 0 ? 'var(--apple-orange)' : 'var(--apple-green)'}
        />
        <StatCard
          label="Practice Tests"
          value={`${testsCompleted}`}
          sub={testsCompleted > 0 ? 'completed' : 'none yet'}
          icon={Target}
          color="var(--apple-purple)"
        />
        <StatCard
          label="Avg Score"
          value={avgScoreDisplay}
          sub={avgScore !== null ? (avgScore >= 75 ? 'passing range' : 'needs improvement') : 'no tests yet'}
          icon={TrendingUp}
          color={avgScore !== null ? (avgScore >= 75 ? 'var(--apple-green)' : 'var(--apple-red)') : 'var(--apple-label-tertiary)'}
        />
      </div>

      {/* ── Quick Start ── */}
      <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-3">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              icon: BookOpen,
              title: 'Study Content',
              description: `${totalTopics} topics across 2 exams`,
              href: '/study',
              color: 'var(--apple-blue)',
            },
            {
              icon: Layers,
              title: 'Flashcards',
              description: dueCount > 0 ? `${dueCount} card${dueCount !== 1 ? 's' : ''} due for review` : 'All cards reviewed',
              href: '/flashcards',
              color: dueCount > 0 ? 'var(--apple-orange)' : 'var(--apple-green)',
            },
            {
              icon: Trophy,
              title: 'Practice Exam',
              description: 'Timed simulation · 90 min',
              href: '/practice',
              color: 'var(--apple-orange)',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3.5 bg-card rounded-[14px] p-3.5 card-lift shadow-sm border border-[var(--apple-separator)]"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <item.icon className="w-4.5 h-4.5" style={{ color: item.color, width: '18px', height: '18px' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">{item.title}</p>
                <p className="text-[11px] text-[var(--apple-label-secondary)] truncate">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Study Activity Heatmap ── */}
      <section className="animate-fade-up" style={{ animationDelay: '125ms' }}>
        <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-3">
          Study Activity
        </h2>
        <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] shadow-sm p-4">
          <ActivityHeatmap />
        </div>
      </section>

      {/* ── Two-column: Recent Tests + Domain Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Tests */}
        <section className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider">
              Recent Practice Tests
            </h2>
            {recentAttempts.length > 0 && (
              <Link href="/practice" className="text-[12px] text-[var(--apple-blue)] font-medium">
                New Test
              </Link>
            )}
          </div>

          <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] shadow-sm overflow-hidden">
            {recentAttempts.length === 0 ? (
              <div className="p-8 text-center">
                <Target className="w-8 h-8 text-[var(--apple-label-tertiary)] mx-auto mb-2" />
                <p className="text-[13px] font-medium text-foreground mb-1">No tests yet</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)] mb-4">
                  Take a practice exam to see your scores here.
                </p>
                <Link
                  href="/practice"
                  className="text-[12px] text-[var(--apple-blue)] font-semibold"
                >
                  Start a practice test →
                </Link>
              </div>
            ) : (
              recentAttempts.map((attempt, i) => {
                const score = attempt.scorePercent ?? 0
                const passed = score >= 75
                const scaledScore = Math.round((score / 100) * 900)
                return (
                  <Link
                    key={attempt.id}
                    href={`/practice/review/${attempt.id}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-[var(--apple-fill)] transition-colors',
                      i < recentAttempts.length - 1 && 'border-b border-[var(--apple-separator)]'
                    )}
                  >
                    {/* Score ring */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                      style={{
                        background: passed
                          ? 'var(--apple-green)/12'
                          : 'var(--apple-red)/12',
                        color: passed ? 'var(--apple-green)' : 'var(--apple-red)',
                        backgroundColor: passed ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)',
                      }}
                    >
                      {Math.round(score)}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-foreground">
                          {scaledScore} / 900
                        </p>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: passed ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)',
                            color: passed ? 'var(--apple-green)' : 'var(--apple-red)',
                          }}
                        >
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--apple-label-secondary)]">
                        {attempt.correctCount}/{attempt.totalQuestions} correct · {formatRelativeDate(attempt.startedAt)}
                        {attempt.timeSpentSeconds ? ` · ${formatTime(attempt.timeSpentSeconds)}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--apple-label-tertiary)] shrink-0" />
                  </Link>
                )
              })
            )}
          </div>
        </section>

        {/* Domain Performance */}
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider">
              Domain Performance
            </h2>
          </div>

          <div className="bg-card rounded-[16px] border border-[var(--apple-separator)] shadow-sm overflow-hidden">
            {domainPerf.length === 0 ? (
              <div className="p-8 text-center">
                <TrendingUp className="w-8 h-8 text-[var(--apple-label-tertiary)] mx-auto mb-2" />
                <p className="text-[13px] font-medium text-foreground mb-1">No data yet</p>
                <p className="text-[12px] text-[var(--apple-label-secondary)]">
                  Practice test results will show your strengths and weak areas.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3.5">
                {domainPerf.map((d) => {
                  const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
                  const color = DOMAIN_COLORS[d.domainName] ?? 'var(--apple-blue)'
                  const isWeak = pct < 70 && d.total > 0
                  return (
                    <div key={d.domainName}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-medium text-foreground truncate pr-3 max-w-[70%]">
                          {d.domainName}
                          {isWeak && (
                            <span className="ml-1.5 text-[10px] font-semibold text-[var(--apple-orange)]">
                              needs work
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] font-semibold shrink-0" style={{ color }}>
                          {pct}%
                          <span className="text-[10px] font-normal text-[var(--apple-label-tertiary)] ml-1">
                            ({d.correct}/{d.total})
                          </span>
                        </p>
                      </div>
                      <div className="w-full bg-[var(--apple-fill)] rounded-full h-[5px] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Exam Cards ── */}
      <section className="animate-fade-up" style={{ animationDelay: '250ms' }}>
        <h2 className="text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wider mb-3">
          Exams
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { code: '220-1201', name: 'Core 1', examDomains: CORE1_DOMAINS, passing: 675, href: '/study/core1' },
            { code: '220-1202', name: 'Core 2', examDomains: CORE2_DOMAINS, passing: 700, href: '/study/core2' },
          ].map((exam) => (
            <Link
              key={exam.code}
              href={exam.href}
              className="block bg-card rounded-[20px] p-6 card-lift shadow-sm border border-[var(--apple-separator)] group"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--apple-blue)] tracking-wider uppercase mb-1">
                    {exam.code}
                  </p>
                  <h2 className="text-[22px] font-bold tracking-tight text-foreground">{exam.name}</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--apple-fill)] rounded-full px-3 py-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[var(--apple-orange)]" />
                  <span className="text-[12px] font-semibold text-[var(--apple-label-secondary)]">
                    Pass: {exam.passing}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                {exam.examDomains.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="flex-1 bg-[var(--apple-fill)] rounded-full h-[5px] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.weight}%`, backgroundColor: d.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 w-[190px] shrink-0">
                      <span className="text-[11px] text-[var(--apple-label-secondary)] truncate">{d.name}</span>
                      <span className="text-[11px] font-semibold shrink-0" style={{ color: d.color }}>{d.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--apple-blue)] group-hover:gap-3 transition-all duration-200">
                <BookOpen className="w-4 h-4" />
                Start Studying
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-[12px] text-[var(--apple-label-tertiary)]">
        90 questions · 90 minutes · Score scale 100–900 · Passing: 675 (Core 1) / 700 (Core 2)
      </p>
    </div>
  )
}
