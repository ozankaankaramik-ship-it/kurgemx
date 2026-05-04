'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cikisYap } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'

export default function KullaniciMenu() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="w-24 h-8 rounded-md bg-gray-100 animate-pulse" />
  }

  if (user) {
    const displayName =
      (user.user_metadata?.ad as string | undefined) ||
      user.email?.split('@')[0] ||
      'Kullanıcı'

    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[160px]">
          {displayName}
        </span>
        <form action={cikisYap}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {t('cikisYap')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/giris"
        className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        {t('girisYap')}
      </Link>
      <Link
        href="/kayit"
        className="text-sm bg-[#1F3864] text-white px-3 py-1.5 rounded-md hover:bg-[#2E75B6] transition-colors"
      >
        {t('kayitOl')}
      </Link>
    </div>
  )
}
