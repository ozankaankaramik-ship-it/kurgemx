import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'

export const metadata: Metadata = { title: 'Ödeme Başarısız' }

export default function OdemeBasarisizPage() {
  return (
    <main className="flex-1 bg-kx-bg flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-[420px]">
        {/* Hata ikonu */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7"
          style={{ background: '#FDECEB' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M11 11l14 14M25 11L11 25"
              stroke="#E63329"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-[30px] font-bold text-kx-ink mb-3 tracking-tight">
          Ödeme tamamlanamadı
        </h1>
        <p className="text-[15px] text-kx-body leading-relaxed mb-8">
          İşlem sırasında bir sorun oluştu.
          <br />
          Kartınızı kontrol ederek tekrar deneyebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 h-[38px] rounded-lg text-[13px] font-semibold text-white no-underline transition-opacity hover:opacity-85"
            style={{ background: '#1F3864' }}
          >
            Tekrar Dene
          </Link>
          <a
            href="mailto:support@kurgemx.com"
            className="inline-flex items-center gap-2 px-7 h-[38px] rounded-lg text-[13px] font-semibold no-underline transition-colors hover:bg-kx-blue-soft"
            style={{ border: '0.5px solid #2E75B6', color: '#1F3864' }}
          >
            Destek ile İletişim
          </a>
        </div>
      </div>
    </main>
  )
}
