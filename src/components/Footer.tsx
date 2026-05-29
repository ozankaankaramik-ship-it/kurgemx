import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { KxLogo } from './ui/KxLogo'

/**
 * Site footer — refreshed.
 * - Brand line at the top (KurgemX logo + tagline)
 * - Single row of 6 nav links
 * - Bottom: copyright + payment provider logos
 *
 * Reads labels from `footer.*` keys in messages/*.json.
 */
export default async function Footer() {
  const t = await getTranslations('footer')

  const links = [
    { href: '/about'           as const, label: t('about') },
    { href: '/pricing'         as const, label: t('pricing') },
    { href: '/contact'         as const, label: t('contact') },
    { href: '/terms'           as const, label: t('terms') },
    { href: '/privacy'         as const, label: t('privacy') },
    { href: '/refund'          as const, label: t('refund') },
    { href: '/sales-agreement' as const, label: t('salesAgreement') },
  ]

  return (
    <footer className="bg-kx-navy px-8 pt-10 pb-7 mt-auto">
      <div className="max-w-[1180px] mx-auto">

        {/* Brand */}
        <div className="mb-5">
          <KxLogo light size={18} />
          <p className="text-white/50 text-xs mt-1.5">{t('brand')}</p>
        </div>

        {/* Nav links — single wrapping row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pb-5 border-b border-white/10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-white/70 hover:text-white transition-colors no-underline"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-5">
          <p className="text-[12px] text-white/50">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
