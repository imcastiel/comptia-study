'use client'

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react'

type Phase = 'idle' | 'work' | 'break'

interface PomodoroState {
  phase: Phase
  secondsLeft: number
  pomodoroCount: number
  pomodoroActive: boolean   // true only when phase === 'work' and not paused
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP_BREAK' }
  | { type: 'TICK' }

const initialState: PomodoroState = {
  phase: 'idle',
  secondsLeft: 25 * 60,
  pomodoroCount: 0,
  pomodoroActive: false,
}

function timerReducer(state: PomodoroState, action: TimerAction): PomodoroState {
  switch (action.type) {
    case 'START':
      if (state.phase === 'idle') {
        return { ...state, phase: 'work', secondsLeft: 25 * 60, pomodoroActive: true }
      }
      if (state.phase === 'work') {
        return { ...state, pomodoroActive: true }
      }
      return state

    case 'PAUSE':
      return { ...state, pomodoroActive: false }

    case 'RESET':
      return initialState

    case 'SKIP_BREAK':
      if (state.phase === 'break') {
        return { ...state, phase: 'idle', secondsLeft: 25 * 60, pomodoroActive: false }
      }
      return state

    case 'TICK': {
      if (state.secondsLeft > 1) {
        return { ...state, secondsLeft: state.secondsLeft - 1 }
      }
      // Timer reaches 0
      if (state.phase === 'work') {
        const newCount = state.pomodoroCount + 1
        const isLong = newCount % 4 === 0
        return {
          phase: 'break',
          secondsLeft: isLong ? 15 * 60 : 5 * 60,
          pomodoroCount: newCount,
          pomodoroActive: false,
        }
      }
      // Break ends
      const wasLong = state.pomodoroCount % 4 === 0
      return {
        phase: 'idle',
        secondsLeft: 25 * 60,
        pomodoroCount: wasLong ? 0 : state.pomodoroCount,
        pomodoroActive: false,
      }
    }

    default:
      return state
  }
}

interface PomodoroContextValue extends PomodoroState {
  start: () => void
  pause: () => void
  reset: () => void
  skipBreak: () => void
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

export function usePomodoroContext(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoroContext must be used inside PomodoroProvider')
  return ctx
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState)
  const permissionAskedRef = useRef(false)

  const start = useCallback(() => {
    if (!permissionAskedRef.current && typeof Notification !== 'undefined') {
      permissionAskedRef.current = true
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
    dispatch({ type: 'START' })
  }, [])

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
  const skipBreak = useCallback(() => dispatch({ type: 'SKIP_BREAK' }), [])

  // Show notification when work phase completes
  const prevPhaseRef = useRef<Phase>(state.phase)
  useEffect(() => {
    if (prevPhaseRef.current === 'work' && state.phase === 'break') {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Pomodoro complete!', { body: 'Time to take a break.' })
      }
    }
    prevPhaseRef.current = state.phase
  }, [state.phase])

  // Countdown interval: runs during active work or any break
  useEffect(() => {
    const shouldRun = (state.phase === 'work' && state.pomodoroActive) || state.phase === 'break'
    if (!shouldRun) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.phase, state.pomodoroActive])

  return (
    <PomodoroContext.Provider value={{ ...state, start, pause, reset, skipBreak }}>
      {children}
    </PomodoroContext.Provider>
  )
}
