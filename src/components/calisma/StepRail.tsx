'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

/**
 * Sticky left rail showing the 5 workflow steps with status indicators.
 *
 * Step status is derived from the document presence flags passed in.
 * The rail is sticky on desktop, hidden on mobile (the main content area
 * still functions; users just lose the at-a-glance overview).
 *
 * IMPORTANT: this is presentation only — it does NOT control the workflow.
 * Clicking a step scrolls to that section via id (#adim1..#adim5).
 */

type StepStatus = 'done' | 'active' | 'running' | 'pending'

export type StepState = {
  /** 1..5 */
  no: number
  /** Display label */
  label: string
  /** Current status */
  status: StepStatus
  /** Mono-font subtitle: "14 san", "2 dk 18 san", "~6 dk", "Beklemede" */
  time?: string
  /** 0..1 for running state */
  progress?: number
}

const STATUS_BG: Record<StepStatus, string> = {
  done:    'bg-kx-green',
  active:  'bg-kx-navy',
  running: 'bg-kx-amber',
  pending: 'bg-white border border-dashed border-kx-border',
}
const STATUS_FG: Record<StepStatus, string> = {
  done:    'text-white',
  active:  'text-white',
  running: 'text-white',
  pending: 'text-kx-faint',
}

/* ──────────────────────────────────────────────────────────────────
   Inline scroll helper — avoid scrollIntoView (project guideline)
   ────────────────────────────────────────────────────────────────── */

function smoothScrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: 'smooth' })
}

