'use client'

import { useActionState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { sifreSifirla } from '@/lib/auth/actions'

export default function SifreSifirlamaFormu() {
  const t = useTranslations('auth.sifreSifirlama')
  const locale = useLocale()

  const [state, action, isPending] = useActionState(sifreSifirla, null)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">{t('baslik')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('altBaslik')}</p>

        {state?.success ? (
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">{t('basariMesaji')}</p>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t('emailPlaceholder')}
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
              {isPending ? '...' : t('gonderBtn')}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link
            href="/giris"
            className="font-medium text-black dark:text-white underline underline-offset-2"
          >
            {t('geriDon')}
          </Link>
        </p>
      </div>
    </div>
  )
}
