/**
 * SVG-based visual diagrams for CompTIA A+ concepts.
 * All diagrams are self-contained -- no external images needed.
 * Professional-grade visuals with gradients, depth, and precision.
 */

// ─── Storage Speed Bar Chart ─────────────────────────────────────────────────

export function StorageSpeedChart() {
  const bars = [
    { label: 'HDD',              speed: 150,     max: 14000, color: '#8E8E93', unit: '~150 MB/s' },
    { label: 'SATA SSD',         speed: 550,     max: 14000, color: '#FF9F0A', unit: '~550 MB/s' },
    { label: 'NVMe PCIe 3.0',    speed: 3500,    max: 14000, color: '#007AFF', unit: '~3,500 MB/s' },
    { label: 'NVMe PCIe 4.0',    speed: 7000,    max: 14000, color: '#5856D6', unit: '~7,000 MB/s' },
    { label: 'NVMe PCIe 5.0',    speed: 14000,   max: 14000, color: '#AF52DE', unit: '~14,000 MB/s' },
  ]

  const svgWidth = 600
  const svgHeight = 220
  const labelWidth = 110
  const unitWidth = 110
  const barAreaLeft = labelWidth + 10
  const barAreaRight = svgWidth - unitWidth - 10
  const barAreaWidth = barAreaRight - barAreaLeft
  const barHeight = 24
  const barGap = 14
  const topPadding = 15
  const gridLines = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000]

  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
        <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          Sequential Read Speed Comparison
        </p>
      </div>
      <div className="px-2 py-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {bars.map((bar, i) => (
              <linearGradient key={i} id={`ssc-bar-grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={bar.color} stopOpacity="0.85" />
                <stop offset="60%" stopColor={bar.color} stopOpacity="1" />
                <stop offset="100%" stopColor={bar.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
            {bars.map((bar, i) => (
              <linearGradient key={i} id={`ssc-bar-sheen-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
              </linearGradient>
            ))}
            <filter id="ssc-bar-shadow" x="-2%" y="-10%" width="104%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((val) => {
            const x = barAreaLeft + (val / 14000) * barAreaWidth
            return (
              <g key={val}>
                <line
                  x1={x} y1={topPadding - 5}
                  x2={x} y2={topPadding + bars.length * (barHeight + barGap) - barGap + 5}
                  stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"
                  strokeDasharray="3,3"
                />
                {val > 0 && (
                  <text
                    x={x} y={topPadding + bars.length * (barHeight + barGap) + 12}
                    textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.3"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </text>
                )}
              </g>
            )
          })}

          {/* Bars */}
          {bars.map((bar, i) => {
            const pct = bar.speed / bar.max
            const y = topPadding + i * (barHeight + barGap)
            const barW = Math.max(pct * barAreaWidth, 8)
            return (
              <g key={bar.label}>
                {/* Label */}
                <text
                  x={labelWidth}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill="currentColor"
                  opacity="0.85"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {bar.label}
                </text>

                {/* Track */}
                <rect
                  x={barAreaLeft} y={y}
                  width={barAreaWidth} height={barHeight}
                  rx={barHeight / 2}
                  fill="currentColor" opacity="0.04"
                />

                {/* Bar fill */}
                <rect
                  x={barAreaLeft} y={y}
                  width={barW} height={barHeight}
                  rx={barHeight / 2}
                  fill={`url(#ssc-bar-grad-${i})`}
                  filter="url(#ssc-bar-shadow)"
                />

                {/* Sheen overlay */}
                <rect
                  x={barAreaLeft} y={y}
                  width={barW} height={barHeight}
                  rx={barHeight / 2}
                  fill={`url(#ssc-bar-sheen-${i})`}
                />

                {/* Speed value */}
                <text
                  x={barAreaRight + 12}
                  y={y + barHeight / 2 + 1}
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={bar.color}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {bar.unit}
                </text>
              </g>
            )
          })}

          {/* Bottom axis label */}
          <text
            x={barAreaLeft + barAreaWidth / 2}
            y={svgHeight - 4}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            opacity="0.35"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            MB/s
          </text>
        </svg>
      </div>
    </div>
  )
}

