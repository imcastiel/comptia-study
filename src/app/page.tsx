import Link from 'next/link'
import { BookOpen, Layers, Trophy, ChevronRight } from 'lucide-react'

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

interface ExamCardProps {
  code: string
  name: string
  domains: typeof CORE1_DOMAINS
  passingScore: number
  href: string
  delay: number
}

function ExamCard({ code, name, domains, passingScore, href, delay }: ExamCardProps) {
  return (
    <Link
      href={href}
      className="block bg-card rounded-[20px] p-6 card-lift shadow-sm border border-[var(--apple-separator)] animate-fade-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[12px] font-semibold text-[var(--apple-blue)] tracking-wide uppercase mb-1">
            {code}
          </p>
          <h2 className="text-[22px] font-bold tracking-tight text-foreground">{name}</h2>
        </div>
        <div className="flex items-center gap-1 bg-[var(--apple-fill)] rounded-full px-3 py-1.5">
          <Trophy className="w-3.5 h-3.5 text-[var(--apple-orange)]" />
          <span className="text-[12px] font-semibold text-[var(--apple-label-secondary)]">
            Pass: {passingScore}
          </span>
        </div>
      </div>

      {/* Domain weight bars */}
      <div className="space-y-2.5 mb-5">
        {domains.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <div className="w-full bg-[var(--apple-fill)] rounded-full h-[5px] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${d.weight}%`,
                  backgroundColor: d.color,
                }}
              />
            </div>
            <div className="flex items-center justify-between min-w-0 gap-2" style={{ width: '200px' }}>
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
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
  delay,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  color: string
  delay: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-card rounded-[16px] p-4 card-lift shadow-sm border border-[var(--apple-separator)] animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-foreground">{title}</p>
        <p className="text-[12px] text-[var(--apple-label-secondary)] truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0 ml-auto" />
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-[32px] font-bold tracking-tight text-foreground mb-1">
          Good morning 👋
        </h1>
        <p className="text-[16px] text-[var(--apple-label-secondary)]">
          Ready to study for your CompTIA A+ certification?
        </p>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
          Quick Start
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <QuickActionCard
            icon={BookOpen}
            title="Study Content"
            description="Read and learn concepts"
            href="/study"
            color="var(--apple-blue)"
            delay={100}
          />
          <QuickActionCard
            icon={Layers}
            title="Flashcards"
            description="0 cards due today"
            href="/flashcards"
            color="var(--apple-green)"
            delay={150}
          />
          <QuickActionCard
            icon={Trophy}
            title="Practice Exam"
            description="Timed simulation"
            href="/practice"
            color="var(--apple-orange)"
            delay={200}
          />
        </div>
      </section>

      {/* Exam Cards */}
      <section>
        <h2 className="text-[13px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide mb-3 animate-fade-up" style={{ animationDelay: '250ms' }}>
          Exams
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExamCard
            code="220-1201"
            name="Core 1"
            domains={CORE1_DOMAINS}
            passingScore={675}
            href="/study/core1"
            delay={300}
          />
          <ExamCard
            code="220-1202"
            name="Core 2"
            domains={CORE2_DOMAINS}
            passingScore={700}
            href="/study/core2"
            delay={350}
          />
        </div>
      </section>

      {/* Exam details footer */}
      <p className="mt-8 text-center text-[12px] text-[var(--apple-label-tertiary)] animate-fade-in" style={{ animationDelay: '500ms' }}>
        90 questions · 90 minutes · Passing: 675/700 (scale of 900)
      </p>
    </div>
  )
}
