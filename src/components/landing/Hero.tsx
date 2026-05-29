import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import HeroProductPreview from './HeroProductPreview'

/**
 * Floating note shown over the hero preview.
 * Uses absolute positioning; on small screens collapses below the preview.
 */
function FloatingNote({
  className = '',
  tone = 'amber',
  children,
}: {
  className?: string
  tone?: 'amber' | 'blue'
  children: React.ReactNode
}) {
  const bg = tone === 'amber' ? 'bg-kx-amber-soft' : 'bg-kx-blue-soft'
  return (
    <div
      className={`hidden md:block absolute ${bg} text-kx-ink text-[12px] font-medium leading-[1.4] px-3.5 py-2.5 rounded-lg max-w-[220px] shadow-md z-10 ${className}`}
    >
      {children}
    </div>
  )
}

export default async function Hero() {
  const tLanding = await getTranslations('landing')
  const locale = await getLocale()
  const isTR = locale === 'tr'

  return (
    <section className="relative bg-kx-bg px-8 pt-16 pb-20 overflow-hidden">
      <div className="kx-grid-bg absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1280px] mx-auto relative">

        {/* Announcement chip */}
        <div className="flex justify-center mb-7">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={'/pricing' as any}
            className="inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white border border-kx-border text-[12px] text-kx-body no-underline shadow-kx-card hover:border-kx-blue transition-colors"
          >
            <span className="bg-kx-navy text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
              YENİ
            </span>
            <span>Prototip 2.0 — gerçek arayüz parçalarıyla geldi</span>
            <span className="text-kx-blue">→</span>
          </Link>
        </div>

        {/* Hero title */}
        <h1 className="font-display text-[76px] leading-[1.02] tracking-[-0.04em] font-bold text-kx-ink text-center max-w-[940px] mx-auto text-balance">
          {isTR ? (
            <>
              İş analizinin ilk taslağı,<br />
              <span className="relative inline-block">
                <span
                  className="absolute inset-y-[12%] -inset-x-1 bg-kx-red z-0"
                  style={{ transform: 'skew(-3deg)' }}
                  aria-hidden="true"
                />
                <span className="relative text-white px-3">10 dakikada</span>
              </span>
              <span className="text-kx-navy"> elinde.</span>
            </>
          ) : (
            <>
              Your first business analysis draft,<br />
              <span className="relative inline-block">
                <span
                  className="absolute inset-y-[12%] -inset-x-1 bg-kx-red z-0"
                  style={{ transform: 'skew(-3deg)' }}
                  aria-hidden="true"
                />
                <span className="relative text-white px-3">in 10 minutes</span>
              </span>
              <span className="text-kx-navy">.</span>
            </>
          )}
        </h1>

        {/* Hero subtitle */}
        <p className="text-center text-[19px] text-kx-body max-w-[680px] mx-auto mt-7 mb-9 leading-[1.5]">
          {isTR
            ? 'KurgemX, fikirden hikaye haritası → iş analizi → tıklanabilir prototip → test senaryolarına kadar tüm zinciri sana yazar.'
            : 'KurgemX takes your idea from story map → requirements analysis → clickable prototype → test scenarios. You review, refine, share.'}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 bg-kx-red text-white text-[14px] font-semibold px-6 py-3.5 rounded-xl no-underline shadow-kx-red transition-all hover:bg-kx-red-hover"
          >
            {tLanding('hero.getStarted')} <span>→</span>
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2.5 bg-white text-kx-ink text-[14px] font-medium px-5 py-3.5 rounded-xl no-underline border border-kx-border hover:border-kx-blue transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-kx-navy text-white grid place-items-center text-[8px]">▶</span>
            2 dakikalık tur izle
          </a>
        </div>

        <div className="text-center text-[12px] text-kx-muted mb-12">
          ✓ Kart gerekmez · ✓ İlk projen tamamen ücretsiz · ✓ Türkçe ve İngilizce
        </div>

        {/* Product preview with floating notes */}
        <div className="relative max-w-[1120px] mx-auto">
          <FloatingNote className="-top-3 -left-10" tone="amber">
            <strong>2 hafta → 12 dakika.</strong>
            <br />
            Bir iş analisti ekibi
          </FloatingNote>
          <FloatingNote className="top-30 -right-12" tone="blue">
            18 hikaye, 3 sürüm, 27 kabul kriteri — hepsi <strong>tek tıkla</strong> üretildi.
          </FloatingNote>
          <HeroProductPreview />
        </div>
      </div>
    </section>
  )
}