// ─── OSI Model Stack ──────────────────────────────────────────────────────────

export function OSIModel() {
  const layers = [
    { num: 7, name: 'Application',  examples: 'HTTP, FTP, DNS, SMTP',    color: '#FF3B30' },
    { num: 6, name: 'Presentation', examples: 'TLS/SSL, JPEG, encoding', color: '#FF9F0A' },
    { num: 5, name: 'Session',      examples: 'NetBIOS, RPC, SIP',       color: '#FFCC00' },
    { num: 4, name: 'Transport',    examples: 'TCP, UDP',                 color: '#34C759' },
    { num: 3, name: 'Network',      examples: 'IP, ICMP, routing',        color: '#007AFF' },
    { num: 2, name: 'Data Link',    examples: 'Ethernet, Wi-Fi, MAC',     color: '#5856D6' },
    { num: 1, name: 'Physical',     examples: 'Cables, signals, NIC',     color: '#AF52DE' },
  ]

  const groupLabels: Record<number, string> = {
    7: 'Host',
    4: 'Media',
  }

  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] overflow-hidden bg-card">
      <div className="px-5 py-4 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
        <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          OSI Reference Model — 7 Layers
        </p>
      </div>
      <div className="divide-y divide-[var(--apple-separator)]">
        {layers.map((layer) => (
          <div
            key={layer.num}
            className="flex items-stretch relative"
            style={{
              background: `linear-gradient(90deg, ${layer.color}08 0%, transparent 40%)`,
            }}
          >
            {/* Number badge */}
            <div className="w-14 flex items-center justify-center shrink-0">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${layer.color} 0%, ${layer.color}CC 100%)`,
                  boxShadow: `0 2px 6px ${layer.color}40`,
                }}
              >
                {layer.num}
              </span>
            </div>

            {/* Layer info */}
            <div className="flex-1 px-3 py-3 flex items-center justify-between gap-4 min-w-0">
              <span
                className="text-[14px] font-bold w-[110px] shrink-0 tracking-tight"
                style={{ color: layer.color }}
              >
                {layer.name}
              </span>

              {/* Protocol pills */}
              <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
                {layer.examples.split(', ').map((proto) => (
                  <span
                    key={proto}
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${layer.color}12`,
                      color: layer.color,
                      border: `1px solid ${layer.color}20`,
                    }}
                  >
                    {proto}
                  </span>
                ))}
              </div>
            </div>

            {/* Group bracket labels */}
            {groupLabels[layer.num] && (
              <div className="absolute right-2 -bottom-1 text-[8px] font-bold uppercase tracking-widest text-[var(--apple-label-tertiary)] opacity-50">
                {groupLabels[layer.num]} Layers
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data flow arrows */}
      <div className="flex justify-between px-5 py-2 bg-[var(--apple-fill)] border-t border-[var(--apple-separator)]">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--apple-label-tertiary)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L6 10M6 10L3 7M6 10L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Encapsulation (send)
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--apple-label-tertiary)]">
          De-encapsulation (receive)
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10L6 2M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Network Flow Diagram ─────────────────────────────────────────────────────

interface FlowNode {
  label: string
  icon: string
  sub?: string
}

interface NetworkFlowProps {
  nodes: FlowNode[]
  title?: string
}

const FLOW_ICONS: Record<string, string> = {
  laptop:   'laptop',
  desktop:  'desktop',
  router:   'router',
  switch:   'switch',
  server:   'server',
  cloud:    'cloud',
  phone:    'phone',
  firewall: 'firewall',
  internet: 'internet',
  printer:  'printer',
}

