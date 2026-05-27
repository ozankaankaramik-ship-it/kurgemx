// KurgemX brand wordmark + icon
// Stylized "K" mark with three planks suggesting R1/R2/R3 release ladder.

type Props = {
  /** When the wordmark sits on a dark surface */
  light?: boolean
  /** Font size in px — icon scales relative to this */
  size?: number
  /** Hide the wordmark, show only the icon */
  iconOnly?: boolean
  className?: string
}

export function KxLogo({ light = false, size = 20, iconOnly = false, className = '' }: Props) {
  const iconSize = Math.round(size * 1.4)
  const wordColor = light ? '#FFFFFF' : '#0E1A33'

  return (
    <span
      className={`inline-flex items-center gap-2 font-brand font-bold leading-none ${className}`}
      style={{ fontSize: size, color: wordColor, letterSpacing: '-0.01em' }}
    >
      <KxIcon size={iconSize} light={light} />
      {!iconOnly && (
        <span>
          Kurgem<span style={{ color: '#E63329' }}>X</span>
        </span>
      )}
    </span>
  )
}

export function KxIcon({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill={light ? 'rgba(255,255,255,0.10)' : '#1F3864'} />
      <rect x="7"  y="7"     width="3.5" height="18" rx="1" fill="#FFFFFF" />
      <rect x="13" y="7"     width="9"   height="3.5" rx="1" fill="#E63329" />
      <rect x="13" y="14.25" width="6"   height="3.5" rx="1" fill="#FFFFFF" opacity="0.85" />
      <rect x="13" y="21.5"  width="12"  height="3.5" rx="1" fill="#FFFFFF" opacity="0.6" />
    </svg>
  )
}

export default KxLogo
