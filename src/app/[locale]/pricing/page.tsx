import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import KxPill from '@/components/ui/KxPill'
import PricingTable from './PricingTable'
import { createClient } from '@/lib/supabase/server'
import { getKullaniciPlan } from '@/lib/abonelik'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing')
  return { title: t('baslik') }
}

export default async function PricingPage() {
  const t      = await getTranslations('pricing')
  const locale = await getLocale()

  const supabase = await createClient()

  // Ücretli plan id'leri (buton için UUID gerekli)
  const { data: planlarRaw } = await supabase
    .from('planlar')
    .select('id, ad, kod, fiyat_usd')
    .in('kod', ['analyst', 'advanced'])
    .eq('aktif', true)

  const planMap = Object.fromEntries(
    (planlarRaw ?? []).map(p => [p.kod, { id: p.id, fiyat: p.fiyat_usd as number, ad: p.ad as string }])
  )

  // Oturum açmış kullanıcının aktif plan id'si
  const { data: { user } } = await supabase.auth.getUser()
  let mevcutPlanId: string | null = null
  if (user) {
    const pb = await getKullaniciPlan(supabase, user.id)
    mevcutPlanId = pb.plan.id || null
  }

  // Özellik satırları (çeviri server-side'da çekiliyor, Client Component'e prop olarak geçiyor)
  type Row     = { label: string; vals: (boolean | string)[] }
  type Section = { label: string; rows: Row[] }

  const sections: Section[] = [
    {
      label: t('bolumler.kapsam'),
      rows: [
        { label: t('satirlar.projeAy'),    vals: ['1', '3', '10', t('sinirsiz')] },
        { label: t('satirlar.kucukProje'), vals: [true,  true,  true,  true] },
        { label: t('satirlar.ortaProje'),  vals: [false, true,  true,  true] },
        { label: t('satirlar.buyukProje'), vals: [false, false, true,  true] },
      ],
    },
    {
      label: t('bolumler.ai'),
      rows: [
        { label: t('satirlar.hikayeHaritasi'), vals: [true,  true,  true,  true] },
        { label: t('satirlar.analizDokumani'), vals: [true,  true,  true,  true] },
        { label: t('satirlar.prototip'),       vals: [false, true,  true,  true] },
        { label: t('satirlar.testSenaryosu'),  vals: [false, true,  true,  true] },
        { label: t('satirlar.export'),         vals: [false, true,  true,  true] },
        { label: t('satirlar.dil'),            vals: [true,  true,  true,  true] },
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

  const faqs = [
    { q: 'Plan değiştirebilir miyim?',                     a: 'Evet — istediğin zaman yükselt veya düşür. Yükselttiğinde fark anında, düşürdüğünde bir sonraki dönemde geçerli olur.' },
    { q: 'İade alabilir miyim?',                            a: 'Dijital içerik niteliğinde olduğu için cayma hakkı uygulanmaz. Ancak aboneliğini iptal ettiğinde dönem sonuna kadar erişimin devam eder.' },
    { q: 'Kredi kartı gerekli mi?',                         a: 'Hayır. Freemium plan için kart bilgisi gerekmiyor. Sadece ücretli planlara geçerken talep ediyoruz.' },
    { q: 'KDV dahil mi?',                                   a: 'Evet, gösterilen fiyatlara KDV dahildir. USD üzerinden faturalanır, kur ödeme anında belirlenir.' },
    { q: 'Kurumsal plan için nasıl iletişime geçebilirim?', a: 'support@kurgemx.com adresine yazın; 24 saat içinde dönüş yapıyoruz.' },
  ]

  return (
    <main className="flex-1 bg-white">
      <PageHero
        kicker={t('baslik')}
        title={t('baslik')}
        subtitle={t('altBaslik')}
      />

      {/* Karşılaştırma tablosu + modal mantığı */}
      <PricingTable
        analystPlan={planMap['analyst'] ?? null}
        advancedPlan={planMap['advanced'] ?? null}
        mevcutPlanId={mevcutPlanId}
        locale={locale}
        sections={sections}
      />

      {/* SSS */}
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
  )
}
