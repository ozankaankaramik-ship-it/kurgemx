'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PaymentModal from '@/components/PaymentModal'

/* ── Tablo hücre bileşenleri ─────────────────────────────────── */
function CheckIcon() {
  return (
    <span className="inline-grid place-items-center w-[18px] h-[18px] rounded-full bg-kx-green-soft">
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 8.5l2.5 2.5L12 5.5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
function DashCell() {
  return <span className="text-[#D1D5DB] font-semibold" aria-hidden="true">—</span>
}
function Cell({ val }: { val: boolean | string }) {
  if (val === true)  return <CheckIcon />
  if (val === false) return <DashCell />
  return <span className="font-bold text-kx-navy">{val}</span>
}

/* ── Tipler ──────────────────────────────────────────────────── */
type PlanRef = { id: string; fiyat: number; ad: string } | null

type Props = {
  analystPlan:   PlanRef
  advancedPlan:  PlanRef
  mevcutPlanId:  string | null
  locale:        string
  sections: Array<{
    label: string
    rows:  Array<{ label: string; vals: (boolean | string)[] }>
  }>
}

/* ── Header sütun yapısı (6 sabit yükseklikli satır) ─────────── */
type HeaderColProps = {
  badge?:       React.ReactNode   // Satır 1 — 24px
  name:         React.ReactNode   // Satır 2 — 20px
  price:        React.ReactNode   // Satır 3 — 60px
  period?:      React.ReactNode   // Satır 4 — 20px
  description?: React.ReactNode   // Satır 5 — 20px
  action?:      React.ReactNode   // Satır 6 — 44px
}

function HeaderCol({ badge, name, price, period, description, action }: HeaderColProps) {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Satır 1: badge (24px) */}
      <div className="h-6 flex items-center justify-center w-full">
        {badge ?? null}
      </div>
      {/* Satır 2: plan adı (20px) */}
      <div className="h-5 flex items-center justify-center w-full">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4]">
          {name}
        </span>
      </div>
      {/* Satır 3: fiyat (60px) */}
      <div className="h-[60px] flex items-center justify-center w-full">
        {price}
      </div>
      {/* Satır 4: periyot (20px) */}
      <div className="h-5 flex items-center justify-center w-full">
        {period ? (
          <span className="text-[11px] text-[#B5D4F4]">{period}</span>
        ) : null}
      </div>
      {/* Satır 5: açıklama (20px) */}
      <div className="h-5 flex items-center justify-center w-full">
        {description ? (
          <span className="text-[10px] text-[#B5D4F4]/70 italic leading-tight text-center px-1">
            {description}
          </span>
        ) : null}
      </div>
      {/* Satır 6: buton (44px) */}
      <div className="h-11 flex items-center justify-center w-full">
        {action ?? null}
      </div>
    </div>
  )
}

