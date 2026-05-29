import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import IletisimFormu from './IletisimFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('iletisim')
  return { title: t('baslik') }
}

const ADRES = 'Alemdağ Mah. Reşadiye Cad. Dekon Silva B1-46\n34794 Çekmeköy / İstanbul'
const EMAIL = 'support@kurgemx.com'

export default async function ContactPage() {
  const t = await getTranslations('iletisim')

  return (
    <main className="flex-1 bg-kx-bg">
      <div className="bg-kx-navy py-14 px-6">
        <div className="max-w-[760px] mx-auto">
          <h1 className="font-display text-[38px] font-bold text-white tracking-[-0.025em] mb-2">
            {t('baslik')}
          </h1>
          <p className="text-white/65 text-[15px]">{t('altBaslik')}</p>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-10 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* E-posta */}
          <div className="bg-white border border-kx-border rounded-2xl p-6">
            <div className="text-[11px] font-bold text-kx-muted tracking-[0.07em] uppercase mb-3">
              {t('email')}
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="text-[15px] font-semibold text-kx-blue no-underline hover:underline"
            >
              {EMAIL}
            </a>
          </div>

          {/* Adres */}
          <div className="bg-white border border-kx-border rounded-2xl p-6">
            <div className="text-[11px] font-bold text-kx-muted tracking-[0.07em] uppercase mb-3">
              {t('adres')}
            </div>
            <address className="not-italic text-[14px] text-kx-body leading-[1.6] whitespace-pre-line">
              {ADRES}
            </address>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-kx-border rounded-2xl p-6">
          <h2 className="text-[16px] font-semibold text-kx-ink mb-6">
            {t('form.baslik')}
          </h2>
          <IletisimFormu
            labels={{
              ad: t('form.ad'),
              email: t('form.email'),
              mesaj: t('form.mesaj'),
              gonder: t('form.gonder'),
              basari: t('form.basari'),
              hatalar: {
                eksik_alan: t('form.hatalar.eksik_alan'),
                genel: t('form.hatalar.genel'),
              },
            }}
          />
        </div>
      </div>
    </main>
  )
}
