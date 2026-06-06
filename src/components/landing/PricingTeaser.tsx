import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import KxPill from '@/components/ui/KxPill'

type Plan = {
  key: string
  name: string
  price: string
  desc: string
  features: string[]
  popular: boolean
}

export default async function PricingTeaser() {
  const t  = await getTranslations('landing.pricingTeaser')
  const tp = await getTranslations('pricing')
  const tn = await getTranslations('nav')

  const plans: Plan[] = [
    {
      key: 'freemium',
      name: tp('planlar.freemium.ad'),
      price: '$0',
      desc: t('plans.freemium.desc'),
      features: [t('plans.freemium.f1'), t('plans.freemium.f2'), t('plans.freemium.f3'), t('plans.freemium.f4')],
      popular: false,
    },
    {
      key: 'analyst',
      name: tp('planlar.analyst.ad'),
      price: '$9',
      desc: t('plans.analyst.desc'),
      features: [t('plans.analyst.f1'), t('plans.analyst.f2'), t('plans.analyst.f3'), t('plans.analyst.f4')],
      popular: true,
    },
    {
      key: 'advanced',
      name: tp('planlar.advanced.ad'),
      price: '$29',
      desc: t('plans.advanced.desc'),
      features: [t('plans.advanced.f1'), t('plans.advanced.f2'), t('plans.advanced.f3'), t('plans.advanced.f4')],
      popular: false,
    },
  ]

  return (
    <section className="bg-white py-22 px-8 border-t border-kx-border">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-12">
          <KxPill tone="blue">— {tn('pricing')}</KxPill>
          <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3 leading-[1.1]">
            {t('headline')}
          </h2>
          <p className="text-[16px] text-kx-body">{tp('altBaslik')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isHl = p.popular
            return (
              <div
                key={p.key}
                className={`rounded-2xl p-7 relative ${
                  isHl
                    ? 'bg-kx-ink text-white shadow-[0_24px_56px_-20px_rgba(15,23,41,0.35)]'
                    : 'bg-white text-kx-ink border border-kx-border'
                }`}
              >
                {isHl && (
                  <div className="absolute -top-2.5 right-5 bg-kx-red text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider">
                    {tp('enPopuler').toUpperCase()}
                  </div>
                )}
                <div className={`text-[13px] font-semibold tracking-[0.06em] uppercase mb-3 ${isHl ? 'text-white/60' : 'text-kx-muted'}`}>
                  {p.name}
                </div>
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="font-display text-[44px] font-bold tracking-[-0.03em]">{p.price}</span>
                  <span className={`text-[14px] ${isHl ? 'text-white/55' : 'text-kx-muted'}`}>{tp('planlar.freemium.aylik')}</span>
                </div>
                <div className={`text-[13px] mb-6 ${isHl ? 'text-white/70' : 'text-kx-muted'}`}>{p.desc}</div>

                <Link
                  href="/kayit"
                  className={`block text-center px-4 py-3 rounded-xl text-[13px] font-semibold no-underline mb-6 ${
                    isHl
                      ? 'bg-kx-red text-white shadow-kx-red'
                      : 'bg-white text-kx-ink border border-kx-ink'
                  }`}
                >
                  {t('signUpCta')}
                </Link>

                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-[13px] ${isHl ? 'text-white/85' : 'text-kx-body'}`}>
                      <span className={`mt-0.5 ${isHl ? 'text-kx-amber' : 'text-kx-green'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={'/pricing' as any}
            className="text-[14px] text-kx-blue no-underline font-semibold hover:underline"
          >
            {t('seeAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
