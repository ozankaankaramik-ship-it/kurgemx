import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { KxLogo } from './ui/KxLogo'

/* ──────────────────────────────────────────────────────────────────
   Payment logos — preserved from the user's existing Footer
   ────────────────────────────────────────────────────────────────── */

function VisaLogo() {
  return (
    <svg width="46" height="30" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="44" height="28" rx="4" fill="#1A1F71" />
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="1.5">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg width="46" height="30" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="44" height="28" rx="4" fill="#1a1a1a" />
      <circle cx="17" cy="14" r="8" fill="#EB001B" />
      <circle cx="27" cy="14" r="8" fill="#F79E1B" opacity="0.85" />
    </svg>
  )
}

function TroyLogo() {
  return (
    <svg width="46" height="30" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Troy">
      <rect width="44" height="28" rx="4" fill="#C8102E" />
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.5">troy</text>
    </svg>
  )
}

function IyzicoLogo() {
  return (
    <svg width="46" height="30" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="iyzico">
      <rect width="44" height="28" rx="4" fill="#1E064F" />
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">iyzico</text>
    </svg>
  )
}

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

        {/* Copyright + Payment logos */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[12px] text-white/50">{t('copyright')}</p>

          <div className="flex items-center gap-2">
            <VisaLogo />
            <MastercardLogo />
            <TroyLogo />
            <IyzicoLogo />
          </div>
        </div>
      </div>
    </footer>
  )
}
