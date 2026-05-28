import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { projeGetir, type ProjeDetayRow } from '@/lib/projects/actions'
import { getKullaniciPlan } from '@/lib/abonelik'
import SonProjeKaydet from '@/components/SonProjeKaydet'
import CalismaEkrani from '@/components/calisma/CalismaEkrani'
import KxPill from '@/components/ui/KxPill'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const proje = await projeGetir(id)
  const t = await getTranslations('projeDetay')
  return { title: proje?.ad ?? t('baslik') }
}

/* ──────────────────────────────────────────────────────────────────
   Project header — sits ABOVE CalismaEkrani and gives the workspace
   a proper sticky top: breadcrumb + name + status pills + tags +
   action buttons.
   ────────────────────────────────────────────────────────────────── */

function ProjectHeader({ proje, locale }: { proje: ProjeDetayRow; locale: string }) {
  const initials = proje.ad
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const tarihFmt = (s: string | null) =>
    s
      ? new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(s))
      : ''

  const olusturma = tarihFmt(proje.olusturma_tarihi ?? null)
  const guncelleme = tarihFmt(proje.guncelleme_tarihi ?? null)

  return (
    <div className="bg-white border-b border-kx-border">
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="flex items-center gap-2 text-[12.5px] text-kx-muted mb-3.5">
          <Link href="/projeler" className="text-inherit no-underline hover:text-kx-ink transition-colors">
            ← {locale === 'tr' ? 'Projelerime dön' : 'Back to projects'}
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex items-start gap-4.5">
            <div className="w-14 h-14 rounded-2xl bg-kx-navy text-white grid place-items-center font-brand font-bold text-[20px] shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <h1 className="font-display text-[26px] font-bold text-kx-ink m-0 tracking-[-0.02em]">
                  {proje.ad}
                </h1>
                <ProjectStatusPill durum={proje.durum} locale={locale} />
                {proje.dil && (
                  <span className="text-[11px] font-mono font-bold text-kx-muted bg-kx-bg border border-kx-border-soft px-1.5 py-0.5 rounded">
                    {proje.dil.toUpperCase()}
                  </span>
                )}
                {proje.proje_buyuklugu && (
                  <span className="text-[11px] font-mono font-bold text-kx-muted bg-kx-bg border border-kx-border-soft px-1.5 py-0.5 rounded">
                    {proje.proje_buyuklugu}
                  </span>
                )}
              </div>
              {proje.aciklama && (
                <p className="text-[13.5px] text-kx-body m-0 max-w-[720px] leading-[1.5] line-clamp-2">
                  {proje.aciklama}
                </p>
              )}
              <div className="mt-2.5 flex gap-3.5 text-[12px] text-kx-muted font-mono">
                {olusturma && (
                  <span>
                    {locale === 'tr' ? 'Oluşturuldu' : 'Created'} · {olusturma}
                  </span>
                )}
                {guncelleme && (
                  <>
                    <span className="text-kx-faint">·</span>
                    <span>
                      {locale === 'tr' ? 'Güncellendi' : 'Updated'} · {guncelleme}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {/* These are placeholders — the actual download buttons live inside
                each step's StepCard action slot in CalismaEkrani. We keep a
                lightweight "Tümünü indir" affordance here for parity with the
                design. */}
            <button className="bg-white border border-kx-border text-[13px] text-kx-body font-medium px-3.5 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 hover:border-kx-blue transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
              {locale === 'tr' ? 'Tüm çıktıları gör' : 'View outputs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectStatusPill({ durum, locale }: { durum: string; locale: string }) {
  const isTR = locale === 'tr'
  const map: Record<string, { tone: 'blue' | 'green' | 'amber' | 'gray'; label: string }> = {
    aktif:       { tone: 'amber',  label: isTR ? 'Aktif' : 'Active' },
    tamamlandi:  { tone: 'green',  label: isTR ? 'Tamamlandı' : 'Completed' },
    arsivlendi:  { tone: 'gray',   label: isTR ? 'Arşiv' : 'Archived' },
  }
  const m = map[durum] ?? { tone: 'blue' as const, label: durum }
  return (
    <KxPill tone={m.tone} dot>
      {m.label}
    </KxPill>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────── */

export default async function ProjeDetayPage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const projeRaw = await projeGetir(id)

  if (!projeRaw) {
    redirect({ href: '/projeler', locale })
  }

  const proje = projeRaw as ProjeDetayRow
  const t = await getTranslations('projeDetay')

  const [{ data: dokumanlar, error: dokError }, planBilgisi] = await Promise.all([
    supabase.from('dokumanlar').select('*').eq('proje_id', proje.id),
    getKullaniciPlan(supabase, user!.id),
  ])

  if (dokError) console.error('Doküman hatası:', dokError)

  const backHref = '/projeler'
  const backLabel = `← ${t('geri')}`

  return (
    <>
      <SonProjeKaydet id={proje.id} ad={proje.ad} />
      <ProjectHeader proje={proje} locale={locale} />
      <main className="flex-1 bg-kx-bg">
        <div className="max-w-[1280px] mx-auto px-1 md:px-8 py-6 pb-20">
          <CalismaEkrani
            initialProje={{
              id: proje.id,
              ad: proje.ad,
              aciklama: proje.aciklama ?? null,
              dil: proje.dil ?? 'TR',
              projeBuyuklugu: proje.proje_buyuklugu ?? null,
            }}
            mevcutDokumanlar={dokumanlar ?? []}
            backHref={backHref}
            backLabel={backLabel}
            initialPlan={planBilgisi}
          />
        </div>
      </main>
    </>
  )
}
