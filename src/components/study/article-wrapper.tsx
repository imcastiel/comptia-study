import type { ReactNode } from 'react'

export function ArticleWrapper({ children }: { children: ReactNode }) {
  return (
    <article className="prose-custom animate-fade-up" style={{ animationDelay: '80ms' }}>
      {children}
    </article>
  )
}
