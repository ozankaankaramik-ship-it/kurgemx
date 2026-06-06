import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import KxPill from '@/components/ui/KxPill'
import HeroProductPreview from './HeroProductPreview'

type TF = (key: string) => string

/* ──────────────────────────────────────────────────────────────────
   Three sample document visuals — used as feature illustrations
   ────────────────────────────────────────────────────────────────── */

function VisualDoc({ tF }: { tF: TF }) {
  const sections = [
    { h: tF('doc.s1h'), t: tF('doc.s1t') },
    { h: tF('doc.s2h'), t: tF('doc.s2t') },
    { h: tF('doc.s3h'), t: tF('doc.s3t') },
  ]

  return (
    <div className="bg-white border border-kx-border rounded-xl p-6 shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-mono text-[11px] text-kx-muted">{tF('doc.filename')}</div>
        <KxPill tone="green" dot>{tF('doc.badge')}</KxPill>
      </div>
      <div className="font-display text-[20px] font-bold text-kx-ink mb-2 tracking-tight">
        {tF('doc.docTitle')}
      </div>
      <div className="text-[11px] text-kx-muted mb-4">
        {tF('doc.toc')}
      </div>
      {sections.map((b) => (
        <div key={b.h} className="mb-3 px-3.5 py-3 bg-kx-bg border-l-[3px] border-kx-blue rounded-r-md">
          <div className="text-[11px] font-bold text-kx-navy mb-1">{b.h}</div>
          <div className="text-[12px] text-kx-body leading-[1.6] whitespace-pre-line">{b.t}</div>
        </div>
      ))}
      <div className="mt-3.5 flex gap-2">
        <a href="#" className="bg-kx-navy text-white text-[12px] px-3.5 py-2 rounded-md no-underline">
          {tF('doc.download')}
        </a>
        <a href="#" className="bg-white text-kx-ink text-[12px] px-3.5 py-2 rounded-md no-underline border border-kx-border">
          {tF('doc.preview')}
        </a>
      </div>
    </div>
  )
}

