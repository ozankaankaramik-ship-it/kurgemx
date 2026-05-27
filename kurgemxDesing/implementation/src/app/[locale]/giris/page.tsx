import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import type { Metadata } from 'next'
import AuthLayout from '@/components/ui/AuthLayout'
import { Link } from '@/i18n/navigation'
import GirisFormu from '@/components/GirisFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.giris')
  return { title: t('baslik') }
}

export default async function GirisPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (user) {
    redirect({ href: '/projeler', locale })
  }

  return (
    <AuthLayout
      variant="giris"
      topRight={
        <>
          <span>{locale === 'tr' ? 'Hesabın yok mu?' : "Don't have an account?"}</span>
          <Link href="/kayit" className="text-kx-ink font-semibold no-underline hover:text-kx-blue transition-colors">
            {locale === 'tr' ? 'Hesap aç' : 'Sign up'}
          </Link>
        </>
      }
    >
      <GirisFormu />
    </AuthLayout>
  )
}
