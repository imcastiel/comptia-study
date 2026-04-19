/**
 * SVG front-face connector diagrams for cables & connectors lesson.
 * Each connector is drawn to scale relative to each other where possible.
 * Professional-grade visuals with gradients, shadows, and realistic detail.
 */

interface ConnectorSpec {
  id: string
  label: string
  sublabel?: string
  svg: React.ReactNode
  color?: string
}

interface ConnectorGalleryProps {
  title?: string
  connectors: ConnectorSpec[]
}

// ─── Individual connector SVGs ────────────────────────────────────────────────

function RJ45() {
  return (
    <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rj45-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="40%" stopColor="#e8e8ed" />
          <stop offset="100%" stopColor="#d1d1d6" />
        </linearGradient>
        <linearGradient id="rj45-clip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="rj45-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <linearGradient id="rj45-pin-highlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
        <filter id="rj45-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Main body */}
      <rect x="6" y="6" width="52" height="38" rx="3.5" fill="url(#rj45-body)" stroke="#aeaeb2" strokeWidth="1.2" filter="url(#rj45-shadow)" />

      {/* Body sheen */}
      <rect x="6" y="6" width="52" height="18" rx="3.5" fill="white" opacity="0.12" />

      {/* Clip tab */}
      <path d="M22 2 Q22 0 24 0 L40 0 Q42 0 42 2 L42 10 Q42 11 41 11 L23 11 Q22 11 22 10 Z" fill="url(#rj45-clip)" stroke="#aeaeb2" strokeWidth="1" />
      {/* Clip tab ridge */}
      <rect x="26" y="3" width="12" height="1.5" rx="0.75" fill="#c7c7cc" />
      <rect x="26" y="6" width="12" height="1.5" rx="0.75" fill="#c7c7cc" />

      {/* Pin cavity */}
      <rect x="11" y="30" width="42" height="10" rx="1.5" fill="#c7c7cc" />

      {/* Internal wire colors (T-568B standard) */}
      {[
        '#FF6B35', '#FFFFFF', '#4CAF50', '#007AFF',
        '#FFFFFF', '#4CAF50', '#FF6B35', '#795548'
      ].map((wireColor, i) => (
        <g key={`wire-${i}`}>
          <rect
            x={13.5 + i * 5} y={12}
            width="2.8" height="17"
            rx="1.2"
            fill={wireColor}
            stroke={wireColor === '#FFFFFF' ? '#d1d1d6' : wireColor}
            strokeWidth="0.4"
            opacity="0.85"
          />
          {/* Wire stripe for white wires */}
          {wireColor === '#FFFFFF' && (
            <line
              x1={14.9 + i * 5} y1={13}
              x2={14.9 + i * 5} y2={28}
              stroke={i === 1 ? '#4CAF50' : i === 4 ? '#007AFF' : '#FF6B35'}
              strokeWidth="0.8"
              strokeDasharray="2,2"
              opacity="0.5"
            />
          )}
        </g>
      ))}

      {/* 8 gold pins */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <g key={`pin-${i}`}>
          <rect
            x={13 + i * 5} y={30}
            width="3.2" height="9.5"
            rx="0.6"
            fill="url(#rj45-pin)"
            stroke="#a07800"
            strokeWidth="0.4"
          />
          {/* Pin highlight */}
          <rect
            x={13 + i * 5} y={30}
            width="3.2" height="9.5"
            rx="0.6"
            fill="url(#rj45-pin-highlight)"
          />
          {/* Pin contact tip */}
          <rect
            x={13.4 + i * 5} y={30.5}
            width="2.4" height="2"
            rx="0.3"
            fill="#FFE066"
            opacity="0.6"
          />
        </g>
      ))}
    </svg>
  )
}

function USBTypeA() {
  return (
    <svg viewBox="0 0 52 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usba-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="30%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="usba-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="usba-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="usba-contact" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="usba-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Metal housing */}
      <rect x="2" y="2" width="48" height="26" rx="2.5" fill="url(#usba-housing)" stroke="#8e8e93" strokeWidth="1.2" filter="url(#usba-shadow)" />
      {/* Metallic sheen */}
      <rect x="2" y="2" width="48" height="12" rx="2.5" fill="url(#usba-sheen)" />

      {/* Internal cavity */}
      <rect x="6" y="5.5" width="40" height="19" rx="1.5" fill="url(#usba-cavity)" />

      {/* White tongue/wafer */}
      <rect x="7" y="14" width="38" height="9.5" rx="1" fill="#f5f5f7" opacity="0.9" />

      {/* 4 gold contacts */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect
            x={10 + i * 9} y={7}
            width="5.5" height="11"
            rx="0.8"
            fill="url(#usba-contact)"
            stroke="#a07800"
            strokeWidth="0.3"
          />
          {/* Contact highlight */}
          <rect
            x={10 + i * 9} y={7}
            width="2.5" height="11"
            rx="0.8"
            fill="white"
            opacity="0.15"
          />
        </g>
      ))}
    </svg>
  )
}