function VisualPrototype({ tF }: { tF: TF }) {
  const navItems = [tF('proto.nav1'), tF('proto.nav2'), tF('proto.nav3'), tF('proto.nav4'), tF('proto.nav5')]

  return (
    <div className="bg-white border border-kx-border rounded-xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="bg-kx-navy px-3.5 py-2.5 text-white flex justify-between text-[11px]">
        <span className="font-mono">{tF('proto.filename')}</span>
        <span className="text-white/60">{tF('proto.screenCount')}</span>
      </div>
      <div className="p-4 bg-kx-bg grid grid-cols-[160px_1fr] gap-4 min-h-70">
        {/* Sidebar */}
        <div className="bg-white border border-kx-border-soft rounded-lg p-2.5">
          {navItems.map((s, i) => (
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
          <div className="text-[16px] font-bold text-kx-ink mt-3">{tF('proto.welcome')}</div>
          <div className="text-[11px] text-kx-muted mb-2">{tF('proto.subtitle')}</div>
          <div className="bg-kx-bg h-8 rounded-md text-[11px] text-kx-muted px-2.5 py-2">
            {tF('proto.emailPlaceholder')}
          </div>
          <div className="bg-kx-bg h-8 rounded-md text-[11px] text-kx-muted px-2.5 py-2">
            ••••••••
          </div>
          <div className="bg-kx-navy h-8.5 rounded-md text-white text-[12px] font-semibold grid place-items-center">
            {tF('proto.signIn')}
          </div>
          <div className="absolute top-3 right-3 bg-kx-amber text-kx-ink text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {tF('proto.editBadge')}
          </div>
        </div>
      </div>
    </div>
  )
}

type StatusKey = 'pass' | 'pending'
type TestRowData = { id: string; scenario: string; type: string; steps: number; statusKey: StatusKey }

function VisualTest({ tF }: { tF: TF }) {
  const rows: TestRowData[] = [
    { id: 'TC-001', scenario: tF('test.tc001'), type: tF('test.tc001type'), steps: 5,  statusKey: 'pass' },
    { id: 'TC-002', scenario: tF('test.tc002'), type: tF('test.tc002type'), steps: 3,  statusKey: 'pass' },
    { id: 'TC-003', scenario: tF('test.tc003'), type: tF('test.tc003type'), steps: 6,  statusKey: 'pending' },
    { id: 'TC-004', scenario: tF('test.tc004'), type: tF('test.tc004type'), steps: 4,  statusKey: 'pass' },
    { id: 'TC-005', scenario: tF('test.tc005'), type: tF('test.tc005type'), steps: 7,  statusKey: 'pending' },
  ]

  const cols = [tF('test.colId'), tF('test.colScenario'), tF('test.colType'), tF('test.colStep'), tF('test.colStatus')]

  return (
    <div className="bg-white border border-kx-border rounded-xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,30,80,0.15)]">
      <div className="bg-[#107C41] text-white px-3.5 py-2 font-mono text-[11px] flex justify-between">
        <span>{tF('test.filename')}</span>
        <span>{tF('test.rowCount')}</span>
      </div>
      <div className="grid grid-cols-[70px_1fr_90px_60px_90px] bg-[#F4F4F2] text-[10px] font-bold text-kx-muted uppercase tracking-wider">
        {cols.map((h) => (
          <div key={h} className="px-2.5 py-2 border-r border-kx-border-soft">
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={r.id}
          className={`grid grid-cols-[70px_1fr_90px_60px_90px] text-[12px] border-t border-kx-border-soft ${
            i % 2 ? 'bg-white' : 'bg-[#FBFBFA]'
          }`}
        >
          <div className="px-2.5 py-2.5 border-r border-kx-border-soft text-kx-blue font-semibold font-mono">{r.id}</div>
          <div className="px-2.5 py-2.5 border-r border-kx-border-soft text-kx-body">{r.scenario}</div>
          <div className="px-2.5 py-2.5 border-r border-kx-border-soft text-kx-body">{r.type}</div>
          <div className="px-2.5 py-2.5 border-r border-kx-border-soft text-kx-body">{r.steps}</div>
          <div className={`px-2.5 py-2.5 border-r border-kx-border-soft font-semibold ${
            r.statusKey === 'pass' ? 'text-kx-green' : 'text-[#D97706]'
          }`}>
            {tF(`test.${r.statusKey}`)}
          </div>
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
  const t = await getTranslations('landing.featureSection')
  const tF = (key: string) => t(key as Parameters<typeof t>[0])

  return (
    <section id="ozellikler" className="bg-white py-22 px-8">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center max-w-[720px] mx-auto mb-6">
          <KxPill tone="blue">{t('pill')}</KxPill>
          <h2 className="font-display text-[48px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3.5 leading-[1.1]">
            {t('heading')}
          </h2>
          <p className="text-[17px] text-kx-body leading-[1.5]">
            {t('desc')}
          </p>
        </div>

        <FeatureBlock
          idx={0}
          tag={t('b1tag')}
          tone="blue"
          title={t('b1title')}
          desc={t('b1desc')}
          visual={<HeroProductPreview />}
        />
        <FeatureBlock
          idx={1}
          tag={t('b2tag')}
          tone="blue"
          reverse
          title={t('b2title')}
          desc={t('b2desc')}
          visual={<VisualDoc tF={tF} />}
        />
        <FeatureBlock
          idx={2}
          tag={t('b3tag')}
          tone="red"
          title={t('b3title')}
          desc={t('b3desc')}
          visual={<VisualPrototype tF={tF} />}
        />
        <FeatureBlock
          idx={3}
          tag={t('b4tag')}
          tone="amber"
          reverse
          title={t('b4title')}
          desc={t('b4desc')}
          visual={<VisualTest tF={tF} />}
        />
      </div>
    </section>
  )
}
