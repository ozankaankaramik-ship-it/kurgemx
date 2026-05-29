import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import { Link } from '@/i18n/navigation'

/**
 * Reusable layout for legal pages: Privacy, Terms, Refund, Sales Agreement.
 * - Lacivert hero with title + last-update timestamp
 * - Sticky left "Table of contents" on desktop
 * - Numbered section cards on the right
 * - Optional satıcı (seller) block above the intro
 * - Footer contact card (address + email + web)
 *
 * Pass `tNamespace` matching the translations key
 * (e.g. 'privacy', 'terms', 'refund', 'salesAgreement').
 *
 * Section count is flexible — pass `sectionCount` to control how many
 * "sN" + "sNBaslik" + "sNIcerik" tuples to render.
 */
type LegalPageProps = {
  tNamespace: 'privacy' | 'terms' | 'refund' | 'salesAgreement'
  /** How many numbered sections to render */
  sectionCount: number
  /** Show "Satıcı Bilgileri" block above the intro (sales-agreement) */
  withSatici?: boolean
  /** Optional small italic note at the end of the content column */
  footerNote?: ReactNode
}

export async function generateLegalMetadata(
  ns: LegalPageProps['tNamespace'],
): Promise<Metadata> {
  const t = await getTranslations(ns)
  return { title: t('baslik') }
}

export default async function LegalLayout({
  tNamespace,
  sectionCount,
  withSatici = false,
  footerNote,
}: LegalPageProps) {
  const t = await getTranslations(tNamespace)

  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    baslik: t(`s${i + 1}Baslik` as Parameters<typeof t>[0]),
    icerik: t(`s${i + 1}Icerik` as Parameters<typeof t>[0]),
  }))

  return (
    <>
      <main className="flex-1 bg-white">
        <PageHero
          kicker={t('baslik')}
          title={t('baslik')}
          subtitle={tNamespace === 'salesAgreement' ? t('kanun' as Parameters<typeof t>[0]) : undefined}
          lastUpdate={t('sonGuncelleme' as Parameters<typeof t>[0])}
        />

        <section className="px-8 pt-14 pb-20">
          <div className="max-w-[920px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">

            {/* Sticky TOC */}
            <aside className="hidden lg:block sticky top-22 self-start">
              <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-4">
                İçindekiler
              </div>
              <nav className="flex flex-col gap-0.5 text-[13px]">
                {sections.map((s, i) => (
                  <a
                    key={i}
                    href={`#s${i + 1}`}
                    className={`no-underline px-2.5 py-1.5 leading-[1.4] border-l-2 transition-colors ${
                      i === 0
                        ? 'text-kx-navy border-kx-navy font-semibold'
                        : 'text-kx-body border-kx-border-soft hover:text-kx-ink hover:border-kx-blue'
                    }`}
                  >
                    {s.baslik}
                  </a>
                ))}
                <a
                  href="#iletisim"
                  className="no-underline px-2.5 py-1.5 leading-[1.4] border-l-2 border-kx-border-soft text-kx-body text-[13px] mt-1 hover:text-kx-ink"
                >
                  {t('iletisim' as Parameters<typeof t>[0])}
                </a>
              </nav>

              <div className="mt-7 p-3.5 bg-kx-amber-soft rounded-lg text-[12px] text-kx-amber-ink leading-[1.5]">
                <strong className="block mb-1">Yasal bilgilendirme</strong>
                Bu metin {t('baslik').toLowerCase()} bilgilendirmesidir, sözleşme yorumu için kanun maddeleri esastır.
              </div>
            </aside>

            <article>
              {withSatici && (
                <div className="bg-kx-bg border border-kx-border rounded-xl p-6 mb-8">
                  <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-3">
                    {tNamespace === 'salesAgreement' && t('saticiBaslik' as Parameters<typeof t>[0])}
                  </div>
                  <div className="text-[17px] font-bold text-kx-ink mb-1.5">
                    KurgemX
                  </div>
                  <div className="text-[14px] text-kx-body leading-[1.6]">
                    Alemdağ Mah. Reşadiye Cad. Dekon Silva B1-46<br />
                    34794 Çekmeköy / İstanbul ·{' '}
                    <a
                      href="mailto:destek@kurgemx.com"
                      className="text-kx-blue no-underline hover:underline"
                    >
                      destek@kurgemx.com
                    </a>
                  </div>
                </div>
              )}

              {t.has('giris') && (
                <p className="text-[16px] text-kx-body leading-[1.7] mb-9 py-4 px-5 bg-kx-blue-soft border-l-[3px] border-kx-blue rounded-r">
                  {t('giris' as Parameters<typeof t>[0])}
                </p>
              )}

              {sections.map((s, i) => (
                <div
                  key={i}
                  id={`s${i + 1}`}
                  className="mb-7 px-6 py-5 bg-white border border-kx-border rounded-xl scroll-mt-24"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-md bg-kx-navy text-white grid place-items-center text-[11px] font-mono font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-[19px] font-bold text-kx-ink m-0 tracking-tight">
                      {s.baslik}
                    </h2>
                  </div>
                  <p className="text-[14.5px] text-kx-body leading-[1.7] m-0 whitespace-pre-line">
                    {s.icerik}
                  </p>
                </div>
              ))}

              {/* Contact card */}
              <div id="iletisim" className="mt-14 p-7 bg-kx-bg border border-kx-border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-2.5">
                    Satıcı / İşletmeci
                  </div>
                  <div className="text-[17px] font-bold text-kx-ink mb-1">
                    KurgemX
                  </div>
                  <div className="text-[13px] text-kx-body leading-[1.55]">
                    Alemdağ Mah. Reşadiye Cad.<br />
                    Dekon Silva B1-46<br />
                    34794 Çekmeköy / İstanbul
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-kx-muted tracking-[0.08em] uppercase mb-2.5">
                    {t('iletisim' as Parameters<typeof t>[0])}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <a
                      href="mailto:destek@kurgemx.com"
                      className="inline-flex items-center gap-2.5 text-kx-ink no-underline text-[14px] font-medium hover:text-kx-blue transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-kx-blue-soft text-kx-blue grid place-items-center">@</span>
                      destek@kurgemx.com
                    </a>
                    <a
                      href="https://kurgemx.com"
                      className="inline-flex items-center gap-2.5 text-kx-ink no-underline text-[14px] font-medium hover:text-kx-blue transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-kx-blue-soft text-kx-blue grid place-items-center text-[14px]">↗</span>
                      kurgemx.com
                    </a>
                  </div>
                </div>
              </div>

              {footerNote && (
                <div className="mt-8 p-4 bg-kx-bg rounded-lg text-[13px] text-kx-muted italic">
                  {footerNote}
                </div>
              )}
            </article>
          </div>
        </section>
      </main>
    </>
  )
}
