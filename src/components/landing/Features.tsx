import type { ReactNode } from 'react'
import { getLocale } from 'next-intl/server'
import KxPill from '@/components/ui/KxPill'
import HeroProductPreview from './HeroProductPreview'

/* ──────────────────────────────────────────────────────────────────
   Three sample document visuals — used as feature illustrations
   ────────────────────────────────────────────────────────────────── */

function VisualDoc() {
  return (
    <div className="bg-white border border-kx-border rounded-xl p-6 shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-mono text-[11px] text-kx-muted">analiz-r1-mvp.docx</div>
        <KxPill tone="green" dot>Hazır</KxPill>
      </div>
      <div className="font-display text-[20px] font-bold text-kx-ink mb-2 tracking-tight">
        R1 — MVP İş Analizi
      </div>
      <div className="text-[11px] text-kx-muted mb-4">
        1. Genel Bilgiler · 2. Kapsam · 3. Kullanıcı Hikayeleri · 4. İş Kuralları · 5. Etki Analizi
      </div>
      {[
        {
          h: '3.1 Kullanıcı Hikayesi — ST-014',
          t: 'Bir kullanıcı olarak, IBAN ile para göndermek istiyorum ki günlük bankacılık ihtiyacımı uygulamadan halledebileyim.',
        },
        {
          h: 'Kabul Kriterleri',
          t: 'AC-1: Geçersiz IBAN girildiğinde uyarı gösterilir.\nAC-2: 5.000 TL üzeri transferlerde SMS doğrulama istenir.\nAC-3: İşlem geçmişi anında güncellenir.',
        },
        { h: 'İş Kuralları', t: 'BR-1: Tek seferlik limit 50.000 TL.\nBR-2: Günlük limit 100.000 TL.' },
      ].map((b) => (
        <div key={b.h} className="mb-3 px-3.5 py-3 bg-kx-bg border-l-[3px] border-kx-blue rounded-r-md">
          <div className="text-[11px] font-bold text-kx-navy mb-1">{b.h}</div>
          <div className="text-[12px] text-kx-body leading-[1.6] whitespace-pre-line">{b.t}</div>
        </div>
      ))}
      <div className="mt-3.5 flex gap-2">
        <a href="#" className="bg-kx-navy text-white text-[12px] px-3.5 py-2 rounded-md no-underline">
          İndir (.docx) ↓
        </a>
        <a href="#" className="bg-white text-kx-ink text-[12px] px-3.5 py-2 rounded-md no-underline border border-kx-border">
          Önizle
        </a>
      </div>
    </div>
  )
}

