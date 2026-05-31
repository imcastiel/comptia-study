import { GenerateStudio } from '@/components/admin/generate-studio'

export default function GeneratePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-1">Generate</h1>
      <p className="text-[14px] text-[var(--apple-label-secondary)] mb-6">AI drafts → review &amp; edit → publish. Nothing reaches students until you publish.</p>
      <GenerateStudio />
    </div>
  )
}
