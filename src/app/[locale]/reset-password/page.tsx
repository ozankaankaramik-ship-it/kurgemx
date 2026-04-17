import type { Metadata } from 'next'
import SifreGuncelleFormu from '@/components/SifreGuncelleFormu'

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <SifreGuncelleFormu />
    </main>
  )
}
