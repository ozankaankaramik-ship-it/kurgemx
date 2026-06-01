'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PaymentModal from '@/components/PaymentModal'

/* ── Plan sıra indeksi (buton mantığı için) ──────────────────── */
const PLAN_RANK: Record<string, number> = {
  freemium: 0, analyst: 1, advanced: 2, enterprise: 3,
}

type BtnType = 'none' | 'current' | 'subscribe' | 'quote'

function btnType(planKod: string, mevcutKod: string | null): BtnType {
  if (planKod === 'freemium')   return 'none'
  if (planKod === 'enterprise') return 'quote'
  if (!mevcutKod)               return 'subscribe'
  const rank  = PLAN_RANK[planKod]  ?? 0
  const curr  = PLAN_RANK[mevcutKod] ?? 0
  if (rank === curr) return 'current'
  if (rank > curr)   return 'subscribe'
  return 'none'
}

/* ── Tipleri ─────────────────────────────────────────────────── */
type PlanRef = { id: string; fiyat: number; ad: string; kod: string } | null

type Props = {
  analystPlan:   PlanRef
  advancedPlan:  PlanRef
  mevcutPlanId:  string | null
  mevcutPlanKod: string | null
  locale:        string
  sections: Array<{
    label: string
    rows:  Array<{ label: string; vals: (boolean | string)[] }>
  }>
}

/* ── Plan kartı ──────────────────────────────────────────────── */
type CardProps = {
  featured?:   boolean
  badge?:      React.ReactNode
  name:        string
  price:       React.ReactNode
  period?:     string
  description?: string
  btn:         BtnType
  onSubscribe?: () => void
}

