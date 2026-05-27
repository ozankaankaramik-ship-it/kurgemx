import type { Metadata } from 'next'
import AuthLayout from '@/components/ui/AuthLayout'
import SifreGuncelleFormu from '@/components/SifreGuncelleFormu'

export const metadata: Metadata = {
  title: 'Reset Password',
}

/**
 * English alias for /sifre-guncelle. Same component, same flow.
 * Keeps the existing route from the repo working.
 */
export default function ResetPasswordPage() {
  return (
    <AuthLayout variant="reset">
      <SifreGuncelleFormu />
    </AuthLayout>
  )
}