function USBTypeABlue() {
  return (
    <svg viewBox="0 0 52 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usba3-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="30%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="usba3-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="usba3-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5fa8" />
          <stop offset="100%" stopColor="#0e3d6e" />
        </linearGradient>
        <linearGradient id="usba3-contact" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="usba3-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Blue metal housing */}
      <rect x="2" y="2" width="48" height="26" rx="2.5" fill="url(#usba3-housing)" stroke="#007AFF" strokeWidth="1.2" filter="url(#usba3-shadow)" />
      <rect x="2" y="2" width="48" height="12" rx="2.5" fill="url(#usba3-sheen)" />

      {/* Blue cavity */}
      <rect x="6" y="5.5" width="40" height="19" rx="1.5" fill="url(#usba3-cavity)" />

      {/* Blue tongue */}
      <rect x="7" y="14" width="38" height="9.5" rx="1" fill="#2563EB" opacity="0.4" />

      {/* 4 gold contacts (USB 2.0 row) */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect
            x={10 + i * 9} y={7}
            width="5.5" height="6"
            rx="0.8"
            fill="url(#usba3-contact)"
            stroke="#a07800"
            strokeWidth="0.3"
          />
        </g>
      ))}
      {/* 5 extra contacts (USB 3.0 row) */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect
            x={9 + i * 7.2} y={15}
            width="4" height="5"
            rx="0.5"
            fill="url(#usba3-contact)"
            stroke="#a07800"
            strokeWidth="0.3"
            opacity="0.85"
          />
        </g>
      ))}
    </svg>
  )
}

function USBTypeB() {
  return (
    <svg viewBox="0 0 44 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usbb-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="40%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="usbb-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="usbb-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="usbb-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Square with beveled top */}
      <path
        d="M10 4 L34 4 L42 14 L42 46 Q42 48 40 48 L4 48 Q2 48 2 46 L2 14 Z"
        fill="url(#usbb-housing)"
        stroke="#8e8e93"
        strokeWidth="1.2"
        filter="url(#usbb-shadow)"
      />
      {/* Sheen */}
      <path d="M10 4 L34 4 L42 14 L2 14 Z" fill="white" opacity="0.1" />

      {/* Cavity */}
      <path d="M12 10 L32 10 L38 18 L38 42 L6 42 L6 18 Z" fill="url(#usbb-cavity)" />

      {/* 4 pins */}
      <rect x="10" y="20" width="8" height="8" rx="1.2" fill="url(#usbb-pin)" stroke="#a07800" strokeWidth="0.4" />
      <rect x="26" y="20" width="8" height="8" rx="1.2" fill="url(#usbb-pin)" stroke="#a07800" strokeWidth="0.4" />
      <rect x="10" y="32" width="8" height="6" rx="1.2" fill="url(#usbb-pin)" stroke="#a07800" strokeWidth="0.4" />
      <rect x="26" y="32" width="8" height="6" rx="1.2" fill="url(#usbb-pin)" stroke="#a07800" strokeWidth="0.4" />
    </svg>
  )
}

function USBMicroB() {
  return (
    <svg viewBox="0 0 40 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usbmicro-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="usbmicro-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="usbmicro-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="usbmicro-shadow">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Trapezoid housing */}
      <path
        d="M6 2 L34 2 Q36 2 37 4 L37 18 Q37 20 35 20 L5 20 Q3 20 3 18 L3 4 Q4 2 6 2 Z"
        fill="url(#usbmicro-housing)"
        stroke="#8e8e93"
        strokeWidth="1"
        filter="url(#usbmicro-shadow)"
      />

      {/* Cavity with characteristic wedge shape */}
      <path d="M8 5 L32 5 L35 8 L35 17 L5 17 L5 8 Z" fill="url(#usbmicro-cavity)" />

      {/* 5 micro pins */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect
          key={i}
          x={9 + i * 4.8} y={7.5}
          width="2.8" height="7"
          rx="0.5"
          fill="url(#usbmicro-pin)"
          stroke="#a07800"
          strokeWidth="0.3"
        />
      ))}
    </svg>
  )
}

