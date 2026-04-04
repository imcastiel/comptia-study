'use client'

import { useActivityTracker } from '@/hooks/use-activity-tracker'

export function ActivityTracker({ topicId }: { topicId: string }) {
  useActivityTracker(topicId)
  return null
}
