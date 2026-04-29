import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import YeniProjeFormu from '@/components/YeniProjeFormu'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('yeniProje')
  return { title: t('baslik') }
}

export default async function YeniProjePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const locale = await getLocale()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <YeniProjeFormu />
    </main>
  )
}
