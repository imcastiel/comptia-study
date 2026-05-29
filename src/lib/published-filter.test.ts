import { describe, it, expect } from 'vitest'
import { onlyPublished } from '@/lib/published-filter'

describe('onlyPublished', () => {
  it('keeps published items', () => {
    const rows = [
      { id: 'a', published: true },
      { id: 'b', published: false },
      { id: 'c', published: true },
    ]
    expect(onlyPublished(rows).map((r) => r.id)).toEqual(['a', 'c'])
  })
})
