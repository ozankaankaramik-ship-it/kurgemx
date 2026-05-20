import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing')
  return { title: t('baslik') }
}

const PLAN_KEYS = ['freemium', 'starter', 'pro'] as const

export default async function PricingPage() {
  const t = await getTranslations('pricing')

  const plans = PLAN_KEYS.map((key) => ({
    key,
    ad: t(`planlar.${key}.ad`),
    fiyat: t(`planlar.${key}.fiyat`),
    aciklama: t(`planlar.${key}.aciklama`),
    ozellikler: t.raw(`planlar.${key}.ozellikler`) as string[],
    popular: key === 'starter',
  }))

  return (
    <main className="flex-1 bg-[#F9FAFB]">
      <div className="bg-[#1F3864] text-white py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">{t('baslik')}</h1>
        <p className="text-[#B5D4F4] text-base max-w-xl mx-auto">{t('altBaslik')}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-xl bg-white flex flex-col ${
                plan.popular
                  ? 'border-2 border-[#2E75B6] shadow-lg relative pt-8 px-7 pb-7'
                  : 'border border-[#E5E7EB] p-7'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#2E75B6] text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {t('popular')}
                  </span>
                </div>
              )}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.8px] text-[#6B7280] mb-1">
                  {plan.ad}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-[#1F3864]">{plan.fiyat}</span>
                  <span className="text-sm text-gray-400 mb-1">{t('aylik')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.aciklama}</p>
              </div>

              <hr className="border-[#E5E7EB] mb-5" />

              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-[0.6px] mb-3">
                {t('dahil')}
              </p>
              <ul className="space-y-2.5 flex-1">
                {plan.ozellikler.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                    <svg
                      className="w-4 h-4 text-[#2E75B6] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {o}
                  </li>
                ))}
              </ul>
              {plan.key === 'freemium' && (
                <p className="text-xs text-gray-500 italic mt-4">{t('freemiumNot')}</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          {t('soruMetni')}{' '}
          <a
            href="mailto:destek@kurgemx.com"
            className="text-[#2E75B6] hover:underline font-medium"
          >
            destek@kurgemx.com
          </a>
        </p>
      </div>
    </main>
  )
}
