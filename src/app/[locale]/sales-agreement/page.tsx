import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('salesAgreement')
  return { title: t('baslik') }
}

export default async function SalesAgreementPage() {
  const t = await getTranslations('salesAgreement')

  const sections = [
    { baslik: t('s2Baslik'), icerik: t('s2Icerik'), preWrap: false },
    { baslik: t('s3Baslik'), icerik: t('s3Icerik'), preWrap: true },
    { baslik: t('s4Baslik'), icerik: t('s4Icerik'), preWrap: false },
    { baslik: t('s5Baslik'), icerik: t('s5Icerik'), preWrap: false },
    { baslik: t('s6Baslik'), icerik: t('s6Icerik'), preWrap: false },
    { baslik: t('s7Baslik'), icerik: t('s7Icerik'), preWrap: false },
  ]

  return (
    <main className="flex-1 bg-[#F9FAFB]">
      <div className="bg-[#1F3864] text-white py-14 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('baslik')}</h1>
        <p className="text-[#B5D4F4] text-xs mt-1">{t('kanun')}</p>
        <p className="text-white/50 text-xs mt-1">{t('sonGuncelleme')}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Section 1 — Seller info box */}
        <div className="bg-[#EEF4FB] rounded-xl border border-[#B5D4F4] p-6 mb-6">
          <h2 className="text-base font-semibold text-[#1F3864] mb-4">
            1. {t('saticiBaslik')}
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-[#1F3864] whitespace-nowrap">Ticari Unvan:</dt>
            <dd className="text-[#374151]">KurgemX — Kurumsal Gelişim Merkezi (KURGEM)</dd>
            <dt className="font-medium text-[#1F3864] whitespace-nowrap">Marka:</dt>
            <dd className="text-[#374151]">KurgemX</dd>
            <dt className="font-medium text-[#1F3864] whitespace-nowrap">Adres:</dt>
            <dd className="text-[#374151]">Alemdağ Mah. Reşadiye Cad. Dekon Silva Sitesi B1 Blok D:46 34794 Çekmeköy / İstanbul</dd>
            <dt className="font-medium text-[#1F3864] whitespace-nowrap">E-posta:</dt>
            <dd className="text-[#374151]">
              <a href="mailto:support@kurgemx.com" className="text-[#2E75B6] hover:underline">
                support@kurgemx.com
              </a>
            </dd>
            <dt className="font-medium text-[#1F3864] whitespace-nowrap">Web:</dt>
            <dd className="text-[#374151]">
              <a href="https://kurgemx.com" className="text-[#2E75B6] hover:underline">
                kurgemx.com
              </a>
            </dd>
          </dl>
        </div>

        {/* Sections 2-7 */}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-base font-semibold text-[#1F3864] mb-2">{s.baslik}</h2>
              <p
                className="text-sm text-[#4B5563] leading-relaxed"
                style={s.preWrap ? { whiteSpace: 'pre-line' } : undefined}
              >
                {s.icerik}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#E5E7EB] pt-8 text-sm text-[#6B7280]">
          <p className="mt-1">
            {t('iletisim')}:{' '}
            <a href="mailto:support@kurgemx.com" className="text-[#2E75B6] hover:underline">
              support@kurgemx.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
