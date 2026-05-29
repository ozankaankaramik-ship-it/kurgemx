import { Link } from '@/i18n/navigation'
import KxPill from '@/components/ui/KxPill'
import { getLocale } from 'next-intl/server'

type Plan = {
  key: string
  name: string
  price: string
  desc: string
  features: string[]
  popular: boolean
}

const PLANS_TR: Plan[] = [
  {
    key: 'freemium',
    name: 'Freemium',
    price: '$0',
    desc: 'Hikaye haritası + analiz dokümanı — ücretsiz, hemen başla',
    features: [
      '1 proje / ay',
      'Küçük projeler (1–5 hikaye)',
      'Hikaye haritası',
      'İş analizi dokümanı',
    ],
    popular: false,
  },
  {
    key: 'analyst',
    name: 'Analyst',
    price: '$9',
    desc: 'Hikaye haritasından test senaryosuna tüm çıktılar',
    features: [
      '3 proje / ay',
      'Orta projeler (6–15 hikaye)',
      'Prototip üretimi',
      'Word / Excel / HTML dışa aktarım',
    ],
    popular: true,
  },
  {
    key: 'advanced',
    name: 'Advanced',
    price: '$29',
    desc: 'Büyük projeler için tam güç — tüm çıktılar',
    features: [
      '10 proje / ay',
      'Büyük projeler (16–40 hikaye)',
      'Test senaryosu üretimi',
      'Tüm Analyst özellikleri',
    ],
    popular: false,
  },
]

const PLANS_EN: Plan[] = [
  {
    key: 'freemium',
    name: 'Freemium',
    price: '$0',
    desc: 'Story map + analysis document — free, start now',
    features: [
      '1 project / month',
      'Small projects (1–5 stories)',
      'Story map',
      'Business analysis document',
    ],
    popular: false,
  },
  {
    key: 'analyst',
    name: 'Analyst',
    price: '$9',
    desc: 'All outputs from story map to test scenarios',
    features: [
      '3 projects / month',
      'Medium projects (6–15 stories)',
      'Prototype generation',
      'Word / Excel / HTML export',
    ],
    popular: true,
  },
  {
    key: 'advanced',
    name: 'Advanced',
    price: '$29',
    desc: 'Full power for large projects — all outputs',
    features: [
      '10 projects / month',
      'Large projects (16–40 stories)',
      'Test scenario generation',
      'All Analyst features',
    ],
    popular: false,
  },
]

export default async function PricingTeaser() {
  const locale = await getLocale()
  const plans = locale === 'tr' ? PLANS_TR : PLANS_EN
  const headline = locale === 'tr'
    ? 'İlk projen ücretsiz. Sonrası sana kalmış.'
    : 'Your first project is free. The rest is up to you.'
  const seeAll = locale === 'tr'
    ? 'Karşılaştırma tablosunu ve SSS\'leri gör →'
    : 'See comparison table and FAQs →'
  const subtitle = locale === 'tr'
    ? 'Projenize uygun planı seçin.'
    : 'Choose the plan that fits your project.'
  const sectionLabel = locale === 'tr' ? 'Fiyatlandırma' : 'Pricing'
  const mostPopular = locale === 'tr' ? 'EN POPÜLER' : 'MOST POPULAR'
  const signUpCta = locale === 'tr' ? 'Hesap aç' : 'Sign up'

  return (
    <section className="bg-white py-22 px-8 border-t border-kx-border">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-12">
          <KxPill tone="blue">— {sectionLabel}</KxPill>
          <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3 leading-[1.1]">
            {headline}
          </h2>
          <p className="text-[16px] text-kx-body">{subtitle}</p>
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
                    {mostPopular}
                  </div>
                )}
                <div className={`text-[13px] font-semibold tracking-[0.06em] uppercase mb-3 ${isHl ? 'text-white/60' : 'text-kx-muted'}`}>
                  {p.name}
                </div>
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="font-display text-[44px] font-bold tracking-[-0.03em]">{p.price}</span>
                  <span className={`text-[14px] ${isHl ? 'text-white/55' : 'text-kx-muted'}`}>/ {locale === 'tr' ? 'ay' : 'mo'}</span>
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
                  {signUpCta}
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
            {seeAll}
          </Link>
        </div>
      </div>
    </section>
  )
}