function USBTypeC() {
  return (
    <svg viewBox="0 0 40 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="usbc-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ed" />
          <stop offset="30%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="usbc-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="usbc-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="usbc-contact" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="usbc-shadow">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Oval housing */}
      <rect x="2" y="2" width="36" height="14" rx="7" fill="url(#usbc-housing)" stroke="#8e8e93" strokeWidth="1.2" filter="url(#usbc-shadow)" />
      <rect x="2" y="2" width="36" height="7" rx="7" fill="url(#usbc-sheen)" />

      {/* Cavity */}
      <rect x="5" y="4.5" width="30" height="9" rx="4.5" fill="url(#usbc-cavity)" />

      {/* Tongue (center wafer) */}
      <rect x="7" y="6.5" width="26" height="5" rx="2.5" fill="#48484A" />

      {/* Top contact row (12 pins) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
        <rect
          key={`top-${i}`}
          x={9 + i * 2} y={5.5}
          width="1.2" height="2.5"
          rx="0.3"
          fill="url(#usbc-contact)"
          opacity="0.9"
        />
      ))}

      {/* Bottom contact row (12 pins) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
        <rect
          key={`bot-${i}`}
          x={9 + i * 2} y={10}
          width="1.2" height="2.5"
          rx="0.3"
          fill="url(#usbc-contact)"
          opacity="0.75"
        />
      ))}
    </svg>
  )
}

function HDMI() {
  return (
    <svg viewBox="0 0 68 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hdmi-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A3C" />
          <stop offset="40%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="hdmi-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hdmi-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="hdmi-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Trapezoid housing -- wider at top, narrower at bottom */}
      <path
        d="M4 3 L64 3 Q65 3 65 4 L61 27 Q60 28 59 28 L9 28 Q8 28 7 27 L3 4 Q3 3 4 3 Z"
        fill="url(#hdmi-housing)"
        stroke="#636366"
        strokeWidth="1.2"
        filter="url(#hdmi-shadow)"
      />
      {/* Top edge sheen */}
      <path d="M5 3 L63 3 L62 10 L6 10 Z" fill="url(#hdmi-sheen)" />

      {/* Inner cavity edge */}
      <path
        d="M8 6 L60 6 L57 25 L11 25 Z"
        fill="none"
        stroke="#48484A"
        strokeWidth="0.5"
      />

      {/* 19 pins -- top row */}
      {Array.from({ length: 19 }).map((_, i) => (
        <rect
          key={`top-${i}`}
          x={9 + i * 2.6} y={8}
          width="1.6" height="5"
          rx="0.3"
          fill="url(#hdmi-pin)"
          opacity={0.95}
        />
      ))}

      {/* 19 pins -- bottom row (offset) */}
      {Array.from({ length: 19 }).map((_, i) => (
        <rect
          key={`bot-${i}`}
          x={10.3 + i * 2.6} y={15}
          width="1.6" height="4"
          rx="0.3"
          fill="url(#hdmi-pin)"
          opacity={0.7}
        />
      ))}

      {/* HDMI label embossed */}
      <text
        x="34" y="25"
        textAnchor="middle"
        fontSize="4.5"
        fill="#636366"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1.5"
        opacity="0.5"
      >
        HDMI
      </text>
    </svg>
  )
}

function DisplayPort() {
  return (
    <svg viewBox="0 0 66 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dp-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A3C" />
          <stop offset="40%" stopColor="#2C2C2E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </linearGradient>
        <linearGradient id="dp-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dp-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <filter id="dp-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Rectangle with one chamfered (bottom-left) corner */}
      <path
        d="M5 3 L62 3 Q63 3 63 4 L63 26 Q63 27 62 27 L12 27 L5 20 L5 4 Q5 3 6 3 Z"
        fill="url(#dp-housing)"
        stroke="#636366"
        strokeWidth="1.2"
        filter="url(#dp-shadow)"
      />
      {/* Sheen */}
      <path d="M6 3 L62 3 L62 12 L6 12 Z" fill="url(#dp-sheen)" />

      {/* Cavity outline */}
      <path
        d="M9 6 L59 6 L59 24 L14 24 L9 19 Z"
        fill="none"
        stroke="#48484A"
        strokeWidth="0.5"
      />

      {/* 20 pins -- top row */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect
          key={`top-${i}`}
          x={10 + i * 2.5} y={8}
          width="1.5" height="4.5"
          rx="0.3"
          fill="url(#dp-pin)"
          opacity={0.95}
        />
      ))}

      {/* 20 pins -- bottom row */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect
          key={`bot-${i}`}
          x={11.2 + i * 2.5} y={14}
          width="1.5" height="4.5"
          rx="0.3"
          fill="url(#dp-pin)"
          opacity={0.7}
        />
      ))}

      {/* DP label */}
      <text
        x="40" y="24"
        textAnchor="middle"
        fontSize="4"
        fill="#636366"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
        opacity="0.4"
      >
        DP
      </text>
    </svg>
  )
}