function FlowIconSVG({ icon, size = 28 }: { icon: string; size?: number }) {
  const s = size
  const half = s / 2

  switch (icon) {
    case 'laptop':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-laptop-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636366" />
              <stop offset="100%" stopColor="#48484A" />
            </linearGradient>
            <linearGradient id="nf-laptop-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2C2C2E" />
              <stop offset="100%" stopColor="#1C1C1E" />
            </linearGradient>
          </defs>
          {/* Screen */}
          <rect x="4" y="4" width="20" height="14" rx="1.5" fill="url(#nf-laptop-body)" />
          <rect x="5.5" y="5.5" width="17" height="11" rx="0.5" fill="url(#nf-laptop-screen)" />
          {/* Screen glow */}
          <rect x="7" y="7" width="14" height="7" rx="0.5" fill="#007AFF" opacity="0.15" />
          {/* Base */}
          <path d="M2 19.5 L26 19.5 L24.5 22 Q24 22.5 23.5 22.5 L4.5 22.5 Q4 22.5 3.5 22 Z" fill="url(#nf-laptop-body)" />
          {/* Trackpad hint */}
          <rect x="11" y="20" width="6" height="1.5" rx="0.75" fill="#48484A" opacity="0.5" />
        </svg>
      )
    case 'desktop':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-desktop-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636366" />
              <stop offset="100%" stopColor="#48484A" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="22" height="16" rx="2" fill="url(#nf-desktop-body)" />
          <rect x="4.5" y="4.5" width="19" height="13" rx="1" fill="#1C1C1E" />
          <rect x="6" y="6" width="16" height="9" rx="0.5" fill="#007AFF" opacity="0.12" />
          {/* Stand */}
          <path d="M12 20 L16 20 L17 23 L11 23 Z" fill="#48484A" />
          <rect x="9" y="23" width="10" height="1.5" rx="0.75" fill="#636366" />
        </svg>
      )
    case 'router':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-router-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48484A" />
              <stop offset="100%" stopColor="#3A3A3C" />
            </linearGradient>
          </defs>
          {/* Antennas */}
          <rect x="7" y="2" width="1.8" height="10" rx="0.9" fill="#636366" />
          <rect x="19.2" y="2" width="1.8" height="10" rx="0.9" fill="#636366" />
          <circle cx="8" cy="2.5" r="1.2" fill="#636366" />
          <circle cx="20" cy="2.5" r="1.2" fill="#636366" />
          {/* Body */}
          <rect x="3" y="12" width="22" height="10" rx="2.5" fill="url(#nf-router-body)" />
          {/* Status LEDs */}
          <circle cx="7" cy="17" r="1" fill="#34C759" />
          <circle cx="10.5" cy="17" r="1" fill="#34C759" opacity="0.6" />
          <circle cx="14" cy="17" r="1" fill="#FF9F0A" opacity="0.5" />
          <circle cx="17.5" cy="17" r="1" fill="#007AFF" opacity="0.4" />
          {/* Vents */}
          {[0, 1, 2, 3, 4].map(i => (
            <rect key={i} x={6 + i * 3.6} y="20" width="2" height="0.6" rx="0.3" fill="#2C2C2E" />
          ))}
          {/* Ports hint at bottom */}
          <rect x="5" y="22.5" width="18" height="2" rx="0.5" fill="#2C2C2E" />
        </svg>
      )
    case 'switch':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-switch-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48484A" />
              <stop offset="100%" stopColor="#3A3A3C" />
            </linearGradient>
          </defs>
          {/* Body -- wider, flatter */}
          <rect x="2" y="9" width="24" height="10" rx="2" fill="url(#nf-switch-body)" />
          {/* Port bank */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <rect key={i} x={4 + i * 2.7} y="11" width="2" height="3" rx="0.3" fill="#007AFF" opacity={0.3 + i * 0.08} />
          ))}
          {/* LEDs */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <circle key={i} cx={5 + i * 2.7} cy="16.5" r="0.6" fill="#34C759" opacity={i < 5 ? 0.9 : 0.3} />
          ))}
          {/* Arrows showing switching */}
          <path d="M4 22 L14 22" stroke="#007AFF" strokeWidth="0.8" opacity="0.4" />
          <path d="M14 22 L24 22" stroke="#34C759" strokeWidth="0.8" opacity="0.4" />
          <path d="M13 21 L15 22 L13 23" fill="#007AFF" opacity="0.4" />
        </svg>
      )
    case 'server':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-server-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636366" />
              <stop offset="100%" stopColor="#48484A" />
            </linearGradient>
          </defs>
          {/* Rack unit 1 */}
          <rect x="5" y="3" width="18" height="7" rx="1.5" fill="url(#nf-server-body)" />
          <circle cx="8" cy="6.5" r="1" fill="#34C759" />
          <rect x="11" y="5" width="9" height="1" rx="0.5" fill="#3A3A3C" />
          <rect x="11" y="7" width="7" height="1" rx="0.5" fill="#3A3A3C" />
          {/* Rack unit 2 */}
          <rect x="5" y="11" width="18" height="7" rx="1.5" fill="url(#nf-server-body)" />
          <circle cx="8" cy="14.5" r="1" fill="#007AFF" />
          <rect x="11" y="13" width="9" height="1" rx="0.5" fill="#3A3A3C" />
          <rect x="11" y="15" width="7" height="1" rx="0.5" fill="#3A3A3C" />
          {/* Rack unit 3 */}
          <rect x="5" y="19" width="18" height="7" rx="1.5" fill="url(#nf-server-body)" />
          <circle cx="8" cy="22.5" r="1" fill="#FF9F0A" opacity="0.7" />
          <rect x="11" y="21" width="9" height="1" rx="0.5" fill="#3A3A3C" />
          <rect x="11" y="23" width="7" height="1" rx="0.5" fill="#3A3A3C" />
        </svg>
      )
    case 'cloud':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-cloud-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M22 18.5 Q25.5 18.5 25.5 15 Q25.5 12 22.5 11.5 Q22.5 7.5 18.5 7 Q15 6.5 13 9 Q11 7.5 9 8.5 Q6.5 9.5 6.5 12 Q3 12.5 3 15.5 Q3 18.5 6 18.5 Z"
            fill="url(#nf-cloud-fill)"
            stroke="#007AFF"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Inner cloud highlight */}
          <path
            d="M21 17 Q23.5 17 23.5 15 Q23.5 12.8 21.5 12.5 Q21.5 9 18 8.5 Q15.2 8 13.5 10"
            fill="none"
            stroke="#5AC8FA"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </svg>
      )
    case 'phone':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-phone-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636366" />
              <stop offset="100%" stopColor="#48484A" />
            </linearGradient>
          </defs>
          <rect x="8" y="2" width="12" height="24" rx="2.5" fill="url(#nf-phone-body)" />
          <rect x="9.5" y="4" width="9" height="18" rx="0.5" fill="#1C1C1E" />
          <rect x="10.5" y="5" width="7" height="15" rx="0.5" fill="#007AFF" opacity="0.12" />
          {/* Notch */}
          <rect x="12" y="2.5" width="4" height="1.5" rx="0.75" fill="#48484A" />
          {/* Home bar */}
          <rect x="11" y="24" width="6" height="1" rx="0.5" fill="#636366" />
        </svg>
      )
    case 'firewall':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-fw-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Shield shape */}
          <path
            d="M14 2 L24 7 L24 15 Q24 22 14 26 Q4 22 4 15 L4 7 Z"
            fill="url(#nf-fw-grad)"
            stroke="#FF3B30"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Brick pattern */}
          <line x1="7" y1="11" x2="21" y2="11" stroke="#FF3B30" strokeWidth="0.6" opacity="0.4" />
          <line x1="7" y1="15" x2="21" y2="15" stroke="#FF3B30" strokeWidth="0.6" opacity="0.4" />
          <line x1="7" y1="19" x2="19" y2="19" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
          <line x1="11" y1="7" x2="11" y2="11" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
          <line x1="17" y1="7" x2="17" y2="11" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
          <line x1="14" y1="11" x2="14" y2="15" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
          <line x1="10" y1="15" x2="10" y2="19" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
          <line x1="17" y1="15" x2="17" y2="19" stroke="#FF3B30" strokeWidth="0.6" opacity="0.3" />
        </svg>
      )
    case 'internet':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-inet-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <circle cx="14" cy="14" r="11" fill="url(#nf-inet-grad)" stroke="#007AFF" strokeWidth="1.2" />
          {/* Meridians */}
          <ellipse cx="14" cy="14" rx="5" ry="11" fill="none" stroke="#007AFF" strokeWidth="0.7" opacity="0.4" />
          <ellipse cx="14" cy="14" rx="8" ry="11" fill="none" stroke="#007AFF" strokeWidth="0.5" opacity="0.25" />
          {/* Parallels */}
          <line x1="4" y1="10" x2="24" y2="10" stroke="#007AFF" strokeWidth="0.6" opacity="0.3" />
          <line x1="3.5" y1="14" x2="24.5" y2="14" stroke="#007AFF" strokeWidth="0.6" opacity="0.3" />
          <line x1="4" y1="18" x2="24" y2="18" stroke="#007AFF" strokeWidth="0.6" opacity="0.3" />
        </svg>
      )
    case 'printer':
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="nf-printer-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636366" />
              <stop offset="100%" stopColor="#48484A" />
            </linearGradient>
          </defs>
          {/* Paper in tray (top) */}
          <rect x="7" y="3" width="14" height="5" rx="0.5" fill="#F2F2F7" stroke="#D1D1D6" strokeWidth="0.5" />
          {/* Body */}
          <rect x="3" y="8" width="22" height="12" rx="2" fill="url(#nf-printer-body)" />
          {/* Output slot */}
          <rect x="6" y="10" width="16" height="1.5" rx="0.75" fill="#2C2C2E" />
          {/* Status LED */}
          <circle cx="21" cy="14" r="1" fill="#34C759" />
          {/* Paper output */}
          <rect x="8" y="19" width="12" height="6" rx="0.5" fill="#F2F2F7" stroke="#D1D1D6" strokeWidth="0.5" />
          {/* Text lines on paper */}
          <line x1="10" y1="21" x2="18" y2="21" stroke="#D1D1D6" strokeWidth="0.5" />
          <line x1="10" y1="22.5" x2="16" y2="22.5" stroke="#D1D1D6" strokeWidth="0.5" />
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="20" height="20" rx="3" fill="#48484A" opacity="0.3" stroke="#636366" strokeWidth="1" />
          <circle cx="14" cy="12" r="3" fill="none" stroke="#636366" strokeWidth="1" />
          <text x="14" y="22" textAnchor="middle" fontSize="6" fill="#636366" fontWeight="bold">?</text>
        </svg>
      )
  }
}

