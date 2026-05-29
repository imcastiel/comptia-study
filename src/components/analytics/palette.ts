// Stable color palette for per-domain analytics visuals. Domains are colored by
// their ordinal position so the same domain keeps the same hue across charts.
const DOMAIN_PALETTE = [
  'var(--apple-blue)',
  'var(--apple-green)',
  'var(--apple-orange)',
  'var(--apple-purple)',
  'var(--apple-teal)',
  'var(--apple-indigo)',
  'var(--apple-red)',
  '#FFCC00', // apple yellow
  '#5856D6',
] as const

export function domainColor(index: number): string {
  return DOMAIN_PALETTE[index % DOMAIN_PALETTE.length]
}