function PlanCard({ featured, badge, name, price, period, description, btn, onSubscribe }: CardProps) {
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        textAlign:     'center',
        background:    'white',
        borderRadius:  12,
        border:        featured ? '2px solid #2E75B6' : '1px solid #E5E7EB',
        boxShadow:     '0 1px 4px rgba(0,0,0,0.08)',
        padding:       '1.25rem 1rem',
        minHeight:     280,
        height:        '100%',
      }}
    >
      {/* Üst içerik — flex-grow ile altta butona yer açar */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* Badge (22px) */}
        <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8 }}>
          {badge ?? null}
        </div>

        {/* Plan adı */}
        <p style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7387', marginBottom: 8 }}>
          {name}
        </p>

        {/* Fiyat */}
        <div style={{ marginBottom: 4 }}>{price}</div>

        {/* / month */}
        <p style={{ fontSize: 15, color: '#6B7387', marginBottom: 8 }}>
          {period ?? <span style={{ visibility: 'hidden' }}>—</span>}
        </p>

        {/* Açıklama */}
        <p style={{ fontSize: 13, color: '#6B7387', minHeight: 16 }}>
          {description ?? ''}
        </p>
      </div>

      {/* Buton — her zaman en altta */}
      <div style={{ width: '100%', marginTop: 'auto', paddingTop: 16 }}>
        {btn === 'subscribe' && (
          <button
            onClick={onSubscribe}
            className="w-full rounded-lg text-white transition-opacity hover:opacity-85"
            style={{ height: 38, fontSize: 14, fontWeight: 500, background: '#1F3864' }}
          >
            Subscribe
          </button>
        )}
        {btn === 'current' && (
          <button
            disabled
            className="w-full rounded-lg"
            style={{ height: 38, fontSize: 14, fontWeight: 500, background: '#F3F4F6', color: '#9CA3AF', cursor: 'default' }}
          >
            Current plan
          </button>
        )}
        {btn === 'quote' && (
          <a
            href="mailto:support@kurgemx.com"
            className="w-full rounded-lg flex items-center justify-center no-underline transition-colors hover:bg-kx-bg"
            style={{ height: 38, fontSize: 14, fontWeight: 500, color: '#9CA3AF', border: '1px solid #E5E7EB' }}
          >
            Get a quote
          </a>
        )}
        {btn === 'none' && (
          <div style={{ height: 38 }} aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

/* ── Karşılaştırma tablosu hücreleri ─────────────────────────── */
function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-label="Yes">
      <circle cx="7.5" cy="7.5" r="7.5" fill="#DCFCE7" />
      <path d="M4.5 7.5l2 2 4-4" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Dash() {
  return <span style={{ color: '#D1D5DB', fontWeight: 600 }} aria-label="No">—</span>
}
function Cell({ val }: { val: boolean | string }) {
  if (val === true)  return <span className="flex justify-center"><Check /></span>
  if (val === false) return <Dash />
  return <span style={{ fontWeight: 500 }}>{val}</span>
}

/* ── Ana bileşen ─────────────────────────────────────────────── */
export default function PricingTable({
  analystPlan,
  advancedPlan,
  mevcutPlanId,
  mevcutPlanKod,
  locale,
  sections,
}: Props) {
  const t = useTranslations('pricing')
  const [modalPlan, setModalPlan] = useState<PlanRef>(null)

  const analystBtn  = btnType('analyst',  mevcutPlanKod)
  const advancedBtn = btnType('advanced', mevcutPlanKod)

  return (
    <>
      <div style={{ width: '830px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ── Plan kartları ──
             Sütun genişlikleri tablo colgroup ile tam eşleşiyor: 22% + 4×19.5%
             gap yerine wrapper padding kullanılıyor ki sütun başlangıç noktaları
             kaymadan tablo başlıklarıyla hizalanabilsin.                        */}
        <div className="mb-8" style={{ display: 'grid', gridTemplateColumns: '210px 155px 155px 155px 155px', gap: 0 }}>

          {/* Features sütunu placeholder */}
          <div />

          {/* Freemium */}
          <div style={{ paddingRight: 6 }}>
            <PlanCard
              name={t('planlar.freemium.ad')}
              price={<span style={{ fontSize: 36, fontWeight: 500, color: '#0E1A33' }}>$0</span>}
              period={t('planlar.freemium.aylik')}
              description={t('freemiumNot')}
              btn="none"
            />
          </div>

          {/* Analyst */}
          <div style={{ padding: '0 6px' }}>
            <PlanCard
              featured
              badge={
                <span
                  className="text-kx-navy"
                  style={{ background: '#EEF4FB', borderRadius: 20, fontSize: 11, fontWeight: 500, padding: '2px 10px' }}
                >
                  {t('enPopuler')}
                </span>
              }
              name={t('planlar.analyst.ad')}
              price={<span style={{ fontSize: 36, fontWeight: 500, color: '#0E1A33' }}>$9</span>}
              period={t('planlar.analyst.aylik')}
              btn={analystBtn}
              onSubscribe={analystPlan ? () => setModalPlan(analystPlan) : undefined}
            />
          </div>

          {/* Advanced */}
          <div style={{ padding: '0 6px' }}>
            <PlanCard
              name={t('planlar.advanced.ad')}
              price={<span style={{ fontSize: 36, fontWeight: 500, color: '#0E1A33' }}>$29</span>}
              period={t('planlar.advanced.aylik')}
              btn={advancedBtn}
              onSubscribe={advancedPlan ? () => setModalPlan(advancedPlan) : undefined}
            />
          </div>

          {/* Enterprise */}
          <div style={{ paddingLeft: 6 }}>
            <PlanCard
              name={t('planlar.enterprise.ad')}
              price={<span style={{ fontSize: 20, fontWeight: 500, color: '#9CA3AF' }}>Custom</span>}
              btn="quote"
            />
          </div>
        </div>

        {/* ── Karşılaştırma tablosu ── */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', background: '#F8F9FA' }}>
          <table style={{ tableLayout: 'fixed', width: '830px', margin: '0 auto', fontSize: 14, borderCollapse: 'collapse' }}>
            <colgroup>
              <col style={{ width: '210px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '155px' }} />
            </colgroup>

            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1F3864', color: 'white' }}>
                  Features
                </th>
                {(['planlar.freemium.ad', 'planlar.analyst.ad', 'planlar.advanced.ad', 'planlar.enterprise.ad'] as const).map(key => (
                  <th key={key} style={{ padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1F3864', color: 'white' }}>
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sections.flatMap((section, si) => {
                const isLast = si === sections.length - 1
                return [
                  /* Bölüm başlığı */
                  <tr key={`sec-${si}`}>
                    <td
                      colSpan={5}
                      style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', background: '#EEF4FB', color: '#1F3864' }}
                    >
                      {section.label}
                    </td>
                  </tr>,

                  /* Özellik satırları */
                  ...section.rows.map((row, ri) => {
                    const isLastRow = isLast && ri === section.rows.length - 1
                    return (
                      <tr
                        key={`row-${si}-${ri}`}
                        className="hover:bg-[#EEF4FB] transition-colors"
                        style={{ borderBottom: isLastRow ? 'none' : '1px solid #E5E7EB' }}
                      >
                        <td style={{ padding: '9px 12px', color: '#111827', fontWeight: 500, textAlign: 'left' }}>
                          {row.label}
                        </td>
                        {row.vals.map((val, ci) => (
                          <td key={ci} style={{ padding: '9px 12px', textAlign: 'center' }}>
                            <Cell val={val} />
                          </td>
                        ))}
                      </tr>
                    )
                  }),
                ]
              })}
            </tbody>
          </table>
        </div>

        <p className="text-center text-kx-muted mt-4" style={{ fontSize: 12 }}>
          {t('footerNot')}
        </p>
      </div>

      {modalPlan && (
        <PaymentModal
          planId={modalPlan.id}
          planAd={modalPlan.ad}
          fiyat={modalPlan.fiyat}
          locale={locale}
          onClose={() => setModalPlan(null)}
        />
      )}
    </>
  )
}