function VGA() {
  return (
    <svg viewBox="0 0 76 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vga-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="30%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="vga-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vga-screw" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#8e8e93" />
          <stop offset="100%" stopColor="#48484A" />
        </radialGradient>
        <linearGradient id="vga-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7c7cc" />
          <stop offset="100%" stopColor="#8e8e93" />
        </linearGradient>
        <filter id="vga-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* D-sub shaped housing */}
      <path
        d="M6 6 L70 6 Q72 6 72 8 L72 40 Q72 42 70 42 L6 42 Q4 42 4 40 L4 8 Q4 6 6 6 Z"
        fill="url(#vga-housing)"
        stroke="#8e8e93"
        strokeWidth="1.2"
        filter="url(#vga-shadow)"
      />
      <path d="M6 6 L70 6 L72 8 L72 20 L4 20 L4 8 Z" fill="url(#vga-sheen)" />

      {/* Screw lock -- left */}
      <circle cx="11" cy="24" r="4.5" fill="url(#vga-screw)" stroke="#636366" strokeWidth="0.8" />
      <line x1="8" y1="24" x2="14" y2="24" stroke="#48484A" strokeWidth="0.8" />
      <line x1="11" y1="21" x2="11" y2="27" stroke="#48484A" strokeWidth="0.8" />
      {/* Inner ring */}
      <circle cx="11" cy="24" r="2" fill="none" stroke="#636366" strokeWidth="0.5" />

      {/* Screw lock -- right */}
      <circle cx="65" cy="24" r="4.5" fill="url(#vga-screw)" stroke="#636366" strokeWidth="0.8" />
      <line x1="62" y1="24" x2="68" y2="24" stroke="#48484A" strokeWidth="0.8" />
      <line x1="65" y1="21" x2="65" y2="27" stroke="#48484A" strokeWidth="0.8" />
      <circle cx="65" cy="24" r="2" fill="none" stroke="#636366" strokeWidth="0.5" />

      {/* 15 pins in 3 rows of 5 (DE-15) */}
      {/* Row 1 (top) */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={`r1-${i}`}>
          <circle cx={24 + i * 7} cy={14} r="2.8" fill="url(#vga-pin)" stroke="#636366" strokeWidth="0.6" />
          <circle cx={24 + i * 7} cy={14} r="1" fill="#48484A" />
        </g>
      ))}
      {/* Row 2 (middle) */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={`r2-${i}`}>
          <circle cx={24 + i * 7} cy={24} r="2.8" fill="url(#vga-pin)" stroke="#636366" strokeWidth="0.6" />
          <circle cx={24 + i * 7} cy={24} r="1" fill="#48484A" />
        </g>
      ))}
      {/* Row 3 (bottom) */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={`r3-${i}`}>
          <circle cx={24 + i * 7} cy={34} r="2.8" fill="url(#vga-pin)" stroke="#636366" strokeWidth="0.6" />
          <circle cx={24 + i * 7} cy={34} r="1" fill="#48484A" />
        </g>
      ))}
    </svg>
  )
}

function SATAData() {
  return (
    <svg viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sata-d-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="40%" stopColor="#e8e8ed" />
          <stop offset="100%" stopColor="#d1d1d6" />
        </linearGradient>
        <linearGradient id="sata-d-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sata-d-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8e8e93" />
          <stop offset="100%" stopColor="#48484A" />
        </linearGradient>
        <filter id="sata-d-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* L-shaped body */}
      <path
        d="M3 2 L31 2 Q32 2 32 3 L32 22 L20 22 L20 45 Q20 46 19 46 L4 46 Q3 46 3 45 Z"
        fill="url(#sata-d-housing)"
        stroke="#aeaeb2"
        strokeWidth="1.2"
        filter="url(#sata-d-shadow)"
      />
      {/* Sheen */}
      <path d="M3 2 L31 2 L32 3 L32 12 L3 12 Z" fill="url(#sata-d-sheen)" />

      {/* Keying notch */}
      <rect x="20" y="18" width="12" height="4" fill="url(#sata-d-housing)" stroke="#aeaeb2" strokeWidth="0.5" />

      {/* 7 pins */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect
          key={i}
          x={5 + i * 2.2} y={24}
          width="1.6" height="18"
          rx="0.4"
          fill="url(#sata-d-pin)"
          stroke="#636366"
          strokeWidth="0.3"
        />
      ))}

      {/* Label */}
      <text x="12" y="12" fontSize="5.5" fill="#636366" fontWeight="700" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">SATA</text>
      <text x="12" y="18" fontSize="4.5" fill="#aeaeb2" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">7-pin</text>
    </svg>
  )
}

