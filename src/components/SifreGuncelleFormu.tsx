'use client'

import { useActionState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { sifreGuncelle } from '@/lib/auth/actions'

export default function SifreGuncelleFormu() {
  const t = useTranslations('auth.sifreGuncelle')
  const locale = useLocale()

  const [state, action, isPending] = useActionState(sifreGuncelle, null)

  if (state?.success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm text-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">{t('basariMesaji')}</p>
          <a
            href={locale === 'en' ? '/en/login' : '/tr/giris'}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('girisLink')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">{t('baslik')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('altBaslik')}</p>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">
              {t('sifre')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t('sifrePlaceholder')}
              minLength={8}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="passwordConfirm">
              {t('sifreTekrar')}
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder={t('sifreTekrarPlaceholder')}
              minLength={8}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t.has(`hatalar.${state.error}` as Parameters<typeof t>[0])
                ? t(`hatalar.${state.error}` as Parameters<typeof t>[0])
                : t('hatalar.genel')}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition"
          >
            {isPending ? '...' : t('kaydetBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
