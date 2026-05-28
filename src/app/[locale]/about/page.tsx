import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about')
  return { title: t('baslik') }
}

/**
 * About page — refreshed.
 * - Lacivert hero with KURGEM badge
 * - 4-stat strip (years, projects, stories, support window)
 * - 3 numbered sections (numbered red kicker + serif title + body)
 * - "Bize yazın" highlight card on navy
 * - Contact card with address + email + web
 */
export default async function AboutPage() {
  const t = await getTranslations('about')

  const sections = [
    { kicker: '01', baslik: t('s1Baslik'), icerik: t('s1Icerik') },
    { kicker: '02', baslik: t('s2Baslik'), icerik: t('s2Icerik') },
    { kicker: '03', baslik: t('s3Baslik'), icerik: t('s3Icerik') },
  ]

  return (
    <>
      <main className="flex-1 bg-white">
        <PageHero
          kicker={t('baslik')}
          title="25 yıllık tecrübe, AI ile bir araya geldi."
          subtitle={t('altBaslik')}
          badge="KURGEM"
        />

        {/* Stats strip */}
        <section className="py-14 px-8 bg-white">
          <div className="max-w-[1120px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 border border-kx-border rounded-2xl overflow-hidden">
              {[
                ['25+',    'yıl sektör tecrübesi'],
                ['1.200+', 'üretilen proje'],
                ['23.000+','hikaye yazıldı'],
                ['7/24',   'destek penceresi'],
              ].map(([n, l], i) => (
                <div
                  key={l}
                  className={`p-7 ${i < 3 ? 'md:border-r border-kx-border' : ''} ${i === 1 ? 'bg-kx-bg' : 'bg-white'}`}
                >
                  <div className="font-display text-[44px] font-bold text-kx-navy tracking-[-0.03em] leading-none">{n}</div>
                  <div className="text-xs text-kx-muted mt-2 font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Numbered sections */}
        <section className="px-8 pb-20">
          <div className="max-w-[920px] mx-auto">
            {sections.map((s, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr] gap-8 py-9 border-t border-kx-border-soft">
                <div className="font-mono text-[14px] text-kx-red font-bold pt-1">{s.kicker}</div>
                <div>
                  <h2 className="font-display text-[28px] font-bold text-kx-ink mb-3.5 tracking-tight">
                    {s.baslik}
                  </h2>
                  <p className="text-[16px] text-kx-body leading-[1.65] m-0 text-pretty">
                    {s.icerik}
                  </p>
                </div>
              </div>
            ))}

            {/* Highlight CTA card */}
            <div className="mt-14 p-8 bg-kx-navy text-white rounded-2xl relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -top-10 -right-10 w-50 h-50 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(230,51,41,0.25), transparent 70%)' }}
              />
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <div className="text-[11px] font-bold text-white/60 tracking-[0.08em] uppercase mb-2.5">
                    Birlikte çalışalım
                  </div>
                  <h3 className="font-display text-[28px] font-bold mb-1.5 tracking-tight">
                    Sorularınız mı var? Bize yazın.
                  </h3>
                  <p className="text-[14px] text-white/75 m-0">
                    Hafta içi 9:00–18:00 arası 24 saat içinde dönüş garantisi.
                  </p>
                </div>
                <a
                  href="mailto:support@kurgemx.com"
                  className="bg-kx-red text-white text-[14px] font-semibold px-6 py-3.5 rounded-xl no-underline whitespace-nowrap shadow-kx-red"
                >
                  support@kurgemx.com →
                </a>
              </div>
            </div>

            {/* Contact info card */}
            <div className="mt-14 p-7 bg-kx-bg border border-kx-border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-2.5">
                  {t('iletisimBaslik')}
                </div>
                <div className="text-[17px] font-bold text-kx-ink mb-1.5">
                  Ozan Kaan Karamık — KurgemX
                </div>
                <div className="text-[13px] text-kx-body leading-[1.6]">
                  Alemdağ Mah. Reşadiye Cad.<br />
                  Dekon Silva Sitesi B1 Blok D:46<br />
                  34794 Çekmeköy / İstanbul
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-2.5">
                  {t('iletisim')}
                </div>
                <div className="flex flex-col gap-2.5">
                  <a href="mailto:support@kurgemx.com" className="inline-flex items-center gap-2.5 text-kx-ink no-underline text-[14px] font-medium hover:text-kx-blue transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-kx-blue-soft text-kx-blue grid place-items-center">@</span>
                    support@kurgemx.com
                  </a>
                  <a href="https://kurgemx.com" className="inline-flex items-center gap-2.5 text-kx-ink no-underline text-[14px] font-medium hover:text-kx-blue transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-kx-blue-soft text-kx-blue grid place-items-center text-[14px]">↗</span>
                    kurgemx.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