function SATAPower() {
  return (
    <svg viewBox="0 0 56 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sata-p-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="40%" stopColor="#e8e8ed" />
          <stop offset="100%" stopColor="#d1d1d6" />
        </linearGradient>
        <linearGradient id="sata-p-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="sata-p-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* L-shaped body */}
      <path
        d="M3 2 L53 2 Q54 2 54 3 L54 22 L42 22 L42 45 Q42 46 41 46 L4 46 Q3 46 3 45 Z"
        fill="url(#sata-p-housing)"
        stroke="#aeaeb2"
        strokeWidth="1.2"
        filter="url(#sata-p-shadow)"
      />
      <path d="M3 2 L53 2 L54 3 L54 12 L3 12 Z" fill="url(#sata-p-sheen)" />

      {/* Keying notch */}
      <rect x="42" y="18" width="12" height="4" fill="url(#sata-p-housing)" stroke="#aeaeb2" strokeWidth="0.5" />

      {/* 15 pins -- color-coded by voltage */}
      {/* Pins 1-3: 3.3V (orange), 4-6: ground (black), 7-9: 5V (red), 10-12: ground (black), 13-15: 12V (yellow) */}
      {Array.from({ length: 15 }).map((_, i) => {
        let pinColor: string
        if (i < 3) pinColor = '#FF9500'       // 3.3V orange
        else if (i < 6) pinColor = '#1C1C1E'  // ground
        else if (i < 9) pinColor = '#FF3B30'  // 5V red
        else if (i < 12) pinColor = '#1C1C1E' // ground
        else pinColor = '#FFD700'              // 12V yellow

        return (
          <rect
            key={i}
            x={5 + i * 2.4} y={24}
            width="1.6" height="18"
            rx="0.4"
            fill={pinColor}
            stroke={pinColor === '#1C1C1E' ? '#636366' : pinColor}
            strokeWidth="0.3"
            opacity={pinColor === '#1C1C1E' ? 0.8 : 1}
          />
        )
      })}

      {/* Voltage labels */}
      <text x="8.5" y="12" fontSize="4" fill="#FF9500" fontWeight="600" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">3.3V</text>
      <text x="22" y="12" fontSize="4" fill="#FF3B30" fontWeight="600" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">5V</text>
      <text x="38" y="12" fontSize="4" fill="#FFD700" fontWeight="600" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">12V</text>
      <text x="24" y="18" fontSize="4.5" fill="#aeaeb2" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">15-pin</text>
    </svg>
  )
}

function LCFiber() {
  return (
    <svg viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="lc-latch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="lc-ferrule" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ed" />
          <stop offset="50%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <radialGradient id="lc-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <filter id="lc-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.15" />
        </filter>
        <filter id="lc-glow">
          <feGaussianBlur stdDeviation="1" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Push-pull latch */}
      <rect x="9" y="0" width="14" height="7" rx="1.5" fill="url(#lc-latch)" stroke="#0369A1" strokeWidth="0.8" />
      {/* Latch ridges */}
      <rect x="11" y="2" width="10" height="1" rx="0.5" fill="#38BDF8" opacity="0.5" />
      <rect x="11" y="4.5" width="10" height="1" rx="0.5" fill="#38BDF8" opacity="0.3" />

      {/* Main body */}
      <rect x="5" y="4" width="22" height="26" rx="2.5" fill="url(#lc-body)" stroke="#0284C7" strokeWidth="1" filter="url(#lc-shadow)" />
      {/* Body sheen */}
      <rect x="5" y="4" width="10" height="26" rx="2.5" fill="white" opacity="0.12" />

      {/* LC label */}
      <text x="16" y="16" textAnchor="middle" fontSize="7" fill="white" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">LC</text>
      <text x="16" y="23" textAnchor="middle" fontSize="4" fill="white" fontFamily="system-ui, -apple-system, sans-serif" opacity="0.7">1.25mm</text>

      {/* Ferrule */}
      <rect x="11" y="26" width="10" height="16" rx="1.5" fill="url(#lc-ferrule)" stroke="#8e8e93" strokeWidth="0.8" />
      {/* Ferrule sheen */}
      <rect x="11" y="26" width="4" height="16" rx="1.5" fill="white" opacity="0.1" />

      {/* Fiber core */}
      <circle cx="16" cy="36" r="3" fill="#1C1C1E" />
      <circle cx="16" cy="36" r="1.8" fill="url(#lc-core)" filter="url(#lc-glow)" />
      <circle cx="16" cy="36" r="0.6" fill="white" opacity="0.5" />
    </svg>
  )
}

