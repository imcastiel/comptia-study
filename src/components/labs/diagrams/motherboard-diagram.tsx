'use client'

/**
 * Realistic ATX motherboard illustration for hotspot identification PBQs.
 *
 * Rendered as detailed SVG rather than a photograph: identical exam value,
 * zero image-licensing risk for a public repo, crisp at any size. Colors
 * mimic real hardware (matte-black PCB, aluminum heatsinks, gold contacts)
 * and are intentionally not theme tokens — a circuit board looks the same
 * in light and dark mode. Components are unlabeled: identifying them IS
 * the exercise.
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
  { id: 'rear-io', label: 'Rear I/O panel', x: 14, y: 16, w: 24, h: 62 },
  { id: 'cpu-power-8pin', label: '8-pin CPU power (EPS12V)', x: 92, y: 13, w: 26, h: 13 },
  { id: 'fan-header', label: 'CPU fan header', x: 128, y: 13, w: 15, h: 10 },
  { id: 'cpu-socket', label: 'CPU socket', x: 56, y: 34, w: 48, h: 48 },
  { id: 'ram-slots', label: 'RAM (DIMM) slots', x: 118, y: 30, w: 44, h: 60 },
  { id: 'atx-24pin', label: '24-pin ATX power connector', x: 167, y: 94, w: 17, h: 46 },
  { id: 'chipset', label: 'Chipset heatsink', x: 84, y: 102, w: 34, h: 34 },
  { id: 'cmos-battery', label: 'CMOS battery', x: 40, y: 107, w: 23, h: 23 },
  { id: 'm2-slot', label: 'M.2 slot', x: 44, y: 146, w: 88, h: 13 },
  { id: 'pcie-x16', label: 'PCIe x16 slot', x: 22, y: 168, w: 122, h: 11 },
  { id: 'pcie-x1', label: 'PCIe x1 slot', x: 22, y: 187, w: 40, h: 9 },
  { id: 'sata-ports', label: 'SATA ports', x: 148, y: 160, w: 38, h: 32 },
  { id: 'front-panel-header', label: 'Front-panel header', x: 150, y: 204, w: 34, h: 15 },
]

interface MotherboardDiagramProps {
  clickedId?: string | null
  correctId?: string | null
  showFeedback: boolean
  onRegionClick: (regionId: string) => void
}

export function MotherboardDiagram({ clickedId, correctId, showFeedback, onRegionClick }: MotherboardDiagramProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      role="img"
      aria-label="Motherboard photo-style diagram"
      className="w-full max-w-[460px] mx-auto select-none rounded-[10px]"
    >
      <defs>
        <linearGradient id="mb-alu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9aa3ad" />
          <stop offset="45%" stopColor="#717a85" />
          <stop offset="55%" stopColor="#5d656f" />
          <stop offset="100%" stopColor="#8b939d" />
        </linearGradient>
        <linearGradient id="mb-alu-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8d959f" />
          <stop offset="50%" stopColor="#646c76" />
          <stop offset="100%" stopColor="#979fa9" />
        </linearGradient>
        <radialGradient id="mb-coin" cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#e8eaec" />
          <stop offset="55%" stopColor="#b9bdc2" />
          <stop offset="100%" stopColor="#84888d" />
        </radialGradient>
        <linearGradient id="mb-pcb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#23272c" />
          <stop offset="100%" stopColor="#16191d" />
        </linearGradient>
        <linearGradient id="mb-socket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8ccd0" />
          <stop offset="100%" stopColor="#9b9fa4" />
        </linearGradient>
        <pattern id="mb-pins" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.55" fill="#7d828a" />
        </pattern>
        <pattern id="mb-grille" width="4.4" height="8" patternUnits="userSpaceOnUse">
          <rect width="2.6" height="8" fill="#454d57" />
        </pattern>
      </defs>

      {/* ── PCB ── */}
      <rect x="8" y="8" width="184" height="224" rx="5" fill="url(#mb-pcb)" stroke="#0b0d0f" strokeWidth="1" />
      {/* Copper traces */}
      <g stroke="#3a4148" strokeWidth="0.5" fill="none" opacity="0.8">
        <path d="M 40 90 h 28 v 14 M 104 86 v 12 h -16 M 150 92 h 14 M 70 140 v -8 h 12" />
        <path d="M 30 160 v -18 h 10 M 140 150 h 18 v 8 M 56 200 h 30 M 100 184 v 16 h 24" />
        <path d="M 120 120 h 24 v 16 M 36 84 v 18 M 160 36 v 40 M 48 38 h -10 v 30" />
      </g>
      <g stroke="#2c3239" strokeWidth="1.1" fill="none" opacity="0.9">
        <path d="M 24 86 h 56 M 118 96 h 40 M 44 138 h 36 M 148 152 v 44" />
      </g>
      {/* Mounting holes */}
      {[[15, 15], [185, 15], [15, 225], [185, 225], [100, 92]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="2.6" fill="#0e1012" />
          <circle cx={cx} cy={cy} r="2.6" fill="none" stroke="#b08d3f" strokeWidth="0.9" />
        </g>
      ))}
      {/* Silkscreen board name (generic — no component giveaways) */}
      <text x="100" y="232" textAnchor="middle" fontSize="4.2" fill="#5a626b" fontFamily="monospace" letterSpacing="0.5">APEX  B760-PRO</text>

      {/* ── Rear I/O stack ── */}
      <rect x="14" y="16" width="24" height="62" rx="2" fill="#2c3138" stroke="#0e1012" strokeWidth="0.8" />
      {/* PS/2 + USB block */}
      <rect x="17" y="19" width="18" height="8" rx="1" fill="#10437a" />
      <rect x="18.5" y="21" width="15" height="4" rx="0.8" fill="#0a2c52" />
      <rect x="17" y="30" width="18" height="8" rx="1" fill="#10437a" />
      <rect x="18.5" y="32" width="15" height="4" rx="0.8" fill="#0a2c52" />
      {/* USB-C + USB-A red */}
      <rect x="17" y="41" width="18" height="7" rx="1" fill="#8a1f1f" />
      <rect x="18.5" y="42.8" width="15" height="3.4" rx="1.6" fill="#3d0d0d" />
      {/* RJ45 */}
      <rect x="17" y="51" width="18" height="10" rx="1" fill="#b9bdc2" />
      <rect x="19.5" y="53" width="13" height="6" fill="#23272c" />
      <rect x="23.5" y="51.5" width="5" height="2.2" fill="#23272c" />
      {/* Audio jacks */}
      {[['#3f9e3f', 19.5], ['#3f6dbf', 25.5], ['#c46ab0', 31.5]].map(([color, cx]) => (
        <g key={String(cx)}>
          <circle cx={Number(cx)} cy="69" r="2.7" fill={String(color)} />
          <circle cx={Number(cx)} cy="69" r="1.1" fill="#101214" />
        </g>
      ))}

      {/* ── VRM heatsinks around socket ── */}
      <rect x="44" y="28" width="10" height="52" rx="2" fill="url(#mb-alu)" stroke="#3c4249" strokeWidth="0.5" />
      {[31, 37, 43, 49, 55, 61, 67, 73].map((y) => <line key={y} x1="44" y1={y} x2="54" y2={y} stroke="#565e68" strokeWidth="0.7" />)}
      <rect x="56" y="20" width="48" height="10" rx="2" fill="url(#mb-alu-h)" stroke="#3c4249" strokeWidth="0.5" />
      {[60, 66, 72, 78, 84, 90, 96].map((x) => <line key={x} x1={x} y1="20" x2={x} y2="30" stroke="#565e68" strokeWidth="0.7" />)}

      {/* ── 8-pin EPS power ── */}
      <rect x="92" y="13" width="26" height="13" rx="1.5" fill="#101214" stroke="#33383f" strokeWidth="0.7" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={94.5 + i * 6} y="15" width="4" height="4" rx="0.8" fill="#23272c" stroke="#454d57" strokeWidth="0.5" />
          <rect x={94.5 + i * 6} y="20.5" width="4" height="4" rx="0.8" fill="#23272c" stroke="#454d57" strokeWidth="0.5" />
        </g>
      ))}

      {/* ── CPU fan header ── */}
      <rect x="128" y="13" width="15" height="10" rx="1" fill="#16191d" stroke="#33383f" strokeWidth="0.6" />
      <rect x="129.5" y="14.5" width="12" height="2" fill="#0e1012" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={131 + i * 2.6} y="16.5" width="1.3" height="4.5" fill="#c9a23f" />)}

      {/* ── CPU socket (LGA, lid off) ── */}
      <rect x="56" y="34" width="48" height="48" rx="2.5" fill="url(#mb-socket)" stroke="#6b7077" strokeWidth="0.8" />
      <rect x="62" y="40" width="36" height="36" rx="1" fill="#454a51" />
      <rect x="64" y="42" width="32" height="32" fill="url(#mb-pins)" />
      {/* notches + arrow */}
      <rect x="60" y="55" width="3" height="6" fill="url(#mb-socket)" />
      <rect x="97" y="55" width="3" height="6" fill="url(#mb-socket)" />
      <path d="M 59 37 l 4 0 l -4 4 z" fill="#c9a23f" />
      {/* retention lever */}
      <line x1="102" y1="44" x2="108" y2="60" stroke="#9b9fa4" strokeWidth="1.8" strokeLinecap="round" />
      <text x="80" y="87" textAnchor="middle" fontSize="3.4" fill="#5a626b" fontFamily="monospace">LGA1700</text>

      {/* ── DIMM slots ── */}
      {[0, 1, 2, 3].map((i) => {
        const x = 120 + i * 11
        const slotBody = i % 2 === 0 ? '#16191d' : '#3a3f46'
        return (
          <g key={i}>
            <rect x={x} y="30" width="6.5" height="60" rx="1" fill={slotBody} stroke="#0e1012" strokeWidth="0.6" />
            {/* gold contact channel */}
            <rect x={x + 2.4} y="34" width="1.7" height="52" fill="#8a6d28" />
            <rect x={x + 2.4} y="56" width="1.7" height="4" fill={slotBody} />
            {/* latches */}
            <rect x={x + 0.8} y="27.5" width="4.9" height="4" rx="1" fill="#d9dadc" />
            <rect x={x + 0.8} y="88.5" width="4.9" height="4" rx="1" fill="#d9dadc" />
          </g>
        )
      })}

      {/* ── 24-pin ATX power ── */}
      <rect x="167" y="94" width="17" height="46" rx="2" fill="#101214" stroke="#33383f" strokeWidth="0.8" />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <rect x="169.3" y={96.8 + r * 7} width="5" height="5" rx="1" fill="#23272c" stroke="#454d57" strokeWidth="0.5" />
          <rect x="176.6" y={96.8 + r * 7} width="5" height="5" rx="1" fill="#23272c" stroke="#454d57" strokeWidth="0.5" />
        </g>
      ))}
      {/* clip */}
      <rect x="165.4" y="110" width="2" height="14" rx="1" fill="#33383f" />

      {/* ── Chipset heatsink ── */}
      <rect x="84" y="102" width="34" height="34" rx="3" fill="url(#mb-alu)" stroke="#3c4249" strokeWidth="0.6" />
      <rect x="84" y="102" width="34" height="34" rx="3" fill="url(#mb-grille)" opacity="0.45" />
      <rect x="92" y="110" width="18" height="18" rx="2" fill="#2c3138" stroke="#454d57" strokeWidth="0.5" />
      <text x="101" y="121.5" textAnchor="middle" fontSize="4" fill="#9aa3ad" fontFamily="monospace">APEX</text>

      {/* ── CMOS battery ── */}
      <circle cx="51.5" cy="118.5" r="10.5" fill="#16191d" stroke="#33383f" strokeWidth="0.8" />
      <circle cx="51.5" cy="118.5" r="9" fill="url(#mb-coin)" stroke="#6b7077" strokeWidth="0.5" />
      <text x="51.5" y="117.5" textAnchor="middle" fontSize="3.2" fill="#4a4e54" fontFamily="monospace" fontWeight="bold">CR2032</text>
      <text x="51.5" y="122" textAnchor="middle" fontSize="3.6" fill="#4a4e54" fontFamily="monospace">3V  +</text>
      <path d="M 60 113 a 10.5 10.5 0 0 1 0 11" fill="none" stroke="#d9dadc" strokeWidth="1.2" />

      {/* ── Capacitors + chokes (set dressing) ── */}
      {[[110, 92], [70, 96], [126, 142], [38, 198], [70, 206], [96, 208]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="3" fill="#1d2125" stroke="#454d57" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r="1.9" fill="#6e7680" />
          <path d={`M ${Number(cx) - 1.6} ${cy} h 3.2 M ${cx} ${Number(cy) - 1.6} v 3.2`} stroke="#1d2125" strokeWidth="0.5" />
        </g>
      ))}
      {[[60, 14], [74, 14]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="1.5" fill="#33383f" stroke="#454d57" strokeWidth="0.5" />
      ))}

      {/* ── M.2 slot with standoff ── */}
      <rect x="44" y="146" width="74" height="8" rx="1.2" fill="#16191d" stroke="#33383f" strokeWidth="0.6" />
      <rect x="46" y="148.4" width="62" height="3.2" fill="#0e1012" />
      <rect x="52" y="148.4" width="2" height="3.2" fill="#8a6d28" />
      <text x="47" y="144.5" fontSize="3" fill="#5a626b" fontFamily="monospace">M2_1</text>
      <circle cx="126" cy="150" r="3" fill="#b08d3f" stroke="#8a6d28" strokeWidth="0.6" />
      <circle cx="126" cy="150" r="1.2" fill="#23272c" />

      {/* ── PCIe x16 (steel-reinforced) ── */}
      <rect x="22" y="168" width="122" height="9" rx="1.2" fill="#9aa3ad" stroke="#6b7077" strokeWidth="0.7" />
      <rect x="24" y="170" width="103" height="5" rx="0.8" fill="#101214" />
      <rect x="36" y="170" width="2.4" height="5" fill="#33383f" />
      {/* retention latch */}
      <rect x="138" y="169" width="5" height="7" rx="1.2" fill="#d9dadc" />
      <text x="24" y="166" fontSize="3" fill="#5a626b" fontFamily="monospace">PCIE_1 x16</text>

      {/* ── PCIe x1 ── */}
      <rect x="22" y="187" width="40" height="8" rx="1.2" fill="#16191d" stroke="#33383f" strokeWidth="0.6" />
      <rect x="24" y="189" width="29" height="4" rx="0.6" fill="#0e1012" />
      <rect x="32" y="189" width="2" height="4" fill="#33383f" />

      {/* ── SATA ports (stacked, right-angle) ── */}
      {[0, 1].map((row) => [0, 1].map((col) => {
        const x = 150 + col * 19
        const y = 162 + row * 15
        return (
          <g key={`${row}-${col}`}>
            <rect x={x} y={y} width="15" height="9" rx="1" fill={row === 0 ? '#8a1f1f' : '#16191d'} stroke="#0e1012" strokeWidth="0.6" />
            <path d={`M ${x + 2} ${y + 3} h 9 v 3 h -4 v -1.4 h -5 z`} fill="#0e1012" />
          </g>
        )
      }))}
      <text x="150" y="158.5" fontSize="3" fill="#5a626b" fontFamily="monospace">SATA 6G</text>

      {/* ── Front-panel header ── */}
      <rect x="150" y="204" width="34" height="15" rx="1.5" fill="#16191d" stroke="#33383f" strokeWidth="0.6" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x={153 + i * 6} y="206.5" width="2.4" height="3.6" fill="#c9a23f" />
          <rect x={153 + i * 6} y="212" width="2.4" height="3.6" fill={i === 4 ? '#16191d' : '#c9a23f'} />
        </g>
      ))}
      <text x="150" y="226" fontSize="3" fill="#5a626b" fontFamily="monospace">F_PANEL</text>

      {/* ── Hit areas + feedback highlights ── */}
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
            fill={isCorrectTarget ? 'rgba(52,199,89,0.28)' : isWrongClick ? 'rgba(255,59,48,0.28)' : 'transparent'}
            stroke={isCorrectTarget ? '#34C759' : isWrongClick ? '#FF3B30' : 'transparent'}
            strokeWidth="1.5"
            className={showFeedback ? undefined : 'cursor-pointer hover:stroke-[#4da3ff] hover:fill-[rgba(77,163,255,0.12)]'}
            onClick={showFeedback ? undefined : () => onRegionClick(r.id)}
          >
            <title>{showFeedback ? r.label : ''}</title>
          </rect>
        )
      })}
    </svg>
  )
}
