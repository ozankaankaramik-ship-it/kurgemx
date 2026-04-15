import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import SifreGuncelleFormu from '@/components/SifreGuncelleFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.sifreGuncelle')
  return { title: t('baslik') }
}

export default function SifreGuncellePage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <SifreGuncelleFormu />
    </main>
  )
}
