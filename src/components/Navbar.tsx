"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { usePathname, useRouter, Link } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/client"
import { cikisYap } from "@/lib/auth/actions"
import type { User } from "@supabase/supabase-js"

export default function Navbar() {
  const tNav = useTranslations("nav")
  const tLang = useTranslations("language")
  const tAuth = useTranslations("auth")
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
    const other = locale === "tr" ? "en" : "tr"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathname as any, { locale: other })
  }

  const displayName =
    (user?.user_metadata?.ad as string | undefined) ||
    user?.email?.split("@")[0] ||
    ""

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : "?"

  return (
    <nav
      className="h-[52px] px-4 flex items-center shrink-0"
      style={{ backgroundColor: "#1F3864" }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">

        {/* Left: logo + auth-gated nav links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 leading-none">
            <Image
              src="/kurgemx-icon.svg"
              alt="KurgemX"
              width={28}
              height={28}
              priority
            />
            <span
              className="font-bold text-[20px] text-white leading-none"
              style={{ fontFamily: "'Exo 2', 'Segoe UI', sans-serif" }}
            >
              Kurgem<span style={{ color: '#E63329' }}>X</span>
            </span>
          </Link>

          {!loadingUser && user && (
            <>
              <Link
                href="/projeler"
                className="text-[13px] text-white/80 hover:text-white transition-colors"
              >
                {tNav("projeler")}
              </Link>
              <Link
                href="/projeler/yeni"
                className="text-[13px] text-white/80 hover:text-white transition-colors"
              >
                {tNav("newProject")}
              </Link>
            </>
          )}
        </div>

        {/* Right: language switcher + auth section */}
        <div className="flex items-center gap-3">

          {/* Language switcher */}
          <button
            onClick={switchLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] transition-colors hover:bg-white/10"
            style={{ border: "0.5px solid rgba(255,255,255,0.40)" }}
          >
            <span className="font-bold text-white">{tLang("code")}</span>
            <span style={{ color: "rgba(255,255,255,0.60)" }}>{tLang("name")}</span>
          </button>

          {/* Auth section */}
          {loadingUser ? (
            <div
              className="h-[30px] w-24 rounded-md animate-pulse"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            />
          ) : user ? (
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-full text-[11px] font-semibold text-white shrink-0"
                style={{ width: 30, height: 30, backgroundColor: "#2E75B6" }}
              >
                {initials}
              </div>
              <span
                className="hidden sm:block text-[13px] max-w-[130px] truncate"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {displayName}
              </span>
              <form action={cikisYap}>
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="text-[12px] font-medium text-white px-2.5 py-1 rounded-md transition-colors hover:bg-white/10"
                  style={{ border: "0.5px solid rgba(255,255,255,0.30)", backgroundColor: "transparent" }}
                >
                  {tAuth("cikisYap")}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="text-[13px] text-white hover:text-white/80 transition-colors"
              >
                {tNav("signIn")}
              </Link>
              <Link
                href="/kayit"
                className="text-[12px] font-medium text-white px-3 py-1.5 rounded-[6px] transition-colors hover:opacity-90"
                style={{ backgroundColor: "#E63329" }}
              >
                {tNav("getStarted")}
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
