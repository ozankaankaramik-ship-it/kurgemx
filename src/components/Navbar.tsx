'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [planInfo, setPlanInfo] = useState<{ kod: string; ad: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoadingUser(false)

      if (session?.user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        supabase
          .from('abonelikler')
          .select('plan:planlar!plan_id(kod, ad)')
          .eq('kullanici_id', session.user.id)
          .eq('durum', 'aktif')
          .order('baslangic', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data: abo }) => {
            const p = (abo as { plan?: { kod: string; ad: string } } | null)?.plan
            setPlanInfo(p ?? { kod: 'freemium', ad: 'Freemium' })
          })
      } else if (!session?.user) {
        setPlanInfo(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [dropdownOpen])

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

  const planKod = planInfo?.kod ?? 'freemium'
  const showUpgrade = !['advanced', 'enterprise'].includes(planKod)
  const planBadgeClass: Record<string, string> = {
    freemium:   'bg-gray-100 text-gray-500',
    analyst:    'bg-[#EEF4FB] text-[#1F3864]',
    advanced:   'bg-[#EDE9FE] text-[#5B21B6]',
    enterprise: 'bg-[#FEF3C7] text-[#92400E]',
  }

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
                  {tNav('hakkimizda')}
                </Link>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {tNav('pricing')}
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {tNav('iletisim')}
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors"
                >
                  <div className="w-[30px] h-[30px] rounded-full bg-kx-blue text-white text-[11px] font-semibold grid place-items-center shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-[13px] text-white/85 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className={`text-white/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-kx-border z-50 overflow-hidden">
                    {/* Kullanıcı bilgisi + plan */}
                    <div className="px-4 py-3 border-b border-kx-border-soft">
                      <div className="text-[13px] font-semibold text-kx-ink truncate">{displayName}</div>
                      <div className="text-[11px] text-kx-muted truncate mt-0.5">{user.email}</div>
                      {planInfo && (
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${planBadgeClass[planKod] ?? 'bg-gray-100 text-gray-500'}`}>
                          {planInfo.ad}
                        </span>
                      )}
                    </div>

                    {/* Hesap Ayarları */}
                    <Link
                      href="/hesap"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-kx-body hover:bg-kx-bg transition-colors no-underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      {locale === 'tr' ? 'Hesap Ayarları' : 'Account Settings'}
                    </Link>

                    {/* Plan yükselt */}
                    {showUpgrade && (
                      <Link
                        href="/pricing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-kx-blue font-medium hover:bg-kx-blue-soft transition-colors no-underline"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        {locale === 'tr' ? 'Planı Yükselt' : 'Upgrade Plan'}
                      </Link>
                    )}

                    <div className="border-t border-kx-border-soft" />

                    {/* Çıkış */}
                    <form action={cikisYap}>
                      <input type="hidden" name="locale" value={locale} />
                      <button
                        type="submit"
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-kx-body hover:bg-kx-bg transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        {tAuth('cikisYap')}
                      </button>
                    </form>
                  </div>
                )}
              </div>
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
              {/* Kullanıcı bilgisi + plan */}
              <div className="py-3 px-1 border-b border-white/10">
                <div className="text-[13px] font-semibold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-white/50 truncate mt-0.5">{user.email}</div>
                {planInfo && (
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${planBadgeClass[planKod] ?? 'bg-gray-100 text-gray-500'}`}>
                    {planInfo.ad}
                  </span>
                )}
              </div>
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
              <Link
                href="/hesap"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {locale === 'tr' ? 'Hesap Ayarları' : 'Account Settings'}
              </Link>
              {showUpgrade && (
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] text-kx-amber py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
                >
                  {locale === 'tr' ? 'Planı Yükselt →' : 'Upgrade Plan →'}
                </Link>
              )}
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
                {tNav('hakkimizda')}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('pricing')}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="text-[14px] text-white/85 py-3 px-1 border-b border-white/10 hover:text-white transition-colors"
              >
                {tNav('iletisim')}
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
