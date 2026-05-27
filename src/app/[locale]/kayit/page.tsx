import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import type { Metadata } from 'next'
import AuthLayout from '@/components/ui/AuthLayout'
import { Link } from '@/i18n/navigation'
import KayitFormu from '@/components/KayitFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.kayit')
  return { title: t('baslik') }
}

export default async function KayitPage() {
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
      variant="kayit"
      topRight={
        <>
          <span>{locale === 'tr' ? 'Hesabın var mı?' : 'Already have an account?'}</span>
          <Link href="/giris" className="text-kx-ink font-semibold no-underline hover:text-kx-blue transition-colors">
            {locale === 'tr' ? 'Giriş yap' : 'Sign in'}
          </Link>
        </>
      }
    >
      <KayitFormu />
    </AuthLayout>
  )
}
