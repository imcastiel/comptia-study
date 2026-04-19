'use client'

import { useEffect, useState, useRef } from 'react'

interface ExamTimerProps {
  totalSeconds: number
  onTimeUp: () => void
  onTick?: (secondsLeft: number) => void
}

function getPhase(secondsLeft: number, total: number): 'blue' | 'orange' | 'red' {
  const pct = secondsLeft / total
  if (pct > 0.33) return 'blue'
  if (secondsLeft > 600) return 'orange'
  return 'red'
}

const PHASE_COLORS = {
  blue: { stroke: '#007AFF', text: '#007AFF', bg: 'rgba(0,122,255,0.08)' },
  orange: { stroke: '#FF9F0A', text: '#FF9F0A', bg: 'rgba(255,159,10,0.08)' },
  red: { stroke: '#FF3B30', text: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
}

export function ExamTimer({ totalSeconds, onTimeUp, onTick }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1
        onTick?.(next)
        if (next <= 0) {
          clearInterval(intervalRef.current!)
          onTimeUp()
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [onTimeUp, onTick])

  const phase = getPhase(secondsLeft, totalSeconds)
  const colors = PHASE_COLORS[phase]
  const pct = secondsLeft / totalSeconds
  const size = 72
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div
      className="flex flex-col items-center"
      style={{
        animation: phase === 'red' && secondsLeft <= 300 ? 'pulse-orange 2s infinite' : undefined,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="rgba(120,120,128,0.15)"
          strokeWidth={3}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
        {/* Time text */}
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          fontSize="13"
          fontWeight="600"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display'"
        >
          {timeStr}
        </text>
      </svg>
      {phase !== 'blue' && (
        <span
          className="text-[10px] font-semibold mt-0.5"
          style={{ color: colors.text }}
        >
          {phase === 'red' ? 'Time running low!' : 'Pace yourself'}
        </span>
      )}
    </div>
  )
}