export function NetworkFlow({ nodes, title }: NetworkFlowProps) {
  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] bg-card overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
          <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="px-5 py-6 overflow-x-auto">
        <div className="flex items-center justify-center flex-wrap gap-2 min-w-0">
          {(nodes ?? []).map((node, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                {/* Icon container with gradient background */}
                <div
                  className="w-16 h-16 rounded-[16px] border border-[var(--apple-separator)] flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'var(--apple-fill)',
                  }}
                >
                  {/* Subtle radial glow */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'radial-gradient(circle at 50% 30%, rgba(0,122,255,0.08) 0%, transparent 70%)',
                    }}
                  />
                  <FlowIconSVG icon={FLOW_ICONS[node.icon] ?? 'default'} size={32} />
                </div>
                <span className="text-[11px] font-semibold text-foreground">{node.label}</span>
                {node.sub && (
                  <span className="text-[10px] text-[var(--apple-label-tertiary)] -mt-1">{node.sub}</span>
                )}
              </div>

              {/* Connection arrow */}
              {i < nodes.length - 1 && (
                <div className="flex items-center pb-6">
                  <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                    <defs>
                      <linearGradient id={`nf-arrow-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#007AFF" stopOpacity="0.15" />
                        <stop offset="50%" stopColor="#007AFF" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#007AFF" stopOpacity="0.15" />
                      </linearGradient>
                      <marker id={`nf-arrowhead-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill="#007AFF" opacity="0.6" />
                      </marker>
                    </defs>
                    {/* Dashed connection line */}
                    <line
                      x1="2" y1="8" x2="32" y2="8"
                      stroke="url(#nf-arrow-${i})"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      markerEnd={`url(#nf-arrowhead-${i})`}
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── RAID Visual ──────────────────────────────────────────────────────────────

interface RAIDVisualProps {
  level: 0 | 1 | 5 | 10
}

const RAID_INFO: Record<number, { label: string; color: string; description: string; drives: string[][] }> = {
  0: {
    label: 'RAID 0 — Striping',
    color: '#FF3B30',
    description: '2 drives required. Max speed, zero fault tolerance. One failure = all data lost.',
    drives: [['A1','B1'],['A2','B2'],['A3','B3']],
  },
  1: {
    label: 'RAID 1 — Mirroring',
    color: '#34C759',
    description: '2 drives required. One drive is an exact copy. 50% usable space.',
    drives: [['A1','A1'],['A2','A2'],['A3','A3']],
  },
  5: {
    label: 'RAID 5 — Striping + Parity',
    color: '#007AFF',
    description: '3 drives minimum. Parity distributed across all drives. Tolerates 1 failure.',
    drives: [['A1','B1','P'],['B2','P','A2'],['P','A3','B3']],
  },
  10: {
    label: 'RAID 10 — Mirror + Stripe',
    color: '#AF52DE',
    description: '4 drives minimum. Mirrored pairs, then striped. Best performance + redundancy.',
    drives: [['A1','A1','B1','B1'],['A2','A2','B2','B2']],
  },
}

export function RAIDVisual({ level }: RAIDVisualProps) {
  const info = RAID_INFO[level]
  if (!info) return null

  const driveCount = info.drives[0].length
  const driveColors = ['#007AFF', '#34C759', '#FF9F0A', '#AF52DE']
  const parityColor = '#FFCC00'

  const driveW = 72
  const driveGap = 10
  const totalW = driveCount * driveW + (driveCount - 1) * driveGap
  const blockH = 32
  const headerH = 28
  const rows = info.drives.length
  const svgW = totalW + 40
  const svgH = headerH + rows * blockH + 40
  const xStart = 20

  return (
    <div className="my-6 rounded-[18px] border overflow-hidden" style={{ borderColor: `${info.color}30` }}>
      <div
        className="px-5 py-3.5"
        style={{ background: `${info.color}12` }}
      >
        <p className="text-[13px] font-bold" style={{ color: info.color }}>{info.label}</p>
        <p className="text-[12px] text-[var(--apple-label-secondary)] mt-0.5">{info.description}</p>
      </div>
      <div className="p-4 bg-card flex justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ maxWidth: `${svgW}px` }}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Drive bay gradients */}
            {driveColors.map((color, i) => (
              <linearGradient key={i} id={`raid-${level}-drive-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0.75" />
              </linearGradient>
            ))}
            <linearGradient id={`raid-${level}-parity`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={parityColor} />
              <stop offset="100%" stopColor={parityColor} stopOpacity="0.7" />
            </linearGradient>
            {/* Block face gradient for 3D depth */}
            <linearGradient id={`raid-${level}-face`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
            </linearGradient>
            <filter id={`raid-${level}-shadow`}>
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Drive columns */}
          {Array.from({ length: driveCount }).map((_, di) => {
            const x = xStart + di * (driveW + driveGap)
            const col = driveColors[di % driveColors.length]
            return (
              <g key={di}>
                {/* Drive bay background -- subtle 3D */}
                <rect
                  x={x} y={8}
                  width={driveW} height={headerH + rows * blockH + 8}
                  rx={6}
                  fill="currentColor" opacity="0.03"
                  stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
                />

                {/* Drive header */}
                <rect
                  x={x} y={8}
                  width={driveW} height={headerH}
                  rx={6}
                  fill={`url(#raid-${level}-drive-${di % driveColors.length})`}
                  filter={`url(#raid-${level}-shadow)`}
                />
                {/* Round bottom corners of header */}
                <rect
                  x={x} y={headerH + 2}
                  width={driveW} height={8}
                  fill={col} opacity="0.75"
                />
                <rect
                  x={x} y={8}
                  width={driveW} height={headerH}
                  rx={6}
                  fill={`url(#raid-${level}-face)`}
                />

                {/* Drive label */}
                <text
                  x={x + driveW / 2} y={8 + headerH / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="700" fill="white"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  Drive {di + 1}
                </text>

                {/* Data blocks */}
                {info.drives.map((row, ri) => {
                  const blockY = 8 + headerH + 4 + ri * blockH
                  const isParity = row[di] === 'P'
                  const blockCol = isParity ? parityColor : col

                  return (
                    <g key={ri}>
                      {/* Block background */}
                      <rect
                        x={x + 3} y={blockY}
                        width={driveW - 6} height={blockH - 4}
                        rx={4}
                        fill={blockCol}
                        opacity={isParity ? 0.2 : 0.12}
                        stroke={blockCol}
                        strokeWidth="1"
                        strokeOpacity={isParity ? 0.5 : 0.3}
                      />
                      {/* Block label */}
                      <text
                        x={x + driveW / 2} y={blockY + (blockH - 4) / 2 + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="12" fontWeight="600"
                        fill={isParity ? parityColor : blockCol}
                        opacity={isParity ? 1 : 0.85}
                        fontFamily="ui-monospace, SFMono-Regular, monospace"
                      >
                        {row[di]}
                      </text>
                    </g>
                  )
                })}

                {/* LED indicator at bottom of drive bay */}
                <circle
                  cx={x + driveW / 2} cy={8 + headerH + rows * blockH + 6}
                  r={2}
                  fill={col} opacity="0.5"
                />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ─── Port Quick Reference ─────────────────────────────────────────────────────

interface PortBadge {
  port: string | number
  name: string
  proto: 'TCP' | 'UDP' | 'TCP/UDP'
  color?: string
}

interface PortReferenceProps {
  ports: PortBadge[]
  title?: string
}

export function PortReference({ ports, title }: PortReferenceProps) {
  const PROTO_COLOR: Record<string, string> = {
    TCP:     '#007AFF',
    UDP:     '#FF9F0A',
    'TCP/UDP': '#5856D6',
  }

  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] overflow-hidden bg-card">
      {title && (
        <div className="px-5 py-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
          <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="p-4 flex flex-wrap gap-2.5">
        {(ports ?? []).map((p, i) => {
          const color = p.color ?? PROTO_COLOR[p.proto] ?? '#007AFF'
          return (
            <div
              key={i}
              className="rounded-[14px] overflow-hidden min-w-[72px]"
              style={{
                border: `1px solid ${color}20`,
                boxShadow: `0 1px 3px ${color}08`,
              }}
            >
              {/* Port number with gradient background */}
              <div
                className="px-3 py-2 text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
                }}
              >
                {/* Subtle radial accent */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 60%)`,
                  }}
                />
                <span
                  className="relative text-[22px] font-extrabold tabular-nums tracking-tight"
                  style={{ color }}
                >
                  {p.port}
                </span>
              </div>

              {/* Name and protocol */}
              <div
                className="px-3 py-2 text-center"
                style={{ borderTop: `1px solid ${color}10` }}
              >
                <p className="text-[11px] font-semibold text-foreground leading-tight">{p.name}</p>
                <span
                  className="inline-block text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${color}12`,
                    color: `${color}BB`,
                  }}
                >
                  {p.proto}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Display Technology Comparison ───────────────────────────────────────────

function ViewingAngleArc({ angle, color, name }: { angle: number; color: string; name: string }) {
  const svgSize = 80
  const cx = svgSize / 2
  const cy = svgSize - 8
  const radius = 30
  const halfAngle = (angle / 2) * (Math.PI / 180)

  const x1 = cx - radius * Math.sin(halfAngle)
  const y1 = cy - radius * Math.cos(halfAngle)
  const x2 = cx + radius * Math.sin(halfAngle)
  const y2 = cy - radius * Math.cos(halfAngle)

  const largeArc = angle > 180 ? 1 : 0

  const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z`

  return (
    <svg width={svgSize} height={svgSize - 10} viewBox={`0 0 ${svgSize} ${svgSize - 10}`} fill="none">
      <defs>
        <radialGradient id={`dtc-arc-${name}`} cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </radialGradient>
      </defs>
      {/* Reference circle (full 180) */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
      {/* Actual viewing angle arc */}
      <path d={arcPath} fill={`url(#dtc-arc-${name})`} />
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Monitor representation */}
      <rect x={cx - 10} y={cy - 3} width="20" height="4" rx="1" fill={color} opacity="0.6" />
      {/* Angle label */}
      <text
        x={cx} y={cy - radius - 5}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={color}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {angle}°
      </text>
    </svg>
  )
}

export function DisplayTechComparison() {
  const panels = [
    {
      name: 'TN',
      full: 'Twisted Nematic',
      color: '#FF9F0A',
      angle: 160,
      response: '1-5 ms',
      color_acc: '\u2605\u2605\u2606\u2606',
      use: 'Gaming',
      pros: ['Fastest response time', 'Lowest cost', 'High refresh rates'],
      cons: ['Poor color accuracy', 'Narrow viewing angles', 'Colors shift off-axis'],
    },
    {
      name: 'IPS',
      full: 'In-Plane Switching',
      color: '#007AFF',
      angle: 178,
      response: '4-8 ms',
      color_acc: '\u2605\u2605\u2605\u2605',
      use: 'Design / General',
      pros: ['Excellent color accuracy', 'Wide 178\u00b0 viewing angles', 'Consistent colors'],
      cons: ['Slower than TN', 'More expensive', 'IPS glow in dark'],
    },
    {
      name: 'VA',
      full: 'Vertical Alignment',
      color: '#5856D6',
      angle: 178,
      response: '4-10 ms',
      color_acc: '\u2605\u2605\u2605\u2606',
      use: 'Movies / Media',
      pros: ['High contrast ratio (3000:1+)', 'Deep blacks', 'Good for dark content'],
      cons: ['Slower response (ghosting)', 'Some color shift', 'Middle-ground performance'],
    },
    {
      name: 'OLED',
      full: 'Organic Light-Emitting Diode',
      color: '#34C759',
      angle: 180,
      response: '<1 ms',
      color_acc: '\u2605\u2605\u2605\u2605',
      use: 'Premium / Mobile',
      pros: ['True blacks (pixel off)', 'Infinite contrast', 'Fastest response', 'Thinnest form factor'],
      cons: ['Burn-in risk', 'More expensive', 'Peak brightness lower'],
    },
  ]

  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] overflow-hidden bg-card">
      <div className="px-5 py-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
        <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">
          Display Panel Technology Comparison
        </p>
      </div>
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {panels.map((p) => (
          <div
            key={p.name}
            className="rounded-[14px] overflow-hidden"
            style={{
              border: `1px solid ${p.color}25`,
              boxShadow: `0 2px 8px ${p.color}08`,
            }}
          >
            {/* Header with gradient */}
            <div
              className="px-3 py-2.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${p.color}18 0%, ${p.color}06 100%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 80% 0%, ${p.color}12 0%, transparent 50%)`,
                }}
              />
              <div className="relative">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[20px] font-extrabold tracking-tight" style={{ color: p.color }}>{p.name}</span>
                  <span className="text-[9px] text-[var(--apple-label-tertiary)] leading-tight">{p.full}</span>
                </div>
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
                  style={{
                    background: `${p.color}20`,
                    color: p.color,
                    border: `1px solid ${p.color}15`,
                  }}
                >
                  {p.use}
                </span>
              </div>
            </div>

            {/* Viewing angle arc diagram */}
            <div className="flex justify-center py-2 border-b border-[var(--apple-separator)]" style={{ background: `${p.color}04` }}>
              <ViewingAngleArc angle={p.angle} color={p.color} name={p.name} />
            </div>

            {/* Stats */}
            <div className="px-3 py-2 space-y-1.5 border-b border-[var(--apple-separator)]">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--apple-label-tertiary)]">Response</span>
                <span className="font-semibold text-foreground">{p.response}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--apple-label-tertiary)]">Color</span>
                <span className="font-semibold" style={{ color: p.color }}>{p.color_acc}</span>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="px-3 py-2 space-y-1">
              {p.pros.map((pro, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-[var(--apple-label-secondary)]">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 mt-0.5">
                    <circle cx="6" cy="6" r="5" fill={p.color} opacity="0.15" />
                    <path d="M3.5 6 L5.5 8 L8.5 4.5" stroke={p.color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{pro}</span>
                </div>
              ))}
              {p.cons.map((con, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-[var(--apple-label-tertiary)]">
                  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 mt-0.5">
                    <circle cx="6" cy="6" r="5" fill="currentColor" opacity="0.06" />
                    <path d="M4 4 L8 8 M8 4 L4 8" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                  </svg>
                  <span>{con}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
