import { getTranslations } from 'next-intl/server'
import KxPill from '@/components/ui/KxPill'

const TONE_CLASSES = ['bg-kx-blue', 'bg-kx-red', 'bg-kx-amber', 'bg-kx-navy'] as const
const RING_CLASSES = ['before:bg-kx-blue', 'before:bg-kx-red', 'before:bg-kx-amber', 'before:bg-kx-navy'] as const
const PERSONA_KEYS = ['analyst', 'pm', 'developer', 'entrepreneur'] as const

export default async function UseCases() {
  const t = await getTranslations('landing.useCases')

  const personas = PERSONA_KEYS.map((key, i) => ({
    key,
    role:      t(`personas.${key}.role`),
    who:       t(`personas.${key}.who`),
    pain:      t(`personas.${key}.pain`),
    win:       t(`personas.${key}.win`),
    before:    t(`personas.${key}.before`),
    after:     t(`personas.${key}.after`),
    toneClass: TONE_CLASSES[i],
    ringClass: RING_CLASSES[i],
  }))

  return (
    <section className="bg-kx-bg py-22 px-8 border-t border-kx-border">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <KxPill tone="blue">{t('kicker')}</KxPill>
            <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 leading-[1.1] max-w-[600px]">
              {t('title')}
            </h2>
          </div>
          <a href="/#" className="text-kx-blue text-[14px] no-underline font-semibold">
            {t('seeAll')}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((p) => (
            <div
              key={p.key}
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
                &ldquo;{p.pain}&rdquo;
              </div>
              <div className="text-[13px] text-kx-body px-3 py-2.5 bg-kx-green-soft rounded-md mb-4 border-l-[3px] border-kx-green">
                → {p.win}
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="px-3 py-2.5 bg-kx-bg rounded-md">
                  <div className="text-kx-muted text-[10px] mb-0.5">{t('before')}</div>
                  <div className="text-kx-ink font-semibold">{p.before}</div>
                </div>
                <div className={`px-3 py-2.5 ${p.toneClass} text-white rounded-md`}>
                  <div className="text-white/70 text-[10px] mb-0.5">{t('after')}</div>
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
