'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function DilDegistirici() {
  const locale = useLocale()
  const t = useTranslations('calismaEkrani')
  const router = useRouter()
  const pathname = usePathname()

  return (
    <button
      // next-intl typed routing doesn't cover dynamic segments as plain strings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={() => router.replace(pathname as any, { locale: locale === 'tr' ? 'en' : 'tr' })}
      className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700"
    >
      {t('dilDegistir')}
    </button>
  )
}
