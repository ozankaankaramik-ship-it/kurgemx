import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function FinalCTA() {
  const locale = await getLocale()
  const isTR = locale === 'tr'

  return (
    <section className="bg-kx-bg-warm py-24 px-8 text-center">
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-display text-[60px] tracking-[-0.035em] font-bold text-kx-ink mb-4 leading-[1.05] text-balance">
          {isTR
            ? <><span>İlk projeni </span><span className="text-kx-red">30 saniyede</span><span> başlat.</span></>
            : <><span>Start your first project </span><span className="text-kx-red">in 30 seconds</span><span>.</span></>}
        </h2>
        <p className="text-[18px] text-kx-body mb-9 leading-[1.5]">
          {isTR
            ? 'İlk projen tamamen ücretsiz. Beğenirsen devam et.'
            : 'Your first project is completely free. Continue if you love it.'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          <Link
            href="/kayit"
            className="bg-kx-red text-white text-[15px] font-semibold px-7 py-4 rounded-xl no-underline shadow-kx-red transition-all hover:bg-kx-red-hover"
          >
            {isTR ? 'Hesabımı şimdi aç →' : 'Create my account →'}
          </Link>
          <a
            href="mailto:destek@kurgemx.com"
            className="bg-white text-kx-ink text-[15px] font-medium px-6 py-4 rounded-xl no-underline border border-kx-border"
          >
            {isTR ? 'Demo iste' : 'Request a demo'}
          </a>
        </div>
        <div className="text-[13px] text-kx-muted">
          {isTR ? 'Kart gerekmez · İptal tek tıkla' : 'No card required · Cancel with one click'}
        </div>
      </div>
    </section>
  )
}
