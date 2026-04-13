import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import GirisFormu from '@/components/GirisFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.giris')
  return { title: t('baslik') }
}

export default function GirisPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <GirisFormu />
    </main>
  )
}
