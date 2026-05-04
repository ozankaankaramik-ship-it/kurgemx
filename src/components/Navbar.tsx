"use client"

import { useEffect, useState } from "react"
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
    // next-intl typed router.replace requires params for dynamic routes — cast to bypass
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathname as any, { locale: other })
  }

  const displayName =
    (user?.user_metadata?.ad as string | undefined) ||
    user?.email?.split("@")[0] ||
    ""

  return (
    <nav
      className="h-[52px] px-4 flex items-center shrink-0"
      style={{ backgroundColor: "#1F3864" }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">

        {/* Left: logo + auth-gated nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[17px] font-medium text-white leading-none"
          >
            Kurge<span style={{ color: "#7EB3E8" }}>m</span>X
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

          {/* Language switcher — shows current locale, click to switch */}
          <button
            onClick={switchLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium text-white transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.28)" }}
          >
            <span className="font-semibold">{tLang("code")}</span>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>{tLang("name")}</span>
          </button>

          {/* Auth section */}
          {loadingUser ? (
            <div
              className="h-[30px] w-24 rounded-md animate-pulse"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
          ) : user ? (
            /* Signed-in user: avatar + name + sign out */
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-full text-[11px] font-semibold text-white shrink-0"
                style={{ width: 30, height: 30, backgroundColor: "#2E75B6" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-[13px] text-white/80 max-w-[130px] truncate">
                {displayName}
              </span>
              <form action={cikisYap}>
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="text-[12px] font-medium text-white px-2.5 py-1 rounded-md transition-colors hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.28)" }}
                >
                  {tAuth("cikisYap")}
                </button>
              </form>
            </div>
          ) : (
            /* Not signed in: sign in + get started */
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="text-[13px] text-white/80 hover:text-white transition-colors"
              >
                {tNav("signIn")}
              </Link>
              <Link
                href="/kayit"
                className="text-[12px] font-medium text-white px-3 py-1.5 rounded-md transition-colors"
                style={{ backgroundColor: "#2E75B6" }}
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
