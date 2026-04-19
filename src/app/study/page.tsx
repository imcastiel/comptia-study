import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'

export default function StudyIndexPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-2">Study</h1>
      <p className="text-[var(--apple-label-secondary)] mb-8">Choose an exam to start studying.</p>
      <div className="flex flex-col gap-3">
        {[
          { code: 'core1', label: '220-1201 Core 1', desc: 'Hardware, Networking, Mobile Devices, Cloud' },
          { code: 'core2', label: '220-1202 Core 2', desc: 'OS, Security, Troubleshooting, Procedures' },
        ].map((exam) => (
          <Link
            key={exam.code}
            href={`/study/${exam.code}`}
            className="flex items-center gap-4 bg-card rounded-[16px] p-4 border border-[var(--apple-separator)] card-lift shadow-sm"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[var(--apple-blue)]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[var(--apple-blue)]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">{exam.label}</p>
              <p className="text-[12px] text-[var(--apple-label-secondary)]">{exam.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--apple-label-tertiary)]" />
          </Link>
        ))}
      </div>
    </div>
  )
}