function SCFiber() {
  return (
    <svg viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FFCC00" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="sc-ferrule" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ed" />
          <stop offset="50%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <radialGradient id="sc-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#EAB308" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <filter id="sc-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
        <filter id="sc-glow">
          <feGaussianBlur stdDeviation="1" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Square body */}
      <rect x="4" y="2" width="32" height="34" rx="3.5" fill="url(#sc-body)" stroke="#b8960c" strokeWidth="1.2" filter="url(#sc-shadow)" />
      {/* Body sheen */}
      <rect x="4" y="2" width="14" height="34" rx="3.5" fill="white" opacity="0.15" />

      {/* Snap lock ridge */}
      <rect x="8" y="5" width="24" height="3" rx="1.5" fill="#EAB308" opacity="0.5" />

      {/* SC label */}
      <text x="20" y="20" textAnchor="middle" fontSize="8" fill="#78350F" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">SC</text>
      <text x="20" y="28" textAnchor="middle" fontSize="4" fill="#78350F" fontFamily="system-ui, -apple-system, sans-serif" opacity="0.6">2.5mm</text>

      {/* Ferrule */}
      <rect x="13" y="32" width="14" height="18" rx="2" fill="url(#sc-ferrule)" stroke="#8e8e93" strokeWidth="0.8" />
      <rect x="13" y="32" width="5" height="18" rx="2" fill="white" opacity="0.1" />

      {/* Fiber core */}
      <circle cx="20" cy="43" r="3.5" fill="#1C1C1E" />
      <circle cx="20" cy="43" r="2" fill="url(#sc-core)" filter="url(#sc-glow)" />
      <circle cx="20" cy="43" r="0.7" fill="white" opacity="0.5" />
    </svg>
  )
}

function STFiber() {
  return (
    <svg viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="st-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <radialGradient id="st-face" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="st-ferrule" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ed" />
          <stop offset="50%" stopColor="#d1d1d6" />
          <stop offset="100%" stopColor="#aeaeb2" />
        </linearGradient>
        <linearGradient id="st-tab" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#b8960c" />
        </linearGradient>
        <radialGradient id="st-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9500" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#EA580C" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <filter id="st-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
        <filter id="st-glow">
          <feGaussianBlur stdDeviation="1" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Round bayonet body */}
      <circle cx="20" cy="18" r="15" fill="url(#st-body)" stroke="#C2410C" strokeWidth="1.2" filter="url(#st-shadow)" />
      <circle cx="20" cy="18" r="15" fill="url(#st-face)" />

      {/* Bayonet twist-lock tabs */}
      <rect x="1" y="14" width="6" height="8" rx="1.5" fill="url(#st-tab)" stroke="#C2410C" strokeWidth="0.8" />
      {/* Tab slot */}
      <rect x="2.5" y="17" width="3" height="2" rx="0.5" fill="#7C2D12" opacity="0.4" />

      <rect x="33" y="14" width="6" height="8" rx="1.5" fill="url(#st-tab)" stroke="#C2410C" strokeWidth="0.8" />
      <rect x="34.5" y="17" width="3" height="2" rx="0.5" fill="#7C2D12" opacity="0.4" />

      {/* Inner ring */}
      <circle cx="20" cy="18" r="9" fill="none" stroke="#C2410C" strokeWidth="0.6" opacity="0.4" />

      {/* ST label */}
      <text x="20" y="20" textAnchor="middle" fontSize="7.5" fill="white" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">ST</text>

      {/* Ferrule */}
      <rect x="14" y="30" width="12" height="18" rx="2" fill="url(#st-ferrule)" stroke="#8e8e93" strokeWidth="0.8" />
      <rect x="14" y="30" width="4" height="18" rx="2" fill="white" opacity="0.1" />

      {/* Fiber core */}
      <circle cx="20" cy="42" r="3.5" fill="#1C1C1E" />
      <circle cx="20" cy="42" r="2" fill="url(#st-core)" filter="url(#st-glow)" />
      <circle cx="20" cy="42" r="0.7" fill="white" opacity="0.5" />
    </svg>
  )
}

