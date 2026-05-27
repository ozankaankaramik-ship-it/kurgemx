import KxPill from '@/components/ui/KxPill'

/**
 * Three persona cards: İş Analisti, Ürün Yöneticisi, Developer / Danışman.
 * (Note: "Developer / Danışman" replaces the older "Ajans / Danışman".)
 */

type Persona = {
  role: string
  who: string
  pain: string
  win: string
  before: string
  after: string
  toneClass: string
  ringClass: string
}

const PERSONAS: Persona[] = [
  {
    role: 'İş Analisti',
    who: 'Banka, fintech, kurumsal',
    pain: "Workshop sonrası 3 gün Word'de boğuluyorum.",
    win: 'Workshop biter bitmez ilk taslak hazır.',
    before: '3 gün',
    after: '15 dakika',
    toneClass: 'bg-kx-blue',
    ringClass: 'before:bg-kx-blue',
  },
  {
    role: 'Ürün Yöneticisi',
    who: 'B2B SaaS, startup',
    pain: 'Sprint planlaması için elimde anlamlı bir döküman yok.',
    win: 'R1/R2/R3 sürüm haritası ve sprint dağılımı hazır.',
    before: '—',
    after: 'Sürüm planı',
    toneClass: 'bg-kx-red',
    ringClass: 'before:bg-kx-red',
  },
  {
    role: 'Developer / Danışman',
    who: 'Freelance, butik danışmanlık',
    pain: "Müşteri brief'ini koda çevirmek günler alıyor.",
    win: 'İlk görüşmede çalışan bir taslak gösteriyorum.',
    before: '5 gün',
    after: '1 görüşme',
    toneClass: 'bg-kx-amber',
    ringClass: 'before:bg-kx-amber',
  },
]

export default function UseCases() {
  return (
    <section className="bg-kx-bg py-22 px-8 border-t border-kx-border">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <KxPill tone="blue">— Kimler için</KxPill>
            <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 leading-[1.1] max-w-[600px]">
              Üç farklı rol, aynı zaman kazancı.
            </h2>
          </div>
          <a href="/#" className="text-kx-blue text-[14px] no-underline font-semibold">
            Tüm vakaları gör →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PERSONAS.map((p) => (
            <div
              key={p.role}
              className={`relative bg-white rounded-2xl p-6 border border-kx-border overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 ${p.ringClass}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] text-kx-muted font-semibold tracking-[0.06em] uppercase">
                  {p.who}
                </div>
                <span className="bg-kx-bg text-[11px] px-2 py-0.5 rounded text-kx-muted font-mono">persona</span>
              </div>
              <div className="font-display text-[26px] font-bold text-kx-ink tracking-tight mb-3.5">
                {p.role}
              </div>
              <div className="text-[13px] text-kx-body px-3 py-2.5 bg-[#FFF7ED] rounded-md mb-2 italic border-l-[3px] border-kx-amber">
                "{p.pain}"
              </div>
              <div className="text-[13px] text-kx-body px-3 py-2.5 bg-kx-green-soft rounded-md mb-4 border-l-[3px] border-kx-green">
                → {p.win}
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="px-3 py-2.5 bg-kx-bg rounded-md">
                  <div className="text-kx-muted text-[10px] mb-0.5">ÖNCE</div>
                  <div className="text-kx-ink font-semibold">{p.before}</div>
                </div>
                <div className={`px-3 py-2.5 ${p.toneClass} text-white rounded-md`}>
                  <div className="text-white/70 text-[10px] mb-0.5">SONRA</div>
                  <div className="font-bold">{p.after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