/* ── Ana bileşen ─────────────────────────────────────────────── */
export default function PricingTable({
  analystPlan,
  advancedPlan,
  mevcutPlanId,
  locale,
  sections,
}: Props) {
  const t = useTranslations('pricing')
  const [modalPlan, setModalPlan] = useState<PlanRef>(null)

  const ANALYST = 1

  const isAnalystMevcut  = !!analystPlan  && mevcutPlanId === analystPlan.id
  const isAdvancedMevcut = !!advancedPlan && mevcutPlanId === advancedPlan.id

  const priceEl = (text: string) => (
    <span className="text-xl font-bold text-white leading-none">{text}</span>
  )

  const subscribeBtn = (plan: NonNullable<PlanRef>, isMevcut: boolean) => {
    if (isMevcut) {
      return (
        <span className="rounded-md text-[10px] font-semibold px-3 py-1.5 bg-white/20 text-white/60 cursor-default">
          {t('mevcutPlan')}
        </span>
      )
    }
    return (
      <button
        onClick={() => setModalPlan(plan)}
        className="rounded-md bg-white text-kx-navy text-[11px] font-semibold px-3 py-1.5 hover:bg-kx-blue-soft transition-colors cursor-pointer"
      >
        {t('aboneOl')}
      </button>
    )
  }

  return (
    <>
      <div className="max-w-[900px] mx-auto px-6 py-10">
          <div className="overflow-x-auto rounded-xl border border-kx-border shadow-kx-card bg-white">
            <table className="mx-auto" style={{ fontSize: 12, borderCollapse: 'collapse', width: 'auto' }}>
              <colgroup>
                <col style={{ minWidth: 160 }} />
                <col style={{ minWidth: 110 }} />
                <col style={{ minWidth: 110 }} />
                <col style={{ minWidth: 110 }} />
                <col style={{ minWidth: 110 }} />
              </colgroup>

              <thead>
                <tr className="bg-kx-navy">
                  {/* Sol boş hücre */}
                  <th className="px-4" />

                  {/* Freemium */}
                  <th className="px-3 text-center">
                    <HeaderCol
                      name={t('planlar.freemium.ad')}
                      price={priceEl(t('planlar.freemium.fiyat'))}
                      period={t('planlar.freemium.aylik')}
                      description={t('freemiumNot')}
                    />
                  </th>

                  {/* Analyst — vurgulu */}
                  <th className="px-3 text-center border-l-2 border-r-2 border-t-2 border-kx-blue">
                    <HeaderCol
                      badge={
                        <span className="bg-kx-blue text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-wider">
                          {t('enPopuler')}
                        </span>
                      }
                      name={t('planlar.analyst.ad')}
                      price={priceEl(t('planlar.analyst.fiyat'))}
                      period={t('planlar.analyst.aylik')}
                      action={analystPlan ? subscribeBtn(analystPlan, isAnalystMevcut) : undefined}
                    />
                  </th>

                  {/* Advanced */}
                  <th className="px-3 text-center">
                    <HeaderCol
                      name={t('planlar.advanced.ad')}
                      price={priceEl(t('planlar.advanced.fiyat'))}
                      period={t('planlar.advanced.aylik')}
                      action={advancedPlan ? subscribeBtn(advancedPlan, isAdvancedMevcut) : undefined}
                    />
                  </th>

                  {/* Enterprise */}
                  <th className="px-3 text-center">
                    <HeaderCol
                      name={t('planlar.enterprise.ad')}
                      price={<span className="text-xl font-bold text-white/30 leading-none">—</span>}
                      action={
                        <a
                          href="mailto:support@kurgemx.com"
                          className="rounded-md bg-white text-kx-navy text-[11px] font-semibold px-3 py-1.5 hover:bg-kx-blue-soft transition-colors no-underline"
                        >
                          {t('teklifAl')}
                        </a>
                      }
                    />
                  </th>
                </tr>
              </thead>

              {/* ── Özellik satırları ── */}
              <tbody>
                {sections.flatMap((section, si) => {
                  const isLastSection = si === sections.length - 1
                  return [
                    <tr key={`sec-${si}`} className="bg-kx-blue-soft">
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-kx-navy"
                      >
                        {section.label}
                      </td>
                    </tr>,
                    ...section.rows.map((row, ri) => {
                      const isLastRow = isLastSection && ri === section.rows.length - 1
                      return (
                        <tr
                          key={`row-${si}-${ri}`}
                          className={ri % 2 === 0 ? 'bg-white' : 'bg-kx-bg'}
                        >
                          <td className="px-4 py-2 text-kx-body">{row.label}</td>
                          {row.vals.map((val, ci) => (
                            <td
                              key={ci}
                              className={`px-3 py-2 text-center ${
                                ci === ANALYST
                                  ? `border-l-2 border-r-2 border-kx-blue ${isLastRow ? 'border-b-2' : ''}`
                                  : ''
                              }`}
                            >
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

          <p className="text-center mt-4 text-[12px] text-kx-muted">
            <strong className="text-kx-ink">USD</strong> · KDV dahil · Ödeme anındaki kur esas alınır · Aylık fatura, dilediğin zaman iptal
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
