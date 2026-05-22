import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('refund')
  return { title: t('baslik') }
}

export default async function RefundPage() {
  const t = await getTranslations('refund')

  const sections = [
    { baslik: t('s1Baslik'), icerik: t('s1Icerik') },
    { baslik: t('s2Baslik'), icerik: t('s2Icerik') },
    { baslik: t('s3Baslik'), icerik: t('s3Icerik') },
    { baslik: t('s4Baslik'), icerik: t('s4Icerik') },
  ]

  return (
    <main className="flex-1 bg-[#F9FAFB]">
      <div className="bg-[#1F3864] text-white py-14 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('baslik')}</h1>
        <p className="text-[#B5D4F4] text-sm">{t('sonGuncelleme')}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-[#374151] text-base mb-10 leading-relaxed">{t('giris')}</p>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-base font-semibold text-[#1F3864] mb-2">{s.baslik}</h2>
              <p className="text-sm text-[#4B5563] leading-relaxed">{s.icerik}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#E5E7EB] pt-8 text-sm text-[#6B7280]">
          <p className="mb-1">
            {t('soruMetni')}{' '}
            <a href="mailto:support@kurgemx.com" className="text-[#2E75B6] hover:underline">
              support@kurgemx.com
            </a>
          </p>
          <p className="font-medium text-[#1F3864] mt-3 mb-1">KurgemX — Kurumsal Gelişim Merkezi (KURGEM)</p>
          <p>Alemdağ Mah. Reşadiye Cad. Dekon Silva Sitesi B1 Blok D:46 34794 Çekmeköy / İstanbul</p>
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
