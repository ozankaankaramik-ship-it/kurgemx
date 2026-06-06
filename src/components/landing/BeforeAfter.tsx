import { getTranslations } from 'next-intl/server'
import KxPill from '@/components/ui/KxPill'

export default async function BeforeAfter() {
  const t = await getTranslations('landing.beforeAfter')

  const OLD_ROWS: [string, string][] = [
    [t('oldR1l'), t('oldR1d')],
    [t('oldR2l'), t('oldR2d')],
    [t('oldR3l'), t('oldR3d')],
    [t('oldR4l'), t('oldR4d')],
    [t('oldR5l'), t('oldR5d')],
  ]

  const NEW_ROWS: [string, string][] = [
    [t('newR1l'), t('newR1d')],
    [t('newR2l'), t('newR2d')],
    [t('newR3l'), t('newR3d')],
    [t('newR4l'), t('newR4d')],
    [t('newR5l'), t('newR5d')],
  ]

  return (
    <section className="bg-kx-bg-warm py-22 px-8">
      <div className="max-w-[1080px] mx-auto text-center mb-14">
        <KxPill tone="amber">{t('pill')}</KxPill>
        <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3.5 leading-[1.1] text-balance">
          {t('heading')}
        </h2>
      </div>

      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Old way */}
        <div className="bg-white rounded-2xl p-7 border border-kx-border">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-lg bg-[#F1F2F4] grid place-items-center text-kx-muted text-base">×</span>
            <div>
              <div className="text-[11px] text-kx-muted font-semibold tracking-[0.08em] uppercase">{t('oldTag')}</div>
              <div className="text-[17px] font-bold text-kx-ink">{t('oldLabel')}</div>
            </div>
          </div>
          {OLD_ROWS.map(([label, dur]) => (
            <div
              key={label}
              className="flex justify-between py-3 border-t border-kx-border-soft text-[13px]"
            >
              <span className="text-kx-body">{label}</span>
              <span className="text-kx-muted font-mono text-[12px]">{dur}</span>
            </div>
          ))}
          <div className="mt-5 px-3.5 py-3.5 bg-[#F8F8F6] rounded-lg text-[13px] text-kx-body flex justify-between items-center">
            <span>{t('totalLabel')}</span>
            <span className="font-display text-[22px] font-bold text-kx-ink">{t('oldTotal')}</span>
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
              <div className="text-[11px] text-white/60 font-semibold tracking-[0.08em] uppercase">{t('newTag')}</div>
              <div className="text-[17px] font-bold">{t('newLabel')}</div>
            </div>
          </div>
          {NEW_ROWS.map(([label, dur]) => (
            <div
              key={label}
              className="flex justify-between py-3 border-t border-white/12 text-[13px] relative"
            >
              <span>{label}</span>
              <span className="text-kx-amber font-mono text-[12px] font-semibold">{dur}</span>
            </div>
          ))}
          <div className="mt-5 px-3.5 py-3.5 bg-white/8 rounded-lg text-[13px] flex justify-between items-center relative">
            <span>{t('totalLabel')}</span>
            <span className="font-display text-[22px] font-bold text-kx-amber">{t('newTotal')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
