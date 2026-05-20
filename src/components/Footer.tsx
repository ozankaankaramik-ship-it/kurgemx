import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

function VisaLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="44" height="28" rx="4" fill="#1A1F71" />
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="1.5">VISA</text>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="44" height="28" rx="4" fill="#1a1a1a" />
      <circle cx="17" cy="14" r="8" fill="#EB001B" />
      <circle cx="27" cy="14" r="8" fill="#F79E1B" />
    </svg>
  )
}

function TroyLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Troy">
      <rect width="44" height="28" rx="4" fill="#C8102E" />
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.5">troy</text>
    </svg>
  )
}

export default async function Footer() {
  const t = await getTranslations('footer')

  const links = [
    { href: '/about' as const,           label: t('about') },
    { href: '/pricing' as const,         label: t('pricing') },
    { href: '/terms' as const,           label: t('terms') },
    { href: '/privacy' as const,         label: t('privacy') },
    { href: '/refund' as const,          label: t('refund') },
    { href: '/sales-agreement' as const, label: t('salesAgreement') },
  ]

  return (
    <footer style={{ backgroundColor: '#1F3864' }} className="px-4 pt-8 pb-6 mt-auto">
      <div className="max-w-5xl mx-auto">
        {/* Brand */}
        <div className="mb-5">
          <p className="text-white font-semibold text-sm">KurgemX</p>
          <p className="text-white/50 text-xs mt-0.5">{t('brand')}</p>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 pb-5 border-b border-white/10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-white/70 hover:text-white transition-colors"
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
            {/* TODO: iyzico logosu buraya eklenecek */}
          </div>
        </div>
      </div>
    </footer>
  )
}
