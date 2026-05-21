import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import SifreSifirlamaFormu from '@/components/SifreSifirlamaFormu'

type Props = {
  searchParams: Promise<{ error?: string; error_code?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.sifreSifirlama')
  return { title: t('baslik') }
}

export default async function SifreSifirlamaPage({ searchParams }: Props) {
  const params = await searchParams
  const expiredLink =
    params.error === 'expired' ||
    params.error === 'access_denied' ||
    params.error_code === 'otp_expired'

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <SifreSifirlamaFormu expiredLink={expiredLink} />
    </main>
  )
}
