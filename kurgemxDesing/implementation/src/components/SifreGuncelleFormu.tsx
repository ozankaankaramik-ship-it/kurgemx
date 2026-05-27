'use client'

import { useEffect, useState, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { sifreGuncelle } from '@/lib/auth/actions'

/**
 * Update-password form — refreshed.
 * Exchanges ?code= for a session, then renders the new password form.
 * On success, shows a confirmation panel with a CTA back to login.
 */
export default function SifreGuncelleFormu() {
  const t = useTranslations('auth.sifreGuncelle')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  const [state, action, isPending] = useActionState(sifreGuncelle, null)

  useEffect(() => {
    if (!code) {
      setSessionReady(true)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setSessionError(true)
      } else {
        setSessionReady(true)
        window.history.replaceState({}, '', window.location.pathname)
      }
    })
  }, [code])

  /* ── Session exchange failed ── */
  if (sessionError) {
    return (
      <>
        <div className="w-14 h-14 rounded-2xl bg-red-100 grid place-items-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9v3.5M12 16h.01" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-3">
          {locale === 'tr' ? 'Bağlantı geçersiz.' : 'Invalid link.'}
        </h1>
        <p className="text-[14.5px] text-kx-body leading-[1.6] mb-6">
          {t('hatalar.oturum_yok')}
        </p>
        <a
          href={locale === 'en' ? '/en/forgot-password' : '/tr/sifre-sifirlama'}
          className="block text-center bg-kx-navy text-white px-5 py-3 rounded-xl text-[14px] font-semibold no-underline shadow-kx-navy"
        >
          {locale === 'en' ? 'Request a new reset link' : 'Yeni sıfırlama bağlantısı iste'}
        </a>
      </>
    )
  }

  /* ── Waiting for session exchange ── */
  if (!sessionReady) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-6 h-6 rounded-full border-2 border-kx-border border-t-kx-navy animate-kx-spin" aria-hidden="true" />
        <p className="text-[13px] text-kx-muted mt-3">{locale === 'tr' ? 'Hazırlanıyor…' : 'Preparing…'}</p>
      </div>
    )
  }

  /* ── Success ── */
  if (state?.success) {
    return (
      <>
        <div className="w-14 h-14 rounded-2xl bg-kx-green-soft grid place-items-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-3">
          {locale === 'tr' ? 'Şifren güncellendi.' : 'Password updated.'}
        </h1>
        <p className="text-[14.5px] text-kx-body leading-[1.6] mb-6">
          {t('basariMesaji')}
        </p>
        <Link
          href="/giris"
          className="block text-center bg-kx-red text-white px-5 py-3 rounded-xl text-[14px] font-semibold no-underline shadow-kx-red"
        >
          {t('girisLink')} →
        </Link>
      </>
    )
  }

  /* ── Form ── */
  return (
    <>
      <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-1.5">
        {t('baslik')}
      </h1>
      <p className="text-[14px] text-kx-muted mb-6">{t('altBaslik')}</p>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="password">
            {t('sifre')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t('sifrePlaceholder')}
              minLength={8}
              required
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="passwordConfirm">
            {t('sifreTekrar')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder={t('sifreTekrarPlaceholder')}
              minLength={8}
              required
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        <div className="p-3 bg-kx-bg rounded-lg text-[12px] text-kx-muted leading-[1.5]">
          {locale === 'tr'
            ? 'Güçlü şifre için: en az 8 karakter, harf + rakam karışımı, özel karakter (örn. !@#$).'
            : 'Strong password: 8+ characters, mix of letters & numbers, special character.'}
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
          {isPending ? '...' : t('kaydetBtn')}
        </button>
      </form>
    </>
  )
}
