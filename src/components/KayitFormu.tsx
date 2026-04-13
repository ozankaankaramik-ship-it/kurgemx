'use client'

import { useActionState, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { kayitOl, googleIleGiris } from '@/lib/auth/actions'

export default function KayitFormu() {
  const t = useTranslations('auth.kayit')
  const locale = useLocale()
  const [kvkk, setKvkk] = useState(false)

  const [state, action, isPending] = useActionState(kayitOl, null)

  const errorKey = state?.error as string | undefined
  const errorMsg = errorKey
    ? t.has(`hatalar.${errorKey}`)
      ? t(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      : t('hatalar.genel')
    : null

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">{t('baslik')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('altBaslik')}</p>

        {/* Google OAuth - KVKK zorunlu */}
        <form action={googleIleGiris}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="kvkk" value={kvkk ? 'on' : ''} />
          <button
            type="submit"
            disabled={!kvkk}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-4"
          >
            <GoogleIcon />
            {t('googleBtn')}
          </button>
        </form>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white dark:bg-gray-900 px-2">{t('ayirici')}</span>
          </div>
        </div>

        {/* E-posta / Şifre formu */}
        <form action={action} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="ad">
                {t('ad')}
              </label>
              <input
                id="ad"
                name="ad"
                type="text"
                placeholder={t('adPlaceholder')}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="soyad">
                {t('soyad')}
              </label>
              <input
                id="soyad"
                name="soyad"
                type="text"
                placeholder={t('soyadPlaceholder')}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
              />
            </div>
          </div>

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

          {/* KVKK checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="kvkk"
              name="kvkk"
              type="checkbox"
              checked={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-black"
            />
            <label
              htmlFor="kvkk"
              className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer"
            >
              {t('kvkk')}
            </label>
          </div>

          {errorKey === 'kvkk_required' && (
            <p className="text-xs text-red-600 dark:text-red-400">{t('hatalar.kvkk_required')}</p>
          )}

          {errorMsg && errorKey !== 'kvkk_required' && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
          )}

          {state?.success && (
            <p className="text-sm text-green-600 dark:text-green-400">{t('emailGonderildi')}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition"
          >
            {isPending ? '...' : t('kayitBtn')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t('hesapVar')}{' '}
          <Link
            href="/giris"
            className="font-medium text-black dark:text-white underline underline-offset-2"
          >
            {t('girisLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
