/**
 * Interactive product preview shown in the hero and re-used inside
 * Features → Story Map. Pure SVG/HTML; no client interactivity.
 *
 * Layout:
 *   ┌────────────────────────────────────────┐
 *   │ ● ● ●   kurgemx.com / projeler / ...   │  ← traffic lights + url
 *   ├────────────────────────────────────────┤
 *   │ Brief ✓  Harita ✓  Analiz ▶ Prototip…  │  ← step nav (3rd active)
 *   ├────────────────────────────────────────┤
 *   │   ┌──────┬──────┬──────┬──────┐         │
 *   │   │ Kayıt│Trans.│Yatır.│Bildi.│  ← epics │
 *   │   ├──────┴──────┴──────┴──────┤         │
 *   │   │  R1 cards (red border)    │         │
 *   │   │  R2 cards (amber border)  │         │
 *   │   │  R3 cards (blue border)   │         │
 *   │   └────────────────────────────┘        │
 *   └────────────────────────────────────────┘
 */

const EPICS = ['Kayıt & Onboarding', 'Para Transferi', 'Yatırım', 'Bildirimler'] as const

type Card = string

type Release = {
  label: string
  tone: 'red' | 'amber' | 'blue'
  cards: Card[][]
}

const RELEASES: Release[] = [
  {
    label: 'R1 — MVP',
    tone: 'red',
    cards: [
      ['Email kayıt', 'Telefon doğrulama'],
      ['IBAN ile gönder', 'Geçmiş işlemler'],
      ['Hesap özeti'],
      ['Push uyarısı'],
    ],
  },
  {
    label: 'R2 — Geliştirme',
    tone: 'amber',
    cards: [
      ['Yüz tanıma'],
      ['QR ile gönder', 'Talep et'],
      ['Fon listesi', 'Alım/satım'],
      ['SMS uyarısı'],
    ],
  },
  {
    label: 'R3 — İleri',
    tone: 'blue',
    cards: [
      ['Sosyal giriş'],
      ['Toplu transfer'],
      ['Robo-danışman'],
      ['Akıllı segment'],
    ],
  },
]

const TONE_BORDER: Record<Release['tone'], string> = {
  red:   'border-l-kx-red',
  amber: 'border-l-kx-amber',
  blue:  'border-l-kx-blue',
}
const TONE_TEXT: Record<Release['tone'], string> = {
  red:   'text-kx-red',
  amber: 'text-kx-amber-ink',
  blue:  'text-kx-blue',
}
const TONE_BG: Record<Release['tone'], string> = {
  red:   'bg-kx-red',
  amber: 'bg-kx-amber',
  blue:  'bg-kx-blue',
}

const STEPS = [
  { label: 'Proje',         done: true,  active: false },
  { label: 'Hikaye haritası',done: true,  active: false },
  { label: 'İş analizi',    done: false, active: true  },
  { label: 'Prototip',      done: false, active: false },
  { label: 'Test',          done: false, active: false },
] as const

export default function HeroProductPreview() {
  return (
    <div className="relative bg-white rounded-2xl border border-kx-border shadow-kx-hero overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-kx-border-soft bg-[#fcfcfd]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FC615C]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FDBC40]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#34C748]" />
        </div>
        <div className="flex-1 text-center font-mono text-[11px] text-kx-faint">
          kurgemx.com / projeler / mobil-bankacilik-mvp
        </div>
        <span className="inline-flex items-center gap-1.5 bg-kx-green-soft text-kx-green-ink text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-kx-green" /> Canlı
        </span>
      </div>

      {/* App body */}
      <div className="p-5">
        {/* Step nav */}
        <div className="flex items-center text-[12px] mb-4">
          {STEPS.map((s, i) => {
            const dotBg = s.done ? 'bg-kx-green' : s.active ? 'bg-kx-blue' : 'bg-[#E8EAEE]'
            const dotFg = s.done || s.active ? 'text-white' : 'text-kx-faint'
            const wrapBg = s.active ? 'bg-kx-blue-soft' : 'bg-transparent'
            const labelClr = s.active ? 'text-kx-ink' : 'text-kx-faint'
            return (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${wrapBg}`}>
                  <span
                    className={`w-[18px] h-[18px] rounded-full ${dotBg} ${dotFg} text-[10px] font-bold grid place-items-center`}
                  >
                    {s.done ? '✓' : i + 1}
                  </span>
                  <span className={`${labelClr} ${s.active ? 'font-semibold' : ''}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <span className="w-5 h-px bg-kx-border" />}
              </div>
            )
          })}
        </div>

        {/* Story map */}
        <div className="bg-kx-bg rounded-xl p-3.5 border border-kx-border-soft">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-semibold text-kx-ink">Hikaye Haritası</div>
            <div className="flex gap-2 text-[11px] text-kx-muted">
              <span>4 destan</span>
              <span className="text-kx-faint">·</span>
              <span>18 hikaye</span>
              <span className="text-kx-faint">·</span>
              <span>3 sürüm</span>
            </div>
          </div>

          {/* Epics row */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {EPICS.map((e) => (
              <div key={e} className="bg-kx-navy text-white text-[11px] font-semibold py-2 px-2.5 rounded text-center">
                {e}
              </div>
            ))}
          </div>

          {/* Release rows */}
          {RELEASES.map((row, ri) => (
            <div key={row.label} className={ri < RELEASES.length - 1 ? 'mb-2' : ''}>
              <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider mb-1 ${TONE_TEXT[row.tone]}`}>
                <span className={`w-1 h-3.5 ${TONE_BG[row.tone]} rounded-sm`} />
                {row.label}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {row.cards.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-1">
                    {col.map((card) => (
                      <div
                        key={card}
                        className={`bg-white border border-kx-border-soft border-l-[3px] ${TONE_BORDER[row.tone]} text-[10.5px] text-kx-body px-2 py-1.5 rounded-sm leading-tight`}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI generating banner */}
      <div className="absolute bottom-4 right-4 bg-kx-ink text-white px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-[12px] shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-kx-amber animate-kx-pulse" style={{ boxShadow: '0 0 8px #FBBF24' }} />
        <span>
          YZ: İş analizi dokümanı oluşturuluyor… <span className="text-white/50">3/5 bölüm</span>
        </span>
      </div>
    </div>
  )
}