function VisualPrototype() {
  return (
    <div className="bg-white border border-kx-border rounded-xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="bg-kx-navy px-3.5 py-2.5 text-white flex justify-between text-[11px]">
        <span className="font-mono">prototip / login</span>
        <span className="text-white/60">3 / 14 ekran</span>
      </div>
      <div className="p-4 bg-kx-bg grid grid-cols-[160px_1fr] gap-4 min-h-70">
        {/* Sidebar */}
        <div className="bg-white border border-kx-border-soft rounded-lg p-2.5">
          {['Login', 'Dashboard', 'Transfer', 'Yatırım', 'Profil'].map((s, i) => (
            <div
              key={s}
              className={`px-2 py-1.5 text-[11px] rounded mb-0.5 ${
                i === 0 ? 'bg-kx-blue-soft text-kx-navy font-semibold' : 'text-kx-muted'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        {/* Phone */}
        <div className="bg-white rounded-2xl border border-kx-border-soft p-4 flex flex-col gap-2.5 relative">
          <div className="w-15 h-1.5 bg-[#E8EAEE] rounded-sm mx-auto" />
          <div className="text-[16px] font-bold text-kx-ink mt-3">Hoş geldin</div>
          <div className="text-[11px] text-kx-muted mb-2">Hesabına giriş yap</div>
          <div className="bg-kx-bg h-8 rounded-md text-[11px] text-kx-muted px-2.5 py-2">
            ornek@email.com
          </div>
          <div className="bg-kx-bg h-8 rounded-md text-[11px] text-kx-muted px-2.5 py-2">
            ••••••••
          </div>
          <div className="bg-kx-navy h-8.5 rounded-md text-white text-[12px] font-semibold grid place-items-center">
            Giriş Yap
          </div>
          <div className="absolute top-3 right-3 bg-kx-amber text-kx-ink text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            Düzenle
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualTest() {
  const rows: Array<[string, string, string, number, string]> = [
    ['TC-001', 'Başarılı IBAN transferi', 'Pozitif', 5, 'Geçti'],
    ['TC-002', 'Geçersiz IBAN uyarısı', 'Negatif', 3, 'Geçti'],
    ['TC-003', '5K üstü SMS doğrulama', 'Sınır', 6, 'Bekliyor'],
    ['TC-004', 'Günlük limit aşımı', 'Negatif', 4, 'Geçti'],
    ['TC-005', 'Eş zamanlı 2 transfer', 'Eş zamanlı', 7, 'Bekliyor'],
  ]
  return (
    <div className="bg-white border border-kx-border rounded-xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="bg-[#107C41] text-white px-3.5 py-2 font-mono text-[11px] flex justify-between">
        <span>test-senaryolari.xlsx</span>
        <span>32 satır</span>
      </div>
      <div className="grid grid-cols-[70px_1fr_90px_60px_90px] bg-[#F4F4F2] text-[10px] font-bold text-kx-muted uppercase tracking-wider">
        {['ID', 'Senaryo', 'Tip', 'Adım', 'Durum'].map((h) => (
          <div key={h} className="px-2.5 py-2 border-r border-kx-border-soft">
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={r[0]}
          className={`grid grid-cols-[70px_1fr_90px_60px_90px] text-[12px] border-t border-kx-border-soft ${
            i % 2 ? 'bg-white' : 'bg-[#FBFBFA]'
          }`}
        >
          {r.map((c, j) => {
            const color =
              j === 0
                ? 'text-kx-blue font-semibold font-mono'
                : j === 4
                ? c === 'Geçti'
                  ? 'text-kx-green font-semibold'
                  : 'text-[#D97706] font-semibold'
                : 'text-kx-body'
            return (
              <div key={j} className={`px-2.5 py-2.5 border-r border-kx-border-soft ${color}`}>
                {c}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Feature block — two columns, alternating left/right
   ────────────────────────────────────────────────────────────────── */

function FeatureBlock({
  idx,
  tag,
  tone,
  title,
  desc,
  visual,
  reverse,
}: {
  idx: number
  tag: string
  tone: 'blue' | 'red' | 'amber'
  title: string
  desc: string
  visual: ReactNode
  reverse?: boolean
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-16 items-center py-16 ${
        idx > 0 ? 'border-t border-kx-border-soft' : ''
      }`}
    >
      <div className={reverse ? 'md:order-2' : 'md:order-1'}>
        <KxPill tone={tone} dot>{tag}</KxPill>
        <h3 className="font-display text-[36px] leading-[1.1] tracking-[-0.025em] font-bold text-kx-ink mt-3.5 mb-4">
          {title}
        </h3>
        <p className="text-[16px] leading-[1.6] text-kx-body max-w-[480px]">{desc}</p>
      </div>
      <div className={reverse ? 'md:order-1' : 'md:order-2'}>{visual}</div>
    </div>
  )
}

export default async function Features() {
  const locale = await getLocale()
  const isTR = locale === 'tr'

  return (
    <section id="ozellikler" className="bg-white py-22 px-8">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center max-w-[720px] mx-auto mb-6">
          <KxPill tone="blue">— Ne yapıyor</KxPill>
          <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3.5 leading-[1.1]">
            Beş tıklamada, beş çıktı.
          </h2>
          <p className="text-[17px] text-kx-body leading-[1.5]">
            Her adımda çıktıyı düzenle, kabul et, sonraki adıma geç. Her aşama bir sonrakini besler — kopuk araç yok.
          </p>
        </div>

        <FeatureBlock
          idx={0}
          tag="1 · Hikaye Haritası"
          tone="blue"
          title="Destanlardan kabul kriterlerine, eksiksiz harita."
          desc="Projeni anlat, AI senin için destanları, kullanıcı hikayelerini, R1/R2/R3 sürüm planını ve sprint dağılımını üretsin. Sen yorumla, kart sürükle, hikayeleri taşı."
          visual={<HeroProductPreview />}
        />
        <FeatureBlock
          idx={1}
          tag="2 · İş Analizi Dokümanı"
          tone="blue"
          reverse
          title="Müşteriye gönderilebilir Word dokümanı."
          desc={isTR
            ? 'R1\'den R3\'e her sürüm için — kabul kriterleri, iş kuralları ve etki analiziyle eksiksiz, müşteriye gönderilebilir .docx. Dakikalar içinde.'
            : 'From R1 to R3 — complete, client-ready .docx with acceptance criteria, business rules and impact analysis. In minutes.'}
          visual={<VisualDoc />}
        />
        <FeatureBlock
          idx={2}
          tag="3 · Tıklanabilir Prototip"
          tone="red"
          title="Paydaşa sunum öncesi, çalışan bir taslak."
          desc="Hikayelerden gerçek arayüz akışı: ekran ekran navigasyon, gerçekçi mockup'lar. Tek HTML olarak indir, mail gönder, açan görsün."
          visual={<VisualPrototype />}
        />
        <FeatureBlock
          idx={3}
          tag="4 · Test Senaryoları"
          tone="amber"
          reverse
          title="QA ekibine teslim edilebilir Excel."
          desc="Her hikaye için pozitif, negatif ve sınır senaryoları; adım adım test akışları ve beklenen sonuçlar. Doğrudan QA tool'una import et."
          visual={<VisualTest />}
        />
      </div>
    </section>
  )
}
