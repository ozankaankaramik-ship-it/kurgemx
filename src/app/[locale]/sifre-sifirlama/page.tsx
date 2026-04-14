import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import SifreSifirlamaFormu from '@/components/SifreSifirlamaFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.sifreSifirlama')
  return { title: t('baslik') }
}

export default function SifreSifirlamaPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <SifreSifirlamaFormu />
    </main>
  )
}
