import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing')
  return { title: t('baslik') }
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 mx-auto" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#DCFCE7" />
      <path
        d="M4.5 8.5l2.5 2.5 4.5-4.5"
        stroke="#16A34A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashCell() {
  return (
    <span
      className="block text-center text-[#D1D5DB] font-semibold text-base leading-none"
      aria-hidden="true"
    >
      —
    </span>
  )
}

function Cell({ val }: { val: boolean | string }) {
  if (val === true) return <CheckIcon />
  if (val === false) return <DashCell />
  return <span className="block text-center text-sm font-semibold text-[#1F3864]">{val}</span>
}

export default async function PricingPage() {
  const t = await getTranslations('pricing')

  type Row = { label: string; vals: (boolean | string)[] }
  type Section = { label: string; rows: Row[] }

  const sections: Section[] = [
    {
      label: t('bolumler.kapsam'),
      rows: [
        { label: t('satirlar.projeAy'),        vals: ['1', '3', '10', t('sinirsiz')] },
        { label: t('satirlar.kucukProje'),      vals: [true,  true,  true,  true]  },
        { label: t('satirlar.ortaProje'),       vals: [false, true,  true,  true]  },
        { label: t('satirlar.buyukProje'),      vals: [false, false, true,  true]  },
      ],
    },
    {
      label: t('bolumler.ai'),
      rows: [
        { label: t('satirlar.hikayeHaritasi'), vals: [true,  true,  true,  true]  },
        { label: t('satirlar.analizDokumani'), vals: [true,  true,  true,  true]  },
        { label: t('satirlar.prototip'),       vals: [false, true,  true,  true]  },
        { label: t('satirlar.testSenaryosu'),  vals: [false, true,  true,  true]  },
        { label: t('satirlar.export'),         vals: [false, true,  true,  true]  },
        { label: t('satirlar.dil'),            vals: [true,  true,  true,  true]  },
      ],
    },
    {
      label: t('bolumler.kurumsal'),
      rows: [
        { label: t('satirlar.kullaniciYonetimi'), vals: [false, false, false, true] },
        { label: t('satirlar.faturalandirma'),    vals: [false, false, false, true] },
        { label: t('satirlar.sso'),               vals: [false, false, false, true] },
        { label: t('satirlar.sla'),               vals: [false, false, false, true] },
      ],
    },
  ]

  // vals index 1 = Analyst column
  const ANALYST = 1

  return (
    <main className="flex-1 bg-[#F9FAFB]">
      <div className="bg-[#1F3864] text-white py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">{t('baslik')}</h1>
        <p className="text-[#B5D4F4] text-base max-w-xl mx-auto">{t('altBaslik')}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] shadow-sm bg-white">
          <table className="w-full text-sm" style={{ minWidth: 680 }}>
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '15.5%' }} />
              <col style={{ width: '15.5%' }} />
              <col style={{ width: '15.5%' }} />
              <col style={{ width: '15.5%' }} />
            </colgroup>

            {/* ── Plan headers ── */}
            <thead>
              <tr className="bg-[#1F3864]">
                <th className="px-6 py-6" />

                {/* Freemium */}
                <th className="px-3 py-6 text-center align-top">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#B5D4F4] mb-1">
                    {t('planlar.freemium.ad')}
                  </p>
                  <p className="text-2xl font-bold text-white leading-none">
                    {t('planlar.freemium.fiyat')}
                  </p>
                  <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.freemium.aylik')}</p>
                  <p className="text-[10px] text-[#B5D4F4]/60 italic mt-2 leading-tight">
                    {t('freemiumNot')}
                  </p>
                </th>

                {/* Analyst — En Popüler */}
                <th className="px-3 py-6 text-center align-top relative border-l-[2px] border-r-[2px] border-t-[2px] border-[#2E75B6]">
                  <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#2E75B6] text-white text-[10px] font-semibold px-3 py-[3px] rounded-full whitespace-nowrap shadow-sm">
                    {t('enPopuler')}
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#B5D4F4] mb-1">
                    {t('planlar.analyst.ad')}
                  </p>
                  <p className="text-2xl font-bold text-white leading-none">
                    {t('planlar.analyst.fiyat')}
                  </p>
                  <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.analyst.aylik')}</p>
                </th>

                {/* Advanced */}
                <th className="px-3 py-6 text-center align-top">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#B5D4F4] mb-1">
                    {t('planlar.advanced.ad')}
                  </p>
                  <p className="text-2xl font-bold text-white leading-none">
                    {t('planlar.advanced.fiyat')}
                  </p>
                  <p className="text-xs text-[#B5D4F4] mt-1">{t('planlar.advanced.aylik')}</p>
                </th>

                {/* Enterprise */}
                <th className="px-3 py-6 text-center align-top">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#B5D4F4] mb-1">
                    {t('planlar.enterprise.ad')}
                  </p>
                  <a
                    href="mailto:support@kurgemx.com"
                    className="inline-block mt-3 rounded-md bg-white text-[#1F3864] text-xs font-semibold px-3 py-1.5 hover:bg-[#EEF4FB] transition-colors"
                  >
                    {t('teklifAl')}
                  </a>
                </th>
              </tr>
            </thead>

            {/* ── Feature rows ── */}
            <tbody>
              {sections.flatMap((section, si) => {
                const isLastSection = si === sections.length - 1
                return [
                  <tr key={`sec-${si}`} className="bg-[#EEF4FB]">
                    <td
                      colSpan={5}
                      className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#1F3864]"
                    >
                      {section.label}
                    </td>
                  </tr>,
                  ...section.rows.map((row, ri) => {
                    const isLastRow = isLastSection && ri === section.rows.length - 1
                    return (
                      <tr
                        key={`row-${si}-${ri}`}
                        className={ri % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}
                      >
                        <td className="px-6 py-3.5 text-sm text-[#374151]">{row.label}</td>
                        {row.vals.map((val, ci) => (
                          <td
                            key={ci}
                            className={[
                              'px-4 py-3.5',
                              ci === ANALYST
                                ? [
                                    'border-l-[2px] border-r-[2px] border-[#2E75B6]',
                                    isLastRow ? 'border-b-[2px]' : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
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

        <p className="text-center text-sm text-gray-500 mt-10">
          {t('soruMetni')}{' '}
          <a
            href="mailto:destek@kurgemx.com"
            className="text-[#2E75B6] hover:underline font-medium"
          >
            destek@kurgemx.com
          </a>
        </p>
      </div>
    </main>
  )
}
