import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import AuthLayout from '@/components/ui/AuthLayout'
import { Link } from '@/i18n/navigation'
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
    <AuthLayout
      variant="reset"
      topRight={
        <Link href="/giris" className="text-kx-ink font-medium no-underline hover:text-kx-blue transition-colors">
          ← Giriş sayfasına dön
        </Link>
      }
    >
      <SifreSifirlamaFormu expiredLink={expiredLink} />
    </AuthLayout>
  )
}
