'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PaymentModal from '@/components/PaymentModal'

/* ── Tablo hücre bileşenleri ─────────────────────────────────── */
function CheckIcon() {
  return (
    <span className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-kx-green-soft">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
  return <span className="text-[13px] font-bold text-kx-navy">{val}</span>
}

/* ── "Abone Ol" buton ────────────────────────────────────────── */
function AboneOlBtn({
  label,
  isMevcut,
  onClick,
}: {
  label: string
  isMevcut: boolean
  onClick: () => void
}) {
  if (isMevcut) {
    return (
      <span className="inline-block mt-3 rounded-md text-[10px] font-semibold px-3 py-1.5 bg-white/20 text-white/60 cursor-default">
        {label}
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      className="inline-block mt-3 rounded-md bg-white text-kx-navy text-xs font-semibold px-3 py-1.5 hover:bg-kx-blue-soft transition-colors cursor-pointer"
    >
      {label}
    </button>
  )
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

  return (
    <>
      <section className="py-14 px-8 bg-kx-bg">
        <div className="max-w-[1080px] mx-auto">
          <div className="overflow-x-auto rounded-2xl border border-kx-border shadow-kx-card bg-white">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <colgroup>
                <col style={{ width: '38%' }} />
                <col style={{ width: '15.5%' }} />
                <col style={{ width: '15.5%' }} />
                <col style={{ width: '15.5%' }} />
                <col style={{ width: '15.5%' }} />
              </colgroup>

              {/* ── Plan başlıkları ── */}
              <thead>
                <tr className="bg-kx-navy">
                  <th className="px-6 py-6" />

                  {/* Freemium */}
                  <th className="px-3 py-6 text-center align-top">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                      {t('planlar.freemium.ad')}
                    </p>
                    <p className="text-2xl font-bold text-white leading-none">
                      {t('planlar.freemium.fiyat')}
                    </p>
                    <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.freemium.aylik')}</p>
                    <p className="text-[10px] text-[#B5D4F4]/70 italic mt-2 leading-tight">
                      {t('freemiumNot')}
                    </p>
                  </th>

                  {/* Analyst — vurgulu */}
                  <th className="px-3 pt-4 pb-6 text-center align-top border-l-2 border-r-2 border-t-2 border-kx-blue">
                    <div className="flex justify-center mb-3">
                      <span className="bg-kx-blue text-white text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap tracking-wider">
                        {t('enPopuler')}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                      {t('planlar.analyst.ad')}
                    </p>
                    <p className="text-2xl font-bold text-white leading-none">
                      {t('planlar.analyst.fiyat')}
                    </p>
                    <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.analyst.aylik')}</p>
                    {analystPlan && (
                      <AboneOlBtn
                        label={isAnalystMevcut ? t('mevcutPlan') : t('aboneOl')}
                        isMevcut={isAnalystMevcut}
                        onClick={() => setModalPlan(analystPlan)}
                      />
                    )}
                  </th>

                  {/* Advanced */}
                  <th className="px-3 py-6 text-center align-top">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                      {t('planlar.advanced.ad')}
                    </p>
                    <p className="text-2xl font-bold text-white leading-none">
                      {t('planlar.advanced.fiyat')}
                    </p>
                    <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.advanced.aylik')}</p>
                    {advancedPlan && (
                      <AboneOlBtn
                        label={isAdvancedMevcut ? t('mevcutPlan') : t('aboneOl')}
                        isMevcut={isAdvancedMevcut}
                        onClick={() => setModalPlan(advancedPlan)}
                      />
                    )}
                  </th>

                  {/* Enterprise */}
                  <th className="px-3 py-6 text-center align-top">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B5D4F4] mb-1">
                      {t('planlar.enterprise.ad')}
                    </p>
                    <a
                      href="mailto:support@kurgemx.com"
                      className="inline-block mt-3 rounded-md bg-white text-kx-navy text-xs font-semibold px-3 py-1.5 hover:bg-kx-blue-soft transition-colors no-underline"
                    >
                      {t('teklifAl')}
                    </a>
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
                        className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-kx-navy"
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
                          <td className="px-6 py-3.5 text-sm text-kx-body">{row.label}</td>
                          {row.vals.map((val, ci) => (
                            <td
                              key={ci}
                              className={`px-4 py-3.5 text-center ${
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

          <p className="text-center mt-6 text-[13px] text-kx-muted">
            <strong className="text-kx-ink">USD</strong> · KDV dahil · Ödeme anındaki kur esas alınır · Aylık fatura, dilediğin zaman iptal
          </p>
        </div>
      </section>

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
