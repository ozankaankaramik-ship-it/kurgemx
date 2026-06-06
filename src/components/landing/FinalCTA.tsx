import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function FinalCTA() {
  const t = await getTranslations('landing.finalCta')

  return (
    <section className="bg-kx-bg-warm py-24 px-8 text-center">
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-display text-[60px] tracking-[-0.035em] font-bold text-kx-ink mb-4 leading-[1.05] text-balance">
          <span>{t('title1')} </span>
          <span className="text-kx-red">{t('highlight')}</span>
          <span>{t('title2')}</span>
        </h2>
        <p className="text-[18px] text-kx-body mb-9 leading-[1.5]">
          {t('subtitle')}
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          <Link
            href="/kayit"
            className="bg-kx-red text-white text-[15px] font-semibold px-7 py-4 rounded-xl no-underline shadow-kx-red transition-all hover:bg-kx-red-hover"
          >
            {t('primary')} →
          </Link>
          <a
            href="mailto:destek@kurgemx.com"
            className="bg-white text-kx-ink text-[15px] font-medium px-6 py-4 rounded-xl no-underline border border-kx-border"
          >
            {t('secondary')}
          </a>
        </div>
        <div className="text-[13px] text-kx-muted">
          {t('footnote')}
        </div>
      </div>
    </section>
  )
}
