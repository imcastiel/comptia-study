import { CoverageView } from '@/components/admin/coverage-view'

export default function CoveragePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-1">Coverage</h1>
      <p className="text-[14px] text-[var(--apple-label-secondary)] mb-6">
        Questions and flashcards by domain and topic. Bars compare published questions to each domain&apos;s exam weight; red dots mark topics with nothing published.
      </p>
      <CoverageView />
    </div>
  )
}
