import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { KxLogo } from './KxLogo'
import KxPill from './KxPill'

/**
 * Shared two-column auth layout.
 * Left: lacivert brand panel with copy + feature highlights + mini testimonial.
 * Right: pure white form area on top of a light bg.
 *
 * Used by: GirisFormu, KayitFormu, SifreSifirlamaFormu, SifreGuncelleFormu.
 *
 * Variant just controls which copy block to render in the brand panel.
 */

type Variant = 'giris' | 'kayit' | 'reset'

const COPY: Record<Variant, { kicker: string; titleA: string; titleB: string; subtitle: string }> = {
  giris: {
    kicker:   'Tekrar hoş geldin',
    titleA:   'Bıraktığın yerden',
    titleB:   'devam et.',
    subtitle: 'Hikaye haritaların, analiz dokümanların ve prototiplerin seni bekliyor.',
  },
  kayit: {
    kicker:   'Hoş geldin',
    titleA:   'Bir cümleyle başla,',
    titleB:   'dakikalar içinde taslağına kavuş.',
    subtitle: "Türkiye'nin önde gelen iş analizi ekipleri Kurgemx kullanıyor. Sen de denemeye başla.",
  },
  reset: {
    kicker:   'Şifre yardımı',
    titleA:   'Birkaç tıklama içinde',
    titleB:   'tekrar içeride ol.',
    subtitle: 'Sıfırlama bağlantısı e-postanıza ulaşır ulaşmaz yeni bir şifre belirleyebilirsin.',
  },
}

function BrandPanel({ variant }: { variant: Variant }) {
  const c = COPY[variant]
  return (
    <div className="bg-kx-navy text-white p-10 flex flex-col relative overflow-hidden min-h-full">
      <div
        aria-hidden="true"
        className="absolute -top-25 -right-25 w-75 h-75 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(46,117,182,0.25), transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-30 -left-20 w-65 h-65 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(230,51,41,0.18), transparent 70%)' }}
      />
      <div className="relative z-10">
        <KxLogo light size={22} />
      </div>
      <div className="flex-1 flex flex-col justify-center relative z-10 max-w-[420px]">
        <KxPill tone="amber">— {c.kicker}</KxPill>
        <h2 className="font-display text-[40px] font-bold tracking-[-0.025em] leading-[1.1] mt-3.5 mb-4 text-white text-balance">
          {c.titleA} <span className="text-kx-amber">{c.titleB}</span>
        </h2>
        <p className="text-[15px] text-white/75 leading-[1.55] mb-7">{c.subtitle}</p>

        <div className="flex flex-col gap-3.5">
          {[
            ['Hikaye haritası',          'Destan, hikaye, kabul kriteri — eksiksiz'],
            ['İş analizi dokümanı',      'Müşteriye yollanabilir .docx, dakikalar içinde'],
            ['Tıklanabilir prototip',    'Paydaş demosu için çalışan HTML akış'],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-kx-red grid place-items-center text-[11px] font-bold shrink-0">✓</div>
              <div>
                <div className="text-[14px] font-semibold text-white">{t}</div>
                <div className="text-[12px] text-white/60 mt-0.5">{d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-9 p-4.5 bg-white/6 border border-white/12 rounded-xl">
          <p className="text-[13px] text-white/90 m-0 leading-[1.55] italic">
            "Workshop biter bitmez taslak hazır. 15 yıllık kariyerimde böyle bir aracı görmemiştim."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div
              className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold"
              style={{ background: 'linear-gradient(135deg, #2E75B6, #E63329)' }}
            >
              ES
            </div>
            <div className="text-[12px] text-white/70">Elif S. — Kıdemli İş Analisti</div>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex justify-between text-[11px] text-white/45">
        <div>© {new Date().getFullYear()} KurgemX</div>
        <div className="flex gap-4">
          <a href="/privacy" className="text-inherit no-underline">Gizlilik</a>
          <a href="/terms" className="text-inherit no-underline">KVKK</a>
        </div>
      </div>
    </div>
  )
}

type Props = {
  variant: Variant
  /** Form column content */
  children: ReactNode
  /** Top-right helper: "Hesabın yok mu?", "Giriş sayfasına dön", etc. */
  topRight?: ReactNode
}

export default function AuthLayout({ variant, children, topRight }: Props) {
  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-[480px_1fr] min-h-screen bg-white">
        <BrandPanel variant={variant} />
        <div className="flex flex-col justify-center items-center py-10 bg-kx-bg relative">
          {topRight && (
            <div className="absolute top-6 right-8 text-[13px] text-kx-muted flex items-center gap-3">
              {topRight}
            </div>
          )}
          <div className="w-full max-w-[400px] px-6">{children}</div>
        </div>
      </main>
    </>
  )
}
