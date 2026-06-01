'use client'

import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'

export type PlanKart = {
  id: string
  ad: string
  kod: string
  fiyat_usd: number | null
  aylik_proje_limiti: number | null
  kucuk_proje: boolean
  orta_proje: boolean
  buyuk_proje: boolean
  max_buyuk_proje: number | null
  prototip: boolean
  test_senaryosu: boolean
  export: boolean
}

type Props = {
  planlar: PlanKart[]
  mevcutPlanId: string | null
  locale: string
}

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#EEF4FB" />
      <path d="M4 7l2 2 4-4" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Feature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px] text-kx-body">
      <CheckMark />
      <span>{label}</span>
    </li>
  )
}

function planOzellikleri(plan: PlanKart): string[] {
  const f: string[] = []
  if (plan.aylik_proje_limiti)  f.push(`${plan.aylik_proje_limiti} proje/ay`)
  if (plan.kucuk_proje)         f.push('Küçük proje')
  if (plan.orta_proje)          f.push('Orta proje')
  if (plan.buyuk_proje) {
    f.push(plan.max_buyuk_proje ? `Büyük proje (maks. ${plan.max_buyuk_proje})` : 'Büyük proje')
  }
  if (plan.prototip)            f.push('Prototip üretimi')
  if (plan.test_senaryosu)      f.push('Test senaryosu')
  if (plan.export)              f.push('Dışa aktarma')
  return f
}

export default function PlanKartlari({ planlar, mevcutPlanId, locale }: Props) {
  const [secilenPlan, setSecilenPlan] = useState<PlanKart | null>(null)

  return (
    <>
      <section className="py-14 px-6 bg-white">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planlar.map(plan => {
              const isMevcut  = mevcutPlanId === plan.id
              const isFree    = plan.kod === 'freemium'
              const isPopuler = plan.kod === 'analyst'
              const ozellikler = planOzellikleri(plan)

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl p-6 flex flex-col relative"
                  style={{
                    border: isMevcut
                      ? '2px solid #2E75B6'
                      : isPopuler
                      ? '1.5px solid #2E75B6'
                      : '0.5px solid #E8EAEE',
                    boxShadow: isPopuler
                      ? '0 4px 20px -4px rgba(46,117,182,0.18)'
                      : '0 1px 3px rgba(15,23,41,0.04)',
                  }}
                >
                  {/* Badge */}
                  {(isMevcut || isPopuler) && (
                    <div className="absolute -top-3.5 left-5">
                      <span
                        className="text-white text-[10px] font-bold px-3 py-1 rounded-full"
                        style={{ background: isMevcut ? '#2E75B6' : '#1F3864' }}
                      >
                        {isMevcut ? 'Mevcut Planınız' : 'En Popüler'}
                      </span>
                    </div>
                  )}

                  {/* Plan adı & fiyat */}
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-kx-muted mb-1">
                      {plan.ad}
                    </p>
                    {plan.fiyat_usd ? (
                      <div className="flex items-end gap-1">
                        <span className="text-[32px] font-bold text-kx-ink leading-none">
                          ${plan.fiyat_usd}
                        </span>
                        <span className="text-[13px] text-kx-muted mb-0.5">/ay</span>
                      </div>
                    ) : (
                      <span className="text-[32px] font-bold text-kx-ink leading-none">Ücretsiz</span>
                    )}
                  </div>

                  {/* Özellikler */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {ozellikler.map(f => <Feature key={f} label={f} />)}
                  </ul>

                  {/* CTA */}
                  {!isFree && (
                    <button
                      onClick={() => { if (!isMevcut) setSecilenPlan(plan) }}
                      disabled={isMevcut}
                      className="w-full h-[38px] rounded-lg text-[13px] font-semibold transition-opacity disabled:cursor-default"
                      style={{
                        background: isMevcut ? '#E8EAEE' : '#1F3864',
                        color: isMevcut ? '#6B7387' : '#fff',
                        opacity: isMevcut ? 1 : undefined,
                      }}
                    >
                      {isMevcut ? 'Mevcut Planınız' : 'Abone Ol'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {secilenPlan && (
        <PaymentModal
          planId={secilenPlan.id}
          planAd={secilenPlan.ad}
          fiyat={secilenPlan.fiyat_usd!}
          locale={locale}
          onClose={() => setSecilenPlan(null)}
        />
      )}
    </>
  )
}
