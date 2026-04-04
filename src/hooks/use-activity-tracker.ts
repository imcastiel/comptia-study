// No 'use client' — hook files are not components.
// The wrapping ActivityTracker component provides the 'use client' boundary.
import { useEffect, useRef } from 'react'
import { usePomodoroContext } from '@/contexts/pomodoro-context'

export function useActivityTracker(topicId?: string): void {
  const { pomodoroActive } = usePomodoroContext()
  const lastInteractionAt = useRef<number>(Date.now())
  const pomodoroActiveRef = useRef<boolean>(pomodoroActive)

  // Keep ref in sync so the interval closure always reads the latest value
  // without needing to recreate the interval on every pomodoroActive change.
  useEffect(() => {
    pomodoroActiveRef.current = pomodoroActive
  }, [pomodoroActive])

  useEffect(() => {
    function updateInteraction() {
      lastInteractionAt.current = Date.now()
    }

    document.addEventListener('scroll', updateInteraction)
    document.addEventListener('mousemove', updateInteraction)
    document.addEventListener('keydown', updateInteraction)

    const interval = setInterval(() => {
      // Skip if tab is hidden
      if (document.hidden) return

      // Skip if idle more than 60s and no active pomodoro
      const idleTooLong = Date.now() - lastInteractionAt.current >= 60_000
      if (idleTooLong && !pomodoroActiveRef.current) return

      // Fire heartbeat — swallow all errors silently (fire-and-forget telemetry)
      fetch('/api/activity/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      }).catch(() => {})
    }, 60_000)

    return () => {
      document.removeEventListener('scroll', updateInteraction)
      document.removeEventListener('mousemove', updateInteraction)
      document.removeEventListener('keydown', updateInteraction)
      clearInterval(interval)
    }
  }, [topicId])
}
