'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { cikisYap } from '@/lib/auth/actions'
import type { User } from '@supabase/supabase-js'
import { KxLogo } from './ui/KxLogo'

/**
 * Refreshed top navbar.
 * - Public surface (logged out): wider, bigger hover area, red "Ücretsiz başla" CTA
 * - In-app surface (logged in): muted nav links + avatar + notification bell
 */
export default function Navbar() {
  const tNav = useTranslations('nav')
  const tLang = useTranslations('language')
  const tAuth = useTranslations('auth')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoadingUser(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const switchLanguage = () => {
    const other = locale === 'tr' ? 'en' : 'tr'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathname as any, { locale: other })
  }

  const displayName =
    (user?.user_metadata?.ad as string | undefined) ||
    user?.email?.split('@')[0] ||
    ''
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '?'

  return (
    <nav className="h-16 bg-kx-navy px-8 flex items-center shrink-0">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">

        {/* ── Left: brand + nav links ── */}
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center leading-none">
            <KxLogo light size={20} />
          </Link>

          {!loadingUser && user ? (
            // In-app nav links
            <div className="flex items-center gap-6 text-[13.5px] text-white/78">
              <Link
                href="/projeler"
                className="text-white font-medium hover:text-white transition-colors"
              >
                {tNav('projeler')}
              </Link>
              {/* Hard navigate for new project — see legacy Navbar.tsx note */}
              <a
                href={locale === 'en' ? '/en/projects/new' : '/tr/projeler/yeni'}
                className="hover:text-white transition-colors"
              >
                {tNav('newProject')}
              </a>
            </div>
          ) : !loadingUser ? (
            // Public nav links
            <div className="flex items-center gap-7 text-[13.5px] text-white/78">
              <Link href="/about" className="hover:text-white transition-colors">
                {tNav('about') ?? 'Ürün'}
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                {tNav('pricing') ?? 'Fiyatlandırma'}
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                {tNav('hakkimizda') ?? 'Hakkımızda'}
              </Link>
            </div>
          ) : null}
        </div>

        {/* ── Right: language + auth area ── */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={switchLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors hover:bg-white/10 border border-white/40"
          >
            <span className="font-bold text-white">{tLang('code')}</span>
            <span className="text-white/60">{tLang('name')}</span>
          </button>

          {loadingUser ? (
            <div className="h-[30px] w-24 rounded-md animate-pulse bg-white/10" />
          ) : user ? (
            <>
              {/* Notification bell */}
              <button
                aria-label="Bildirimler"
                className="w-[34px] h-[34px] rounded-lg border border-white/25 grid place-items-center text-white/85 hover:bg-white/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
              {/* Avatar + name */}
              <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-full bg-kx-blue text-white text-[11px] font-semibold grid place-items-center">
                  {initials}
                </div>
                <span className="hidden sm:block text-[13px] text-white/85 max-w-[130px] truncate">
                  {displayName}
                </span>
                <form action={cikisYap}>
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    className="text-[12px] font-medium text-white px-2.5 py-1 rounded-md transition-colors hover:bg-white/10 border border-white/30 bg-transparent"
                  >
                    {tAuth('cikisYap')}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="text-[13.5px] text-white px-3 py-1.5 hover:text-white/80 transition-colors font-medium"
              >
                {tNav('signIn')}
              </Link>
              <Link
                href="/kayit"
                className="text-[12.5px] font-semibold text-white bg-kx-red px-4 py-2 rounded-lg transition-all hover:bg-kx-red-hover shadow-kx-red"
              >
                {tNav('getStarted')} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
