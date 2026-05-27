import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import AuthLayout from '@/components/ui/AuthLayout'
import SifreGuncelleFormu from '@/components/SifreGuncelleFormu'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.sifreGuncelle')
  return { title: t('baslik') }
}

export default function SifreGuncellePage() {
  return (
    <AuthLayout variant="reset">
      <SifreGuncelleFormu />
    </AuthLayout>
  )
}
