'use client'

/**
 * Schematic ATX motherboard for hotspot identification PBQs.
 *
 * Drawn as SVG rather than a photo: no licensing risk, crisp at any size,
 * correct in both themes, and contributors can add regions as data. Regions
 * are deliberately unlabeled — identifying them IS the exercise.
 */

export interface DiagramRegion {
  id: string
  label: string
  /** Hit area in viewBox coordinates */
  x: number
  y: number
  w: number
  h: number
}

export const MOTHERBOARD_REGIONS: DiagramRegion[] = [
  { id: 'rear-io', label: 'Rear I/O panel', x: 14, y: 16, w: 22, h: 58 },
  { id: 'cpu-power-8pin', label: '8-pin CPU power (EPS12V)', x: 96, y: 14, w: 24, h: 12 },
  { id: 'fan-header', label: 'CPU fan header', x: 130, y: 14, w: 14, h: 10 },
  { id: 'cpu-socket', label: 'CPU socket', x: 58, y: 36, w: 44, h: 44 },
  { id: 'ram-slots', label: 'RAM (DIMM) slots', x: 120, y: 32, w: 42, h: 56 },
  { id: 'atx-24pin', label: '24-pin ATX power connector', x: 168, y: 96, w: 16, h: 44 },
  { id: 'chipset', label: 'Chipset heatsink', x: 86, y: 104, w: 32, h: 32 },
  { id: 'cmos-battery', label: 'CMOS battery', x: 40, y: 108, w: 22, h: 22 },
  { id: 'm2-slot', label: 'M.2 slot', x: 46, y: 148, w: 84, h: 12 },
  { id: 'pcie-x16', label: 'PCIe x16 slot', x: 24, y: 170, w: 118, h: 10 },
  { id: 'pcie-x1', label: 'PCIe x1 slot', x: 24, y: 188, w: 38, h: 9 },
  { id: 'sata-ports', label: 'SATA ports', x: 150, y: 162, w: 34, h: 30 },
  { id: 'front-panel-header', label: 'Front-panel header', x: 152, y: 206, w: 32, h: 14 },
]

interface MotherboardDiagramProps {
  /** Region the user clicked (after answering) */
  clickedId?: string | null
  /** Correct region — highlighted green once feedback shows */
  correctId?: string | null
  showFeedback: boolean
  onRegionClick: (regionId: string) => void
}

