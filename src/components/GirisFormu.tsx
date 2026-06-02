'use client'

import { useActionState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { girisYap, googleIleGiris } from '@/lib/auth/actions'

/* ── Reusable bits ───────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/**
 * Login form — refreshed.
 * Used inside <AuthLayout variant="giris"> at the page level.
 */
export default function GirisFormu() {
  const t = useTranslations('auth.giris')
  const locale = useLocale()

  const [state, action, isPending] = useActionState(girisYap, null)

  // Soft navigation yerine hard navigation: singleton Supabase client yeni cookie'yi okusun
  useEffect(() => {
    if (state?.location) window.location.replace(state.location)
  }, [state?.location])

  const errorKey = state?.error as string | undefined
  const errorMsg = errorKey
    ? t.has(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      ? t(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      : t('hatalar.genel')
    : null

  return (
    <>
      <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-1.5">
        {t('baslik')}
      </h1>
      <p className="text-[14px] text-kx-muted mb-7">{t('altBaslik')}</p>

      {/* Google OAuth */}
      <form action={googleIleGiris}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-kx-border rounded-xl px-4 py-3 text-[14px] font-medium text-kx-ink hover:border-kx-blue transition-colors"
        >
          <GoogleIcon />
          {t('googleBtn')}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5 text-[11px] font-medium tracking-[0.08em] text-kx-faint">
        <span className="flex-1 h-px bg-kx-border" />
        {t('ayirici').toUpperCase()}
        <span className="flex-1 h-px bg-kx-border" />
      </div>

      {/* Email / password form */}
      <form action={action} className="space-y-3.5">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="email">
            {t('email')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex">
              <EmailIcon />
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-kx-ink" htmlFor="password">
              {t('sifre')}
            </label>
            <a
              href={locale === 'en' ? '/en/forgot-password' : '/tr/sifre-sifirlama'}
              className="text-[12px] font-medium text-kx-blue no-underline hover:underline"
            >
              {t('sifremiUnuttum')}
            </a>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex">
              <LockIcon />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t('sifrePlaceholder')}
              required
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[12.5px] text-kx-body cursor-pointer select-none pt-1">
          <input type="checkbox" name="remember" defaultChecked className="w-4 h-4 accent-kx-navy" />
          {locale === 'tr' ? 'Beni 30 gün hatırla' : 'Remember me for 30 days'}
        </label>

        {errorMsg && (
          <p className="text-[13px] text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-kx-navy text-white rounded-xl px-5 py-3 text-[14px] font-semibold disabled:opacity-50 transition shadow-kx-navy mt-1"
        >
          {isPending ? '...' : t('girisBtn')}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-kx-muted">
        {t('hesapYok')}{' '}
        <Link
          href="/kayit"
          className="font-semibold text-kx-navy no-underline hover:underline"
        >
          {t('kayitLink')} →
        </Link>
      </p>
    </>
  )
}
