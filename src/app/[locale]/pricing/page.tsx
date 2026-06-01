import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import KxPill from '@/components/ui/KxPill'
import PlanKartlari, { type PlanKart } from './PlanKartlari'
import { createClient } from '@/lib/supabase/server'
import { getKullaniciPlan } from '@/lib/abonelik'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing')
  return { title: t('baslik') }
}

/* ──────────────────────────────────────────────────────────────────
   Cells used inside the comparison table
   ────────────────────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-kx-green-soft">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 8.5l2.5 2.5L12 5.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
function DashCell() {
  return <span className="text-[#D1D5DB] font-semibold" aria-hidden="true">—</span>
}
function Cell({ val }: { val: boolean | string }) {
  if (val === true) return <CheckIcon />
  if (val === false) return <DashCell />
  return <span className="text-[13px] font-bold text-kx-navy">{val}</span>
}

export default async function PricingPage() {
  const t      = await getTranslations('pricing')
  const locale = await getLocale()

  // Planlar (public read — anon key yeterli)
  const supabase = await createClient()

  const { data: planlarRaw } = await supabase
    .from('planlar')
    .select('id, ad, kod, fiyat_usd, aylik_proje_limiti, kucuk_proje, orta_proje, buyuk_proje, max_buyuk_proje, prototip, test_senaryosu, export')
    .in('kod', ['freemium', 'analyst', 'advanced'])
    .eq('aktif', true)
    .order('fiyat_usd', { ascending: true, nullsFirst: true })

  const planlar: PlanKart[] = (planlarRaw ?? []) as PlanKart[]

  // Oturum açmış kullanıcının aktif plan id'si
  const { data: { user } } = await supabase.auth.getUser()
  let mevcutPlanId: string | null = null
  if (user) {
    const pb = await getKullaniciPlan(supabase, user.id)
    mevcutPlanId = pb.plan.id || null
  }

  type Row = { label: string; vals: (boolean | string)[] }
  type Section = { label: string; rows: Row[] }

  const sections: Section[] = [
    {
      label: t('bolumler.kapsam'),
      rows: [
        { label: t('satirlar.projeAy'),    vals: ['1', '3', '10', t('sinirsiz')] },
        { label: t('satirlar.kucukProje'), vals: [true,  true,  true,  true]  },
        { label: t('satirlar.ortaProje'),  vals: [false, true,  true,  true]  },
        { label: t('satirlar.buyukProje'), vals: [false, false, true,  true]  },
      ],
    },
    {
      label: t('bolumler.ai'),
      rows: [
        { label: t('satirlar.hikayeHaritasi'), vals: [true,  true,  true,  true]  },
        { label: t('satirlar.analizDokumani'), vals: [true,  true,  true,  true]  },
        { label: t('satirlar.prototip'),       vals: [false, true,  true,  true]  },
        { label: t('satirlar.testSenaryosu'),  vals: [false, true,  true,  true]  },
        { label: t('satirlar.export'),         vals: [false, true,  true,  true]  },
        { label: t('satirlar.dil'),            vals: [true,  true,  true,  true]  },
      ],
    },
    {
      label: t('bolumler.kurumsal'),
      rows: [
        { label: t('satirlar.kullaniciYonetimi'), vals: [false, false, false, true] },
        { label: t('satirlar.faturalandirma'),    vals: [false, false, false, true] },
        { label: t('satirlar.sso'),               vals: [false, false, false, true] },
        { label: t('satirlar.sla'),               vals: [false, false, false, true] },
      ],
    },
  ]

  const ANALYST = 1 // highlighted column

  const faqs = [
    { q: 'Plan değiştirebilir miyim?',                       a: 'Evet — istediğin zaman yükselt veya düşür. Yükselttiğinde fark anında, düşürdüğünde bir sonraki dönemde geçerli olur.' },
    { q: 'İade alabilir miyim?',                              a: 'Dijital içerik niteliğinde olduğu için cayma hakkı uygulanmaz. Ancak aboneliğini iptal ettiğinde dönem sonuna kadar erişimin devam eder.' },
    { q: 'Kredi kartı gerekli mi?',                           a: 'Hayır. Freemium plan için kart bilgisi gerekmiyor. Sadece ücretli planlara geçerken talep ediyoruz.' },
    { q: 'KDV dahil mi?',                                     a: 'Evet, gösterilen fiyatlara KDV dahildir. USD üzerinden faturalanır, kur ödeme anında belirlenir.' },
    { q: 'Kurumsal plan için nasıl iletişime geçebilirim?',   a: 'support@kurgemx.com adresine yazın; 24 saat içinde dönüş yapıyoruz.' },
  ]

  return (
    <>
      <main className="flex-1 bg-white">
        <PageHero
          kicker={t('baslik')}
          title={t('baslik')}
          subtitle={t('altBaslik')}
        />

        {/* Plan kartları */}
        <PlanKartlari planlar={planlar} mevcutPlanId={mevcutPlanId} locale={locale} />

        {/* Comparison table */}
        <section className="py-14 px-8 bg-kx-bg">
          <div className="max-w-[1080px] mx-auto">
            <div className="overflow-x-auto rounded-2xl border border-kx-border shadow-kx-card bg-white">
              <table className="w-full text-sm" style={{ minWidth: 720 }}>
                <colgroup>
                  <col style={{ width: '38%' }} />
                  <col style={{ width: '15.5%' }} />
                  <col style={{ width: '15.5%' }} />
                  <col style={{ width: '15.5%' }} />
                  <col style={{ width: '15.5%' }} />
                </colgroup>

                {/* ── Plan headers ── */}
                <thead>
                  <tr className="bg-kx-navy">
                    <th className="px-6 py-6" />

                    <th className="px-3 py-6 text-center align-top">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                        {t('planlar.freemium.ad')}
                      </p>
                      <p className="text-2xl font-bold text-white leading-none">
                        {t('planlar.freemium.fiyat')}
                      </p>
                      <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.freemium.aylik')}</p>
                      <p className="text-[10px] text-[#B5D4F4]/70 italic mt-2 leading-tight">
                        {t('freemiumNot')}
                      </p>
                    </th>

                    {/* Analyst — highlighted */}
                    <th className="px-3 pt-4 pb-6 text-center align-top border-l-2 border-r-2 border-t-2 border-kx-blue">
                      <div className="flex justify-center mb-3">
                        <span className="bg-kx-blue text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-wider">
                          {t('enPopuler')}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                        {t('planlar.analyst.ad')}
                      </p>
                      <p className="text-2xl font-bold text-white leading-none">
                        {t('planlar.analyst.fiyat')}
                      </p>
                      <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.analyst.aylik')}</p>
                    </th>

                    <th className="px-3 py-6 text-center align-top">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                        {t('planlar.advanced.ad')}
                      </p>
                      <p className="text-2xl font-bold text-white leading-none">
                        {t('planlar.advanced.fiyat')}
                      </p>
                      <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.advanced.aylik')}</p>
                    </th>

                    <th className="px-3 py-6 text-center align-top">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                        {t('planlar.enterprise.ad')}
                      </p>
                      <a
                        href="mailto:support@kurgemx.com"
                        className="inline-block mt-3 rounded-md bg-white text-kx-navy text-xs font-semibold px-3 py-1.5 hover:bg-kx-blue-soft transition-colors no-underline"
                      >
                        {t('teklifAl')}
                      </a>
                    </th>
                  </tr>
                </thead>

                {/* ── Feature rows ── */}
                <tbody>
                  {sections.flatMap((section, si) => {
                    const isLastSection = si === sections.length - 1
                    return [
                      <tr key={`sec-${si}`} className="bg-kx-blue-soft">
                        <td
                          colSpan={5}
                          className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-kx-navy"
                        >
                          {section.label}
                        </td>
                      </tr>,
                      ...section.rows.map((row, ri) => {
                        const isLastRow = isLastSection && ri === section.rows.length - 1
                        return (
                          <tr
                            key={`row-${si}-${ri}`}
                            className={ri % 2 === 0 ? 'bg-white' : 'bg-kx-bg'}
                          >
                            <td className="px-6 py-3.5 text-sm text-kx-body">{row.label}</td>
                            {row.vals.map((val, ci) => (
                              <td
                                key={ci}
                                className={`px-4 py-3.5 text-center ${
                                  ci === ANALYST
                                    ? `border-l-2 border-r-2 border-kx-blue ${isLastRow ? 'border-b-2' : ''}`
                                    : ''
                                }`}
                              >
                                <Cell val={val} />
                              </td>
                            ))}
                          </tr>
                        )
                      }),
                    ]
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-center mt-6 text-[13px] text-kx-muted">
              <strong className="text-kx-ink">USD</strong> · KDV dahil · Ödeme anındaki kur esas alınır · Aylık fatura, dilediğin zaman iptal
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-8 bg-white border-t border-kx-border">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-10">
              <KxPill tone="amber">— Sıkça sorulanlar</KxPill>
              <h2 className="font-display text-[36px] font-bold text-kx-ink mt-4 tracking-tight">
                Aklındaki sorular
              </h2>
            </div>
            <div>
              {faqs.map((f, i) => (
                <div
                  key={f.q}
                  className={`py-5 ${i === 0 ? 'border-t border-kx-border' : 'border-t border-kx-border-soft'} ${
                    i === faqs.length - 1 ? 'border-b border-kx-border' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="font-display text-[17px] font-semibold text-kx-ink mb-2 tracking-tight">
                        {f.q}
                      </h3>
                      <p className="text-[14px] text-kx-body m-0 leading-[1.6]">{f.a}</p>
                    </div>
                    <span className="text-kx-faint text-lg font-light">−</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center text-[14px] text-kx-body">
              {t('soruMetni')}{' '}
              <a href="mailto:support@kurgemx.com" className="text-kx-blue font-semibold no-underline hover:underline">
                support@kurgemx.com
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