function CoaxRG6() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coax-jacket" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#3A3A3C" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <radialGradient id="coax-braid" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#8e8e93" />
          <stop offset="100%" stopColor="#636366" />
        </radialGradient>
        <radialGradient id="coax-dielectric" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e8ed" />
        </radialGradient>
        <radialGradient id="coax-center" cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#b8960c" />
        </radialGradient>
        <filter id="coax-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer jacket */}
      <circle cx="22" cy="22" r="18" fill="url(#coax-jacket)" stroke="#48484A" strokeWidth="1.2" filter="url(#coax-shadow)" />
      {/* Jacket sheen */}
      <ellipse cx="18" cy="16" rx="8" ry="6" fill="white" opacity="0.06" />

      {/* Braided shield */}
      <circle cx="22" cy="22" r="13.5" fill="url(#coax-braid)" stroke="#48484A" strokeWidth="0.5" />
      {/* Braid texture lines */}
      {[0, 30, 60, 90, 120, 150].map(angle => (
        <line
          key={angle}
          x1={22 + 10 * Math.cos(angle * Math.PI / 180)}
          y1={22 + 10 * Math.sin(angle * Math.PI / 180)}
          x2={22 + 13.5 * Math.cos(angle * Math.PI / 180)}
          y2={22 + 13.5 * Math.sin(angle * Math.PI / 180)}
          stroke="#aeaeb2"
          strokeWidth="0.4"
          opacity="0.5"
        />
      ))}

      {/* Dielectric insulator */}
      <circle cx="22" cy="22" r="9.5" fill="url(#coax-dielectric)" stroke="#d1d1d6" strokeWidth="0.5" />

      {/* Center conductor */}
      <circle cx="22" cy="22" r="3.5" fill="url(#coax-center)" stroke="#a07800" strokeWidth="0.6" />
      {/* Conductor highlight */}
      <circle cx="20.5" cy="20.5" r="1" fill="white" opacity="0.3" />

      {/* Labels */}
      <text x="22" y="7" fontSize="4" fill="#aeaeb2" textAnchor="middle" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">Braid</text>
      <text x="22" y="42" fontSize="3.5" fill="#8e8e93" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif">Cross-section</text>
    </svg>
  )
}

function ATX24Pin() {
  return (
    <svg viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atx-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="40%" stopColor="#e8e8ed" />
          <stop offset="100%" stopColor="#d1d1d6" />
        </linearGradient>
        <linearGradient id="atx-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="atx-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Housing */}
      <rect x="2" y="2" width="68" height="34" rx="2.5" fill="url(#atx-housing)" stroke="#aeaeb2" strokeWidth="1.2" filter="url(#atx-shadow)" />
      <rect x="2" y="2" width="68" height="14" rx="2.5" fill="url(#atx-sheen)" />

      {/* Latch clip */}
      <rect x="58" y="0" width="10" height="5" rx="1.5" fill="#d1d1d6" stroke="#aeaeb2" strokeWidth="0.8" />

      {/* 24 pins in 2 rows of 12 -- color coded */}
      {/* Row 1 (top) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
        const colors = ['#FF9500', '#FF9500', '#1C1C1E', '#FF3B30', '#FF3B30', '#1C1C1E', '#636366', '#636366', '#5856D6', '#FFD700', '#FFD700', '#FF9500']
        return (
          <rect
            key={`top-${i}`}
            x={5.5 + i * 5.2} y={6}
            width="3.8" height="9"
            rx="0.6"
            fill={colors[i]}
            stroke={colors[i] === '#1C1C1E' ? '#48484A' : colors[i]}
            strokeWidth="0.3"
            opacity={colors[i] === '#1C1C1E' ? 0.85 : 1}
          />
        )
      })}

      {/* Row 2 (bottom) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
        const colors = ['#FF3B30', '#FF3B30', '#FF3B30', '#FF3B30', '#1C1C1E', '#1C1C1E', '#1C1C1E', '#1C1C1E', '#FF9500', '#FF9500', '#FF9500', '#34C759']
        return (
          <rect
            key={`bot-${i}`}
            x={5.5 + i * 5.2} y={22}
            width="3.8" height="9"
            rx="0.6"
            fill={colors[i]}
            stroke={colors[i] === '#1C1C1E' ? '#48484A' : colors[i]}
            strokeWidth="0.3"
            opacity={colors[i] === '#1C1C1E' ? 0.85 : 1}
          />
        )
      })}

      {/* Label */}
      <text x="36" y="39" fontSize="4.5" fill="#8e8e93" textAnchor="middle" fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif">24-pin ATX</text>
    </svg>
  )
}

// ─── Connector Gallery Component ──────────────────────────────────────────────

