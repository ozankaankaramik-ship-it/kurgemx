'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { cikisYap } from '@/lib/auth/actions'
import type { User } from '@supabase/supabase-js'
import { KxLogo } from './ui/KxLogo'

export default function Navbar() {
  const tNav = useTranslations('nav')
  const tLang = useTranslations('language')
  const tAuth = useTranslations('auth')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <nav className="bg-kx-navy shrink-0 relative z-50">
      {/* ── Main row ── */}
      <div className="h-16 px-4 sm:px-8 flex items-center">
        <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">

          {/* Left: brand + desktop nav links */}
          <div className="flex items-center gap-9">
            <Link href="/" className="flex items-center leading-none">
              <KxLogo light size={20} />
            </Link>

            {!loadingUser && user ? (
              <div className="hidden md:flex items-center gap-6 text-[13.5px] text-white/78">
                <Link
                  href="/projeler"
                  className="text-white font-medium hover:text-white transition-colors"
                >
                  {tNav('projeler')}
                </Link>
                <Link
                  href="/projeler/yeni"
                  className="hover:text-white transition-colors"
                >
                  {tNav('newProject')}
                </Link>
              </div>
            ) : !loadingUser ? (
              <div className="hidden md:flex items-center gap-7 text-[13.5px] text-white/78">
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

          {/* Desktop right: language + auth */}
          <div className="hidden md:flex items-center gap-3">
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
                <button
                  aria-label="Bildirimler"
                  className="w-[34px] h-[34px] rounded-lg border border-white/25 grid place-items-center text-white/85 hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </button>
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

          {/* Mobile right: language + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={switchLanguage}
              className="text-[12px] font-bold text-white px-2 py-1 rounded border border-white/40 hover:bg-white/10 transition-colors"
            >
              {tLang('code')}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menüyü aç"
              aria-expanded={mobileOpen}
              className="w-9 h-9 grid place-items-center rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-kx-navy border-t border-white/10 px-4 py-3 flex flex-col shadow-xl">
          {!loadingUser && user ? (
            <>
              <Link
                href="/projeler"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('projeler')}
              </Link>
              <Link
                href="/projeler/yeni"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('newProject')}
              </Link>
              <div className="pt-2">
                <form action={cikisYap}>
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    className="w-full text-left text-[14px] text-white/70 py-3 px-1 hover:text-white transition-colors"
                  >
                    {tAuth('cikisYap')}
                  </button>
                </form>
              </div>
            </>
          ) : !loadingUser ? (
            <>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('about') ?? 'Ürün'}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('pricing') ?? 'Fiyatlandırma'}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('hakkimizda') ?? 'Hakkımızda'}
              </Link>
              <div className="flex gap-2 pt-3 pb-1">
                <Link
                  href="/giris"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-[13px] text-white py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                >
                  {tNav('signIn')}
                </Link>
                <Link
                  href="/kayit"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-[13px] font-semibold text-white bg-kx-red py-2 rounded-lg hover:bg-kx-red-hover transition-all shadow-kx-red"
                >
                  {tNav('getStarted')}
                </Link>
              </div>
            </>
          ) : null}
        </div>
      )}
    </nav>
  )
}
