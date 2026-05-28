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

export function KxIcon({ size = 28 }: { size?: number; light?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/kurgemx-icon.svg" width={size} height={size} alt="" aria-hidden="true" style={{ display: 'block' }} />
}

export default KxLogo
