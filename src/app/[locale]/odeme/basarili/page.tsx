import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import ConfettiRain from '@/components/ConfettiRain'

export const metadata: Metadata = { title: 'Ödeme Başarılı' }

export default function OdemeBasariliPage() {
  return (
    <main className="flex-1 bg-kx-bg flex items-center justify-center px-6 py-24 relative">
      <ConfettiRain />

      <div className="text-center max-w-[420px] relative z-10">
        {/* Onay ikonu */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7"
          style={{ background: '#DCFCE7' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18l6.5 6.5L28 12"
              stroke="#16A34A"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-[30px] font-bold text-kx-ink mb-3 tracking-tight">
          Ödemeniz alındı!
        </h1>
        <p className="text-[15px] text-kx-body leading-relaxed mb-8">
          Planınız başarıyla aktifleştirildi.
          <br />
          Artık tüm özelliklere erişebilirsiniz.
        </p>

        <Link
          href="/projeler"
          className="inline-flex items-center gap-2 px-7 h-[42px] rounded-lg text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-85"
          style={{ background: '#1F3864' }}
        >
          Dashboard&apos;a Git
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
