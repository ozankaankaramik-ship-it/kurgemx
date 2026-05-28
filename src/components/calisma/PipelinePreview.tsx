import type { ReactNode } from 'react'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import KxPill from '@/components/ui/KxPill'

type Step = { n: number; t: string; d: string }

const STEPS: Step[] = [
  { n: 1, t: 'Proje bilgisi',    d: '~1 dk' },
  { n: 2, t: 'Hikaye haritası',  d: '~3 dk' },
  { n: 3, t: 'İş analizi',       d: '~5 dk' },
  { n: 4, t: 'Prototip',         d: '~6 dk' },
  { n: 5, t: 'Test senaryosu',   d: '~3 dk' },
]

export default async function PipelinePreview({ activeStep = 1 }: { activeStep?: number }) {
  const locale = await getLocale()
  const estimatedText = locale === 'tr'
    ? 'Tahmini toplam: ~15 dk · Proje karmaşıklığına göre değişebilir.'
    : 'Estimated total: ~15 min · May vary based on project complexity.'

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-kx-border">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-[12px] font-bold text-kx-muted tracking-[0.08em] uppercase">
          Sonra ne olacak?
        </div>
        <div className="text-[11px] text-kx-muted font-mono">
          {estimatedText}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {STEPS.map((s) => {
          const active = s.n === activeStep
          return (
            <div
              key={s.n}
              className={`p-3 rounded-lg border ${
                active ? 'border-kx-navy bg-kx-blue-soft' : 'border-kx-border bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-bold ${
                    active ? 'bg-kx-navy text-white' : 'bg-kx-border-soft text-kx-faint'
                  }`}
                >
                  {s.n}
                </span>
                <span className={`text-[12px] font-semibold ${active ? 'text-kx-navy' : 'text-kx-body'}`}>
                  {s.t}
                </span>
              </div>
              <div className={`text-[10px] font-mono pl-[26px] ${active ? 'text-kx-navy' : 'text-kx-muted'}`}>
                {s.d}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function YeniProjeHeader({
  breadcrumb,
  pill,
  title,
  subtitle,
}: {
  breadcrumb: { label: string; href: string }
  pill: string
  title: ReactNode
  subtitle: ReactNode
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-[13px] text-kx-muted mb-5">
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          href={breadcrumb.href as any}
          className="text-kx-muted no-underline hover:text-kx-ink transition-colors"
        >
          {breadcrumb.label}
        </Link>
        <span className="text-kx-faint">/</span>
        <span className="text-kx-ink font-medium">{title}</span>
      </div>
      <div className="mb-7">
        <KxPill tone="blue">{pill}</KxPill>
        <h1 className="font-display text-[36px] font-bold text-kx-ink tracking-[-0.025em] mt-3.5 mb-2 leading-[1.1]">
          {title}
        </h1>
        <p className="text-[15.5px] text-kx-body m-0 leading-[1.55] max-w-[580px]">
          {subtitle}
        </p>
      </div>
    </>
  )
}
