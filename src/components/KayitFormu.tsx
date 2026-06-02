'use client'

import { useActionState, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { kayitOl, googleIleGiris } from '@/lib/auth/actions'

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

/** Cheap password strength heuristic — same UX as the canvas mock. */
function getStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s === 0) return { score: 0, label: '—',         color: '#E8EAEE' }
  if (s === 1) return { score: 1, label: 'Zayıf',     color: '#DC2626' }
  if (s === 2) return { score: 2, label: 'Orta',      color: '#F59E0B' }
  if (s === 3) return { score: 3, label: 'İyi',       color: '#65A30D' }
  return        { score: 4, label: 'Güçlü',           color: '#16A34A' }
}

/**
 * Signup form — refreshed.
 * Used inside <AuthLayout variant="kayit"> at the page level.
 */
export default function KayitFormu() {
  const t = useTranslations('auth.kayit')
  const locale = useLocale()
  const [kvkk,  setKvkk]  = useState(false)
  const [terms, setTerms] = useState(false)
  const [pw, setPw] = useState('')

  const [state, action, isPending] = useActionState(kayitOl, null)

  const errorKey = state?.error as string | undefined
  const errorMsg = errorKey
    ? t.has(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      ? t(`hatalar.${errorKey}` as Parameters<typeof t>[0])
      : t('hatalar.genel')
    : null

  const strength = getStrength(pw)

  return (
    <>
      <h1 className="font-display text-[30px] font-bold text-kx-ink tracking-tight mb-1.5">
        {t('baslik')}
      </h1>
      <p className="text-[14px] text-kx-muted mb-6">{t('altBaslik')}</p>

      {/* Google OAuth */}
      <form action={googleIleGiris}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="kvkk"  value={kvkk  ? 'on' : ''} />
        <input type="hidden" name="terms" value={terms ? 'on' : ''} />
        <button
          type="submit"
          disabled={!kvkk || !terms}
          className="w-full flex items-center justify-center gap-2.5 bg-white border border-kx-border rounded-xl px-4 py-3 text-[14px] font-medium text-kx-ink hover:border-kx-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-4"
        >
          <GoogleIcon />
          {t('googleBtn')}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4 text-[11px] font-medium tracking-[0.08em] text-kx-faint">
        <span className="flex-1 h-px bg-kx-border" />
        {t('ayirici').toUpperCase()}
        <span className="flex-1 h-px bg-kx-border" />
      </div>

      <form action={action} className="space-y-3.5">
        <input type="hidden" name="locale" value={locale} />

        {/* Ad / Soyad */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="ad">{t('ad')}</label>
            <input
              id="ad" name="ad" type="text" placeholder={t('adPlaceholder')} required
              className="w-full h-[42px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="soyad">{t('soyad')}</label>
            <input
              id="soyad" name="soyad" type="text" placeholder={t('soyadPlaceholder')} required
              className="w-full h-[42px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5" htmlFor="email">{t('email')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex"><EmailIcon /></span>
            <input
              id="email" name="email" type="email" placeholder={t('emailPlaceholder')} required
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
        </div>

        {/* Password + strength meter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-kx-ink" htmlFor="password">{t('sifre')}</label>
            {pw.length > 0 && (
              <span className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: strength.color }}>
                ● {strength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-kx-faint flex"><LockIcon /></span>
            <input
              id="password" name="password" type="password"
              placeholder={t('sifrePlaceholder')} minLength={8} required
              value={pw} onChange={(e) => setPw(e.target.value)}
              className="w-full h-[42px] pl-10 pr-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
          {/* Strength bar */}
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((tick) => (
              <div
                key={tick}
                className="h-[3px] flex-1 rounded-full"
                style={{ background: tick <= strength.score ? strength.color : '#E8EAEE' }}
              />
            ))}
          </div>
        </div>

        {/* Yasal onaylar grubu */}
        <div className="space-y-2 pt-1">
          {/* KVKK */}
          <label className="flex items-start gap-2.5 text-[12px] text-kx-body cursor-pointer leading-[1.5]">
            <input
              id="kvkk"
              name="kvkk"
              type="checkbox"
              checked={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-kx-navy"
            />
            <span>{t('kvkk')}</span>
          </label>

          {/* Terms */}
          <label className="flex items-start gap-2.5 text-[12px] text-kx-body cursor-pointer leading-[1.5]">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 shrink-0 accent-kx-navy"
            />
            <span>
              {t('termsPrefix')}
              <Link href="/terms" target="_blank" className="underline text-kx-navy hover:opacity-80">
                {t('termsLinkText')}
              </Link>
              {t('termsSuffix')}
            </span>
          </label>
        </div>

        {errorKey === 'kvkk_required' && (
          <p className="text-[12px] text-red-600">{t('hatalar.kvkk_required')}</p>
        )}
        {errorKey === 'terms_required' && (
          <p className="text-[12px] text-red-600">{t('hatalar.terms_required')}</p>
        )}

        {errorMsg && errorKey !== 'kvkk_required' && (
          <p className="text-[13px] text-red-600">{errorMsg}</p>
        )}

        {state?.success && (
          <p className="text-[13px] text-kx-green-ink bg-kx-green-soft rounded-lg px-3 py-2">{t('emailGonderildi')}</p>
        )}

        <button
          type="submit"
          disabled={isPending || !kvkk || !terms}
          className="w-full bg-kx-red text-white rounded-xl px-5 py-3 text-[14px] font-semibold disabled:opacity-50 transition shadow-kx-red mt-1"
        >
          {isPending ? '...' : `${t('kayitBtn')} →`}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-kx-muted">
        {t('hesapVar')}{' '}
        <Link href="/giris" className="font-semibold text-kx-navy no-underline hover:underline">
          {t('girisLink')}
        </Link>
      </p>
    </>
  )
}
