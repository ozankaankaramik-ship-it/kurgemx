import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import KayitFormu from '@/components/KayitFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.kayit')
  return { title: t('baslik') }
}

export default function KayitPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <KayitFormu />
    </main>
  )
}
