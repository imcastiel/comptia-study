type ColorKey = 'blue' | 'orange' | 'green' | 'purple'

const COLORS: Record<ColorKey, { from: string; to: string; bg: string; border: string; glow: string }> = {
  blue:   { from: '#007AFF', to: '#0055D4', bg: 'rgba(0,122,255,0.06)',   border: 'rgba(0,122,255,0.14)',   glow: 'rgba(0,122,255,0.15)'   },
  orange: { from: '#FF9F0A', to: '#E07000', bg: 'rgba(255,159,10,0.06)',  border: 'rgba(255,159,10,0.14)',  glow: 'rgba(255,159,10,0.15)'  },
  green:  { from: '#34C759', to: '#1E8B40', bg: 'rgba(52,199,89,0.06)',   border: 'rgba(52,199,89,0.14)',   glow: 'rgba(52,199,89,0.15)'   },
  purple: { from: '#AF52DE', to: '#7B2B9E', bg: 'rgba(175,82,222,0.06)', border: 'rgba(175,82,222,0.14)', glow: 'rgba(175,82,222,0.15)'  },
}

interface StatCalloutProps {
  value: string
  unit?: string
  label: string
  sublabel?: string
  color?: ColorKey
}

export function StatCallout({ value, unit, label, sublabel, color = 'blue' }: StatCalloutProps) {
  const c = COLORS[color]

  return (
    <div
      className="my-6 rounded-[20px] border p-7 text-center relative overflow-hidden"
      style={{ background: c.bg, borderColor: c.border }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${c.glow}, transparent)` }}
      />

      <div className="relative">
        <div
          className="font-bold leading-none tabular-nums"
          style={{
            fontSize: 'clamp(40px, 8vw, 60px)',
            background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
          {unit && (
            <span style={{ fontSize: 'clamp(20px, 4vw, 30px)', marginLeft: '0.2em' }}>{unit}</span>
          )}
        </div>
        <p className="text-[15px] font-semibold text-foreground mt-2.5">{label}</p>
        {sublabel && (
          <p className="text-[13px] text-[var(--apple-label-secondary)] mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  )
}
