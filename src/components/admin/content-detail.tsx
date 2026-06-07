import { cn } from '@/lib/utils'
import type { ContentItem } from './content-library'

interface Choice { id: string; text: string; isCorrect?: boolean }

const labelCls = 'text-[11px] font-semibold uppercase tracking-wide text-[var(--apple-label-tertiary)] mb-1'

/** Full read-only rendering of a question or flashcard (shared by the
 *  expandable rows and the reader overlay). */
export function ContentDetail({ item }: { item: ContentItem }) {
  // Question
  if (item.stem != null) {
    let choices: Choice[] = []
    try { choices = JSON.parse(item.choices || '[]') } catch { /* malformed */ }
    let correct: unknown = null
    try { correct = JSON.parse(item.correctAnswer || 'null') } catch { /* malformed */ }
    const correctIds = new Set<string>(
      Array.isArray(correct) ? correct.map(String) : correct != null ? [String(correct)] : [],
    )
    return (
      <div className="flex flex-col gap-4 text-[13px]">
        <p className="whitespace-pre-line font-medium text-[14px] leading-relaxed">{item.stem}</p>
        <ul className="flex flex-col gap-1.5">
          {choices.map((c) => {
            const ok = c.isCorrect === true || correctIds.has(c.id)
            return (
              <li key={c.id} className={cn(
                'flex items-start gap-2 rounded-[10px] px-3 py-2 border',
                ok ? 'border-[var(--apple-green)]/40 bg-[var(--apple-green)]/10' : 'border-[var(--apple-separator)]',
              )}>
                <span className="font-semibold uppercase w-4 shrink-0">{c.id}</span>
                <span className="flex-1 whitespace-pre-line">{c.text}</span>
                {ok && <span className="text-[var(--apple-green)] font-medium shrink-0">✓</span>}
              </li>
            )
          })}
        </ul>
        {item.explanation && (
          <div>
            <div className={labelCls}>Explanation</div>
            <p className="whitespace-pre-line text-[var(--apple-label-secondary)] leading-relaxed">{item.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  // Flashcard
  if (item.front != null || item.back != null) {
    return (
      <div className="flex flex-col gap-4 text-[13px]">
        <div>
          <div className={labelCls}>Front</div>
          <p className="whitespace-pre-line font-medium leading-relaxed">{item.front}</p>
        </div>
        <div>
          <div className={labelCls}>Back</div>
          <p className="whitespace-pre-line text-[var(--apple-label-secondary)] leading-relaxed">{item.back}</p>
        </div>
      </div>
    )
  }

  // Blob (cheat sheet / PBQ) fallback — just the title; these are edited as JSON.
  return <div className="text-[13px] text-[var(--apple-label-secondary)]">{item.title ?? '(no preview)'}</div>
}
