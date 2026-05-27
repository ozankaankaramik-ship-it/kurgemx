'use client'

import { useActionState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { sifreSifirla } from '@/lib/auth/actions'

/**
 * Forgot-password form — refreshed.
 * - Lacivert split layout (via AuthLayout, applied at page level)
 * - Email field + send button
 * - Success state (large check + "e-posta gönderildi" + resend hint)
 * - Expired-link banner when ?error=expired etc.
 */
export default function SifreSifirlamaFormu({ expiredLink = false }: { expiredLink?: boolean }) {
  const t = useTranslations('auth.sifreSifirlama')
  const locale = useLocale()

  const [state, action, isPending] = useActionState(sifreSifirla, null)

  if (state?.success) {
    return (
      <>
        <div className="w-14 h-14 rounded-2xl bg-kx-green-soft grid place-items-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-3">
          {locale === 'tr' ? 'E-posta gönderildi.' : 'Email sent.'}
        </h1>
        <p className="text-[14.5px] text-kx-body leading-[1.6] mb-6">
          {t('basariMesaji')}
        </p>
        <Link
          href="/giris"
          className="block text-center bg-kx-navy text-white px-5 py-3 rounded-xl text-[14px] font-semibold no-underline shadow-kx-navy"
        >
          {t('geriDon')}
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-1.5">
        {t('baslik')}
      </h1>
      <p className="text-[14px] text-kx-muted mb-6">{t('altBaslik')}</p>

      {expiredLink && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 leading-[1.5]">
          {locale === 'tr'
            ? '⚠️ Şifre sıfırlama linkinizin süresi dolmuş. Lütfen yeni bir link talep edin.'
            : '⚠️ Your password reset link has expired. Please request a new one.'}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="email">
            {t('email')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              required
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        {state?.error && (
          <p className="text-[13px] text-red-600">
            {t.has(`hatalar.${state.error}` as Parameters<typeof t>[0])
              ? t(`hatalar.${state.error}` as Parameters<typeof t>[0])
              : t('hatalar.genel')}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-kx-navy text-white rounded-xl px-5 py-3 text-[14px] font-semibold disabled:opacity-50 transition shadow-kx-navy"
        >
          {isPending ? '...' : `${t('gonderBtn')} →`}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-kx-muted">
        {locale === 'tr' ? 'Hatırladın mı?' : 'Remembered?'}{' '}
        <Link href="/giris" className="font-semibold text-kx-navy no-underline hover:underline">
          {locale === 'tr' ? 'Giriş yap' : 'Sign in'}
        </Link>
      </p>
    </>
  )
}
