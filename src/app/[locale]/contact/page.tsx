import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('iletisim')
  return { title: t('baslik') }
}

const EMAIL = 'support@kurgemx.com'
const ADRES = 'Alemdağ Mah. Reşadiye Cad. Dekon Silva B1-46\n34794 Çekmeköy / İstanbul'

export default async function ContactPage() {
  const t = await getTranslations('iletisim')
  const locale = await getLocale()
  const isTR = locale === 'tr'

  return (
    <main className="flex-1 bg-kx-bg">
      <div className="bg-kx-navy py-14 px-6">
        <div className="max-w-[600px] mx-auto">
          <h1 className="font-display text-[38px] font-bold text-white tracking-[-0.025em] mb-2">
            {t('baslik')}
          </h1>
          <p className="text-white/65 text-[15px]">{t('altBaslik')}</p>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-6 py-10 pb-20">
        <div className="bg-white border border-kx-border rounded-xl p-6 space-y-5">

          {/* E-posta */}
          <div>
            <div className="text-[11px] font-semibold text-kx-muted uppercase tracking-[0.07em] mb-1.5">
              {isTR ? 'Bize ulaşın' : 'Contact us'}
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="text-[15px] font-semibold text-kx-blue no-underline hover:underline"
            >
              {EMAIL}
            </a>
          </div>

          <div className="border-t border-kx-border-soft" />

          {/* Adres */}
          <div>
            <div className="text-[11px] font-semibold text-kx-muted uppercase tracking-[0.07em] mb-1.5">
              {isTR ? 'Adres' : 'Address'}
            </div>
            <address className="not-italic text-[14px] text-kx-body leading-[1.7] whitespace-pre-line">
              {ADRES}
            </address>
          </div>

        </div>
      </div>
    </main>
  )
}
