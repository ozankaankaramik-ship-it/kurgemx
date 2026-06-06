import { getTranslations } from 'next-intl/server'

export default async function Testimonial() {
  const t = await getTranslations('landing.testimonial')

  const stats = [
    { n: t('stats.hikaye.n'), l: t('stats.hikaye.label') },
    { n: t('stats.proje.n'),  l: t('stats.proje.label') },
    { n: t('stats.hizli.n'), l: t('stats.hizli.label') },
    { n: t('stats.nps.n'),   l: t('stats.nps.label') },
  ]

  const author = t('author')
  const initials = author.split(' ').map((w: string) => w[0]).join('').slice(0, 2)

  return (
    <section className="kx-hero-gradient text-white py-22 px-8 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-[30%] -right-[10%] w-125 h-125 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(46,117,182,0.18), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[30%] -left-[10%] w-100 h-100 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(230,51,41,0.15), transparent 70%)' }}
      />
      <div className="max-w-[980px] mx-auto relative text-center">
        <div className="text-[56px] text-kx-red font-display leading-[0.6] mb-4">"</div>
        <p className="font-display text-[36px] leading-[1.3] tracking-[-0.02em] font-medium text-white max-w-[880px] mx-auto mb-8 text-balance">
          {t('quote')}
        </p>
        <div className="flex items-center justify-center gap-3.5">
          <div className="w-12 h-12 rounded-full grid place-items-center text-base font-bold"
               style={{ background: 'linear-gradient(135deg, #2E75B6, #E63329)' }}>
            {initials}
          </div>
          <div className="text-left">
            <div className="text-[15px] font-semibold">{author}</div>
            <div className="text-[13px] text-white/60">{t('title')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-18 pt-10 border-t border-white/12">
          {stats.map(({ n, l }) => (
            <div key={l}>
              <div className="font-display text-[44px] font-bold tracking-[-0.03em] text-kx-amber">
                {n}
              </div>
              <div className="text-[13px] text-white/65 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
