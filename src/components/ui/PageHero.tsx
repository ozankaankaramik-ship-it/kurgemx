import type { ReactNode } from 'react'

type Props = {
  /** Small caps label above the title */
  kicker?: ReactNode
  /** Main title — supports a <span class="text-kx-amber"> highlight inside */
  title: ReactNode
  /** Optional subtitle / description */
  subtitle?: ReactNode
  /** Last update line (mono font, with green dot) */
  lastUpdate?: ReactNode
  /** Optional small badge inside the kicker pill */
  badge?: ReactNode
  /** Smaller, lighter title for utility pages (pricing, legal, etc.) */
  compact?: boolean
}

/**
 * Lacivert hero used on About, Pricing, Privacy, Terms, Refund and
 * Sales-Agreement pages. Includes subtle radial blobs and a grid overlay.
 */
export default function PageHero({ kicker, title, subtitle, lastUpdate, badge, compact }: Props) {
  return (
    <section className="kx-hero-gradient text-white px-8 py-22 relative overflow-hidden">
      <div className="kx-grid-bg absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />
      <div className="max-w-[920px] mx-auto text-center relative">
        {kicker && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[11.5px] font-semibold text-white/90 tracking-[0.08em] uppercase mb-6">
            {badge && (
              <span className="bg-kx-red text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                {badge}
              </span>
            )}
            {kicker}
          </div>
        )}
        <h1 className={`font-sans leading-[1.1] tracking-[-0.025em] mb-4 text-balance ${compact ? 'text-[36px] font-semibold' : 'text-[56px] leading-[1.05] tracking-[-0.035em] font-bold'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[17px] text-white/75 leading-[1.55] max-w-[640px] mx-auto text-pretty">
            {subtitle}
          </p>
        )}
        {lastUpdate && (
          <div className="mt-6 inline-flex items-center gap-2 text-[12.5px] text-white/60 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-kx-green" aria-hidden="true" />
            {lastUpdate}
          </div>
        )}
      </div>
    </section>
  )
}