export function MotherboardDiagram({ clickedId, correctId, showFeedback, onRegionClick }: MotherboardDiagramProps) {
  const stroke = 'var(--apple-label-tertiary)'
  const detail = 'var(--apple-separator)'

  return (
    <svg
      viewBox="0 0 200 240"
      role="img"
      aria-label="Motherboard diagram"
      className="w-full max-w-[440px] mx-auto select-none"
    >
      {/* Board */}
      <rect x="8" y="8" width="184" height="224" rx="6" fill="var(--apple-fill)" stroke={stroke} strokeWidth="1" />
      {/* Mounting holes */}
      {[[16, 16], [184, 16], [16, 224], [184, 224]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" fill="none" stroke={detail} strokeWidth="0.8" />
      ))}

      {/* Rear I/O block */}
      <rect x="14" y="16" width="22" height="58" rx="2" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      {[22, 32, 42, 52, 62].map((y) => (
        <rect key={y} x="18" y={y} width="14" height="6" rx="1" fill="none" stroke={detail} strokeWidth="0.7" />
      ))}

      {/* 8-pin CPU power */}
      <rect x="96" y="14" width="24" height="12" rx="1.5" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={98 + i * 5.5} y="16" width="3.6" height="3.6" fill={detail} />
          <rect x={98 + i * 5.5} y="20.5" width="3.6" height="3.6" fill={detail} />
        </g>
      ))}

      {/* CPU fan header */}
      <rect x="130" y="14" width="14" height="10" rx="1" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={132 + i * 2.8} y="17" width="1.6" height="4" fill={detail} />
      ))}

      {/* CPU socket */}
      <rect x="58" y="36" width="44" height="44" rx="2" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="1" />
      <rect x="65" y="43" width="30" height="30" fill="none" stroke={detail} strokeWidth="0.8" />
      <path d="M 60 38 l 5 5 M 100 38 l -5 5 M 60 78 l 5 -5 M 100 78 l -5 -5" stroke={detail} strokeWidth="0.7" fill="none" />
      <circle cx="80" cy="58" r="3" fill="none" stroke={detail} strokeWidth="0.7" />

      {/* RAM slots (4 DIMMs) */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={122 + i * 10} y="32" width="5" height="56" rx="1" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
          <line x1={124.5 + i * 10} y1="56" x2={124.5 + i * 10} y2="64" stroke={detail} strokeWidth="1.4" />
        </g>
      ))}

      {/* 24-pin ATX power */}
      <rect x="168" y="96" width="16" height="44" rx="2" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <rect x="170.5" y={99 + r * 6.6} width="4" height="4" fill={detail} />
          <rect x="177.5" y={99 + r * 6.6} width="4" height="4" fill={detail} />
        </g>
      ))}

      {/* Chipset heatsink */}
      <rect x="86" y="104" width="32" height="32" rx="3" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.9" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={91 + i * 7.5} y1="108" x2={91 + i * 7.5} y2="132" stroke={detail} strokeWidth="1.2" />
      ))}

      {/* CMOS battery */}
      <circle cx="51" cy="119" r="9" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.9" />
      <circle cx="51" cy="119" r="5.5" fill="none" stroke={detail} strokeWidth="0.6" />
      <text x="51" y="121.5" textAnchor="middle" fontSize="5" fill={stroke} fontFamily="monospace">+</text>

      {/* M.2 slot */}
      <rect x="46" y="148" width="74" height="7" rx="1.5" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      <line x1="58" y1="149" x2="58" y2="155" stroke={detail} strokeWidth="0.8" />
      <circle cx="126" cy="151.5" r="2.4" fill="none" stroke={detail} strokeWidth="0.8" />

      {/* PCIe x16 */}
      <rect x="24" y="170" width="118" height="8" rx="1.5" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      <line x1="38" y1="171" x2="38" y2="177" stroke={detail} strokeWidth="0.8" />
      <line x1="134" y1="171" x2="134" y2="177" stroke={detail} strokeWidth="0.8" />

      {/* PCIe x1 */}
      <rect x="24" y="188" width="38" height="7" rx="1.5" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      <line x1="34" y1="189" x2="34" y2="194" stroke={detail} strokeWidth="0.8" />

      {/* SATA ports (4, L-shaped) */}
      {[0, 1].map((row) => [0, 1].map((col) => (
        <path
          key={`${row}-${col}`}
          d={`M ${152 + col * 17} ${166 + row * 14} h 13 v 7 h -5 v -3 h -8 z`}
          fill="var(--apple-bg-secondary)"
          stroke={stroke}
          strokeWidth="0.8"
        />
      )))}

      {/* Front-panel header */}
      <rect x="152" y="206" width="32" height="14" rx="1.5" fill="var(--apple-bg-secondary)" stroke={stroke} strokeWidth="0.8" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x={155.5 + i * 5.6} y="208.5" width="2.6" height="2.6" fill={detail} />
          <rect x={155.5 + i * 5.6} y="213.5" width="2.6" height="2.6" fill={detail} />
        </g>
      ))}

      {/* Hit areas + feedback highlights (rendered on top) */}
      {MOTHERBOARD_REGIONS.map((r) => {
        const isCorrectTarget = showFeedback && r.id === correctId
        const isWrongClick = showFeedback && r.id === clickedId && clickedId !== correctId
        return (
          <rect
            key={r.id}
            x={r.x - 2}
            y={r.y - 2}
            width={r.w + 4}
            height={r.h + 4}
            rx="3"
            fill={isCorrectTarget ? 'rgba(52,199,89,0.25)' : isWrongClick ? 'rgba(255,59,48,0.25)' : 'transparent'}
            stroke={isCorrectTarget ? '#34C759' : isWrongClick ? '#FF3B30' : 'transparent'}
            strokeWidth="1.5"
            className={showFeedback ? undefined : 'cursor-pointer hover:stroke-[var(--apple-blue)] hover:fill-[rgba(0,122,255,0.08)]'}
            onClick={showFeedback ? undefined : () => onRegionClick(r.id)}
          >
            <title>{showFeedback ? r.label : ''}</title>
          </rect>
        )
      })}
    </svg>
  )
}
