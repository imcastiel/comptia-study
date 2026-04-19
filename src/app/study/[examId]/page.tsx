import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'

const EXAM_DATA = {
  core1: {
    code: '220-1201',
    name: 'Core 1',
    passingScore: 675,
    domains: [
      { slug: 'mobile-devices', number: 1, name: 'Mobile Devices', weight: 13, topics: 3 },
      { slug: 'networking', number: 2, name: 'Networking', weight: 23, topics: 8 },
      { slug: 'hardware', number: 3, name: 'Hardware', weight: 25, topics: 8 },
      { slug: 'virtualization-cloud', number: 4, name: 'Virtualization & Cloud', weight: 11, topics: 2 },
      { slug: 'hw-network-troubleshooting', number: 5, name: 'HW & Network Troubleshooting', weight: 28, topics: 6 },
    ],
  },
  core2: {
    code: '220-1202',
    name: 'Core 2',
    passingScore: 700,
    domains: [
      { slug: 'operating-systems', number: 1, name: 'Operating Systems', weight: 28, topics: 11 },
      { slug: 'security', number: 2, name: 'Security', weight: 28, topics: 11 },
      { slug: 'software-troubleshooting', number: 3, name: 'Software Troubleshooting', weight: 23, topics: 4 },
      { slug: 'operational-procedures', number: 4, name: 'Operational Procedures', weight: 21, topics: 10 },
    ],
  },
}

interface Params { examId: string }

export function generateStaticParams() {
  return [{ examId: 'core1' }, { examId: 'core2' }]
}

export default async function ExamPage({ params }: { params: Promise<Params> }) {
  const { examId } = await params
  const exam = EXAM_DATA[examId as keyof typeof EXAM_DATA]
  if (!exam) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[var(--apple-blue)] uppercase tracking-wide mb-1">{exam.code}</p>
        <h1 className="text-[28px] font-bold tracking-tight">CompTIA A+ {exam.name}</h1>
        <p className="text-[var(--apple-label-secondary)] mt-1">Passing score: {exam.passingScore} · 90 questions · 90 minutes</p>
      </div>

      <div className="flex flex-col gap-3">
        {exam.domains.map((domain) => (
          <Link
            key={domain.slug}
            href={`/study/${examId}/${domain.slug}`}
            className="flex items-center gap-4 bg-card rounded-[16px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm group"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[var(--apple-blue)]/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[var(--apple-blue)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[14px] font-semibold truncate">
                  {domain.number}. {domain.name}
                </p>
                <span className="text-[11px] font-semibold text-[var(--apple-orange)] shrink-0">
                  {domain.weight}%
                </span>
              </div>
              <p className="text-[12px] text-[var(--apple-label-secondary)]">{domain.topics} objectives</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