const CONNECTOR_LIBRARY: Record<string, ConnectorSpec> = {
  'rj45': {
    id: 'rj45', label: 'RJ-45', sublabel: '8P8C \u2014 Ethernet',
    svg: <RJ45 />, color: '#8e8e93',
  },
  'usb-a': {
    id: 'usb-a', label: 'USB-A', sublabel: 'USB 2.0',
    svg: <USBTypeA />, color: '#636366',
  },
  'usb-a-3': {
    id: 'usb-a-3', label: 'USB-A', sublabel: 'USB 3.x (Blue)',
    svg: <USBTypeABlue />, color: '#007AFF',
  },
  'usb-b': {
    id: 'usb-b', label: 'USB-B', sublabel: 'Printer/Device',
    svg: <USBTypeB />, color: '#636366',
  },
  'usb-micro': {
    id: 'usb-micro', label: 'Micro-B', sublabel: 'USB 2.0',
    svg: <USBMicroB />, color: '#636366',
  },
  'usb-c': {
    id: 'usb-c', label: 'USB-C', sublabel: 'Reversible',
    svg: <USBTypeC />, color: '#636366',
  },
  'hdmi': {
    id: 'hdmi', label: 'HDMI', sublabel: 'Type A \u2014 19 pin',
    svg: <HDMI />, color: '#1c1c1e',
  },
  'displayport': {
    id: 'displayport', label: 'DisplayPort', sublabel: '20 pin',
    svg: <DisplayPort />, color: '#1c1c1e',
  },
  'vga': {
    id: 'vga', label: 'VGA', sublabel: 'DE-15 (D-Sub)',
    svg: <VGA />, color: '#8e8e93',
  },
  'sata-data': {
    id: 'sata-data', label: 'SATA Data', sublabel: '7-pin',
    svg: <SATAData />, color: '#636366',
  },
  'sata-power': {
    id: 'sata-power', label: 'SATA Power', sublabel: '15-pin',
    svg: <SATAPower />, color: '#636366',
  },
  'lc-fiber': {
    id: 'lc-fiber', label: 'LC', sublabel: 'Fiber \u2014 push-pull',
    svg: <LCFiber />, color: '#007AFF',
  },
  'sc-fiber': {
    id: 'sc-fiber', label: 'SC', sublabel: 'Fiber \u2014 push-pull',
    svg: <SCFiber />, color: '#FFCC00',
  },
  'st-fiber': {
    id: 'st-fiber', label: 'ST', sublabel: 'Fiber \u2014 bayonet',
    svg: <STFiber />, color: '#FF9500',
  },
  'coax-rg6': {
    id: 'coax-rg6', label: 'RG-6 Coax', sublabel: 'Cross-section',
    svg: <CoaxRG6 />, color: '#636366',
  },
  'atx-24': {
    id: 'atx-24', label: 'ATX 24-pin', sublabel: 'Motherboard power',
    svg: <ATX24Pin />, color: '#8e8e93',
  },
}

export function ConnectorGallery({ title, connectors }: ConnectorGalleryProps) {
  const specs = connectors
    .map(c => CONNECTOR_LIBRARY[c.id] ?? c)

  return (
    <div className="my-6 rounded-[18px] border border-[var(--apple-separator)] overflow-hidden bg-card">
      {title && (
        <div className="px-5 py-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-fill)]">
          <p className="text-[12px] font-bold text-[var(--apple-label-secondary)] uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="p-5 flex flex-wrap gap-4 justify-start">
        {specs.map((c) => (
          <div
            key={c.id}
            className="flex flex-col items-center gap-2.5 rounded-[14px] border border-[var(--apple-separator)] px-4 py-3.5 min-w-[88px] relative overflow-hidden"
            style={{
              background: 'var(--apple-fill)',
            }}
          >
            {/* Subtle radial highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
              }}
            />
            <div className="w-18 h-16 flex items-center justify-center relative">
              {c.svg}
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-foreground leading-tight">{c.label}</p>
              {c.sublabel && (
                <p className="text-[10px] text-[var(--apple-label-tertiary)] leading-tight mt-0.5">{c.sublabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shortcut presets used directly in MDX
export function NetworkConnectors() {
  return (
    <ConnectorGallery
      title="Network Connectors"
      connectors={[
        CONNECTOR_LIBRARY['rj45'],
        CONNECTOR_LIBRARY['coax-rg6'],
        CONNECTOR_LIBRARY['lc-fiber'],
        CONNECTOR_LIBRARY['sc-fiber'],
        CONNECTOR_LIBRARY['st-fiber'],
      ]}
    />
  )
}

export function USBConnectors() {
  return (
    <ConnectorGallery
      title="USB Connector Types"
      connectors={[
        CONNECTOR_LIBRARY['usb-a'],
        CONNECTOR_LIBRARY['usb-a-3'],
        CONNECTOR_LIBRARY['usb-b'],
        CONNECTOR_LIBRARY['usb-micro'],
        CONNECTOR_LIBRARY['usb-c'],
      ]}
    />
  )
}

export function VideoConnectors() {
  return (
    <ConnectorGallery
      title="Video Connectors"
      connectors={[
        CONNECTOR_LIBRARY['vga'],
        CONNECTOR_LIBRARY['hdmi'],
        CONNECTOR_LIBRARY['displayport'],
      ]}
    />
  )
}

export function StorageConnectors() {
  return (
    <ConnectorGallery
      title="Storage Connectors"
      connectors={[
        CONNECTOR_LIBRARY['sata-data'],
        CONNECTOR_LIBRARY['sata-power'],
      ]}
    />
  )
}