export default function StepRail({
  steps,
  activeId,
  extrasYakinda = [],
  tokenLine,
  sureLine,
  planLine,
}: {
  steps: StepState[]
  /** Which step (by no) is "active" for the page focus */
  activeId?: number
  extrasYakinda?: string[]
  /** Optional footer lines under "Bu projede" */
  tokenLine?: string
  sureLine?: string
  planLine?: string
}) {
  const locale = useLocale()
  const isTR = locale === 'tr'

  return (
    <aside className="hidden lg:block sticky top-22 self-start w-[240px]">
      <div className="bg-white border border-kx-border rounded-2xl p-4.5">
        <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-3.5">
          {isTR ? 'Süreç' : 'Process'}
        </div>
        <div className="flex flex-col gap-0.5">
          {steps.map((s, i) => {
            const isActive = s.no === activeId
            const lineColor = s.status === 'done' ? 'bg-kx-green' : 'bg-kx-border-soft'
            return (
              <div key={s.no} className="relative">
                {i < steps.length - 1 && (
                  <span className={`absolute left-[13px] top-7 -bottom-1.5 w-0.5 ${lineColor}`} />
                )}
                <button
                  onClick={() => smoothScrollTo(`adim${s.no}`)}
                  className={`w-full flex items-start gap-3 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-kx-blue-soft' : 'bg-transparent hover:bg-kx-bg'
                  }`}
                >
                  <span
                    className={`w-[26px] h-[26px] rounded-full shrink-0 grid place-items-center text-[11px] font-bold ${STATUS_BG[s.status]} ${STATUS_FG[s.status]}`}
                  >
                    {s.status === 'done' ? '✓' : s.no}
                  </span>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <div className={`text-[13px] leading-[1.3] ${isActive ? 'font-semibold text-kx-navy' : 'font-medium text-kx-ink'}`}>
                      {s.label}
                    </div>
                    {s.time && (
                      <div className="text-[11px] text-kx-muted mt-0.5 font-mono">{s.time}</div>
                    )}
                    {s.status === 'running' && typeof s.progress === 'number' && (
                      <div className="mt-1.5 h-[3px] bg-kx-amber/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-kx-amber rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(s.progress * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {extrasYakinda.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-kx-border-soft">
            <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-2.5">
              {isTR ? 'Tamamlayıcı' : 'Optional'}
            </div>
            {extrasYakinda.map((x) => (
              <div
                key={x}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-kx-faint"
              >
                <span className="w-3.5 h-3.5 rounded-[3px] bg-kx-bg border border-dashed border-kx-border" />
                <span className="flex-1 truncate">{x}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-kx-amber-soft text-kx-amber-ink rounded font-bold">
                  YAKINDA
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token usage card */}
      {(tokenLine || sureLine || planLine) && (
        <div className="mt-4 bg-white border border-kx-border rounded-2xl p-4">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase">
              {isTR ? 'Bu projede' : 'This project'}
            </span>
          </div>
          {tokenLine && (
            <Line label={isTR ? 'Tahmini token' : 'Est. tokens'} value={tokenLine} />
          )}
          {sureLine && (
            <Line label={isTR ? 'Toplam süre' : 'Total time'} value={sureLine} />
          )}
          {planLine && (
            <Line label="Plan kullanımı" value={planLine} tone="green" />
          )}
        </div>
      )}
    </aside>
  )
}

function Line({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' }) {
  return (
    <div className="flex justify-between text-[12px] mb-1.5 last:mb-0">
      <span className="text-kx-body">{label}</span>
      <span className={`font-semibold font-mono ${tone === 'green' ? 'text-kx-green' : 'text-kx-ink'}`}>
        {value}
      </span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   StepCard — wraps individual step content
   Used by CalismaEkrani internals when refactored. Exported so the
   existing CalismaEkrani.tsx can opt-in incrementally.
   ────────────────────────────────────────────────────────────────── */

export function StepCard({
  id,
  no,
  title,
  subtitle,
  status,
  time,
  action,
  children,
}: {
  id: string
  no: number | string
  title: string
  subtitle?: string
  status: StepStatus
  time?: string
  action?: ReactNode
  children: ReactNode
}) {
  const locale = useLocale()
  const isTR = locale === 'tr'

  const numBg = {
    done:    'bg-kx-green',
    active:  'bg-kx-navy',
    running: 'bg-kx-amber',
    pending: 'bg-[#F1F2F4]',
  }[status]
  const numFg = status === 'pending' ? 'text-kx-faint' : 'text-white'

  const pillBg = {
    done:    'bg-kx-green-soft',
    active:  'bg-kx-blue-soft',
    running: 'bg-kx-amber-soft',
    pending: 'bg-[#F1F2F4]',
  }[status]
  const pillFg = {
    done:    'text-kx-green-ink',
    active:  'text-kx-navy',
    running: 'text-kx-amber-ink',
    pending: 'text-kx-muted',
  }[status]
  const pillLabel = isTR
    ? { done: 'Hazır', active: 'Aktif', running: 'Üretiliyor', pending: 'Beklemede' }[status]
    : { done: 'Done',  active: 'Active', running: 'Generating', pending: 'Pending' }[status]

  const ring =
    status === 'running'
      ? 'shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_4px_12px_rgba(245,158,11,0.08)]'
      : ''

  return (
    <section
      id={id}
      className={`bg-white border border-kx-border rounded-2xl overflow-x-hidden scroll-mt-24 ${ring}`}
    >
      <header className={`px-6 py-4.5 border-b border-kx-border-soft ${status === 'pending' ? 'bg-kx-bg' : 'bg-white'}`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-lg shrink-0 grid place-items-center font-mono font-bold text-[13px] ${numBg} ${numFg}`}>
            {no}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`font-display text-[20px] font-bold tracking-tight m-0 ${status === 'pending' ? 'text-kx-muted' : 'text-kx-ink'}`}>
                {title}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase ${pillBg} ${pillFg}`}>
                {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-kx-amber animate-kx-pulse" />}
                {status === 'done' && <span>✓</span>}
                {pillLabel}
              </span>
            </div>
            {subtitle && <p className="text-[12.5px] text-kx-muted mt-1 m-0">{subtitle}</p>}
          </div>
          {time && <div className="text-[11px] text-kx-muted font-mono">{time}</div>}
          {action && <div>{action}</div>}
        </div>
      </header>
      <div className="px-6 pt-5 pb-6">{children}</div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Background-update banner — shows when AI is producing in background
   ────────────────────────────────────────────────────────────────── */

export function BackgroundBanner({ message }: { message: string }) {
  return (
    <div className="bg-kx-blue-soft border border-[#C5DBED] rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-kx-blue animate-kx-pulse" />
      <span className="text-[13px] text-[#0C447C]">{message}</span>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   useReadingTime — small util used by the rail to keep "süre" lines
   live when generation completes. Returns a stable formatter.
   ────────────────────────────────────────────────────────────────── */

export function useNowTick(intervalMs = 1000) {
  const [, set] = useState(0)
  useEffect(() => {
    const id = setInterval(() => set((x) => x + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}

export function formatSure(saniye: number, dil: string = 'TR'): string {
  if (saniye < 60) return dil === 'TR' ? `${saniye} san` : `${saniye} sec`
  const dak = Math.floor(saniye / 60)
  const san = saniye % 60
  return dil === 'TR' ? `${dak} dk ${san} san` : `${dak} min ${san} sec`
}
