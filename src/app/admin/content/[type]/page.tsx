import { notFound } from 'next/navigation'
import { isContentType } from '@/lib/admin/content-types'
import { ContentLibrary } from '@/components/admin/content-library'

export default async function ContentPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  if (!isContentType(type)) notFound()
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-1 capitalize">{type}</h1>
      <p className="text-[14px] text-[var(--apple-label-secondary)] mb-6">Browse, edit, publish, and retire {type}.</p>
      <ContentLibrary type={type} />
    </div>
  )
}
