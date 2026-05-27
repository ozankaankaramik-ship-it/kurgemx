import KxPill from '@/components/ui/KxPill'

/**
 * "Eski yöntem vs Kurgemx" — twin cards side by side.
 * Communicates the time-saving in 5 concrete rows.
 */

const OLD_ROWS: Array<[string, string]> = [
  ['Workshop maratonu', '2 gün, 6 kişi'],
  ['Hikaye haritası elle', '4–6 saat'],
  ["Word'de iş analizi", '3–5 gün'],
  ['Prototip için ayrı tool', '+2 gün'],
  ['Test senaryoları manuel', '+1 gün'],
]
const NEW_ROWS: Array<[string, string]> = [
  ['Projeni 1 cümleyle anlat', '30 saniye'],
  ['Hikaye haritası AI üretir', '2 dakika'],
  ['İş analizi dokümanı .docx', '4 dakika'],
  ['Tıklanabilir prototip .html', '3 dakika'],
  ['Test senaryoları .xlsx', '2 dakika'],
]

export default function BeforeAfter() {
  return (
    <section className="bg-kx-bg-warm py-22 px-8">
      <div className="max-w-[1080px] mx-auto text-center mb-14">
        <KxPill tone="amber">— Eski yöntemle vs. Kurgemx ile</KxPill>
        <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3.5 leading-[1.1] text-balance">
          2 haftalık Word maratonu mu,
          <br />
          yoksa <span className="text-kx-red">öğleden önce biten</span> bir taslak mı?
        </h2>
      </div>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Old way */}
        <div className="bg-white rounded-2xl p-7 border border-kx-border">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-lg bg-[#F1F2F4] grid place-items-center text-kx-muted text-base">×</span>
            <div>
              <div className="text-[11px] text-kx-muted font-semibold tracking-[0.08em] uppercase">Eski yöntem</div>
              <div className="text-[17px] font-bold text-kx-ink">Word + Excel + Miro</div>
            </div>
          </div>
          {OLD_ROWS.map(([t, d]) => (
            <div
              key={t}
              className="flex justify-between py-3 border-t border-kx-border-soft text-[13px]"
            >
              <span className="text-kx-body">{t}</span>
              <span className="text-kx-muted font-mono text-[12px]">{d}</span>
            </div>
          ))}
          <div className="mt-5 px-3.5 py-3.5 bg-[#F8F8F6] rounded-lg text-[13px] text-kx-body flex justify-between items-center">
            <span>Toplam süre</span>
            <span className="font-display text-[22px] font-bold text-kx-ink">~2 hafta</span>
          </div>
        </div>

        {/* New way */}
        <div className="bg-kx-navy text-white rounded-2xl p-7 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-10 w-50 h-50 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(46,117,182,0.25), transparent 70%)' }}
          />
          <div className="flex items-center gap-2.5 mb-5 relative">
            <span className="w-8 h-8 rounded-lg bg-kx-red grid place-items-center text-white text-base font-bold">✓</span>
            <div>
              <div className="text-[11px] text-white/60 font-semibold tracking-[0.08em] uppercase">Kurgemx ile</div>
              <div className="text-[17px] font-bold">Tek akış, tek sekme</div>
            </div>
          </div>
          {NEW_ROWS.map(([t, d]) => (
            <div
              key={t}
              className="flex justify-between py-3 border-t border-white/12 text-[13px] relative"
            >
              <span>{t}</span>
              <span className="text-kx-amber font-mono text-[12px] font-semibold">{d}</span>
            </div>
          ))}
          <div className="mt-5 px-3.5 py-3.5 bg-white/8 rounded-lg text-[13px] flex justify-between items-center relative">
            <span>Toplam süre</span>
            <span className="font-display text-[22px] font-bold text-kx-amber">~12 dakika</span>
          </div>
        </div>
      </div>
    </section>
  )
}
