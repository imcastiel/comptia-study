import { HealthView } from '@/components/admin/health-view'

export const metadata = { title: 'Content Health · Admin' }

export default function HealthPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-1">Content Health</h1>
      <p className="text-[14px] text-[var(--apple-label-secondary)] mb-6">
        Structural checks on published questions and flashcards: broken answer keys, duplicate choices,
        missing explanations, wall-of-text cards, and duplicates. Same rules as <code>npm run lint:content</code>.
      </p>
      <HealthView />
    </div>
  )
}
