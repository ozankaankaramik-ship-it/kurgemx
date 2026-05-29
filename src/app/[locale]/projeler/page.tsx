import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { ProjeListeRow } from '@/lib/projects/actions'
import ProjeKarti from '@/components/ProjeKarti'
import ProjeSekmesi from '@/components/ProjeSekmesi'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projeler')
  return { title: t('baslik') }
}

const SELECT =
  'id, ad, aciklama, dil, durum, arsivlendi_tarih, olusturma_tarihi, guncelleme_tarihi, hikayeler(count), dokumanlar(tip_id)'

function formatTarih(tarihStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(tarihStr))
}

function DashboardHeader({
  username,
  toplam,
  yeniProjeLabel,
  yeniProjeHref,
}: {
  username: string
  toplam: number
  yeniProjeLabel: string
  yeniProjeHref: string
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
      <div>
        <div className="text-[13px] text-kx-muted mb-1.5">
          Tekrar hoş geldin, {username} 👋
        </div>
        <h1 className="font-display text-[36px] font-bold text-kx-ink tracking-[-0.025em] m-0 leading-[1]">
          Projelerim
        </h1>
        <div className="text-[13px] text-kx-muted mt-3">
          <strong className="text-kx-ink font-semibold">{toplam}</strong>{' '}
          {toplam === 1 ? 'proje' : 'proje'}
        </div>
      </div>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={yeniProjeHref as any}
        className="inline-flex items-center gap-2 bg-kx-red text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl no-underline shadow-kx-red whitespace-nowrap self-start"
      >
        <span className="text-base leading-none">+</span> {yeniProjeLabel}
      </Link>
    </div>
  )
}

function EmptyState({
  t,
  yeniProjeHref,
  isArsiv,
}: {
  t: Awaited<ReturnType<typeof getTranslations<'projeler'>>>
  yeniProjeHref: string
  isArsiv: boolean
}) {
  if (isArsiv) {
    return (
      <div className="bg-white rounded-2xl border border-kx-border flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-[16px] font-semibold text-kx-ink mb-2">{t('bosHal.arsivBaslik')}</p>
        <p className="text-[13.5px] text-kx-muted max-w-sm leading-[1.55]">{t('bosHal.arsivAciklama')}</p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-kx-border flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="grid place-items-center rounded-2xl mb-5 w-14 h-14 bg-kx-blue-soft">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="#2E75B6"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-[16px] font-semibold text-kx-ink mb-2">{t('bosHal.baslik')}</p>
      <p className="text-[13.5px] text-kx-muted mb-6 max-w-sm leading-[1.55]">{t('bosHal.aciklama')}</p>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        href={yeniProjeHref as any}
        className="inline-flex items-center bg-kx-red text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl no-underline shadow-kx-red"
      >
        {t('bosHal.btn')}
      </Link>
    </div>
  )
}

type SearchParams = Promise<{ sekme?: string }>

export default async function ProjelerPage({ searchParams }: { searchParams: SearchParams }) {
  const { sekme: sekmeParam } = await searchParams
  const sekme = sekmeParam === 'arsiv' ? 'arsiv' : 'aktif'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const t = await getTranslations('projeler')

  const { data: tumProjeler, error: projelerHata } = await supabase
    .from('projeler')
    .select(SELECT)
    .eq('kullanici_id', user!.id)
    .order('olusturma_tarihi', { ascending: false })

  if (projelerHata) {
    console.error('[ProjelerPage] sorgu hatası:', projelerHata)
  }

  const tumListe = (tumProjeler ?? []) as unknown as ProjeListeRow[]
  const aktifListe = tumListe.filter((p) => p.durum === 'aktif' || p.durum === 'tamamlandi')
  const arsivListe = tumListe.filter((p) => p.durum === 'arsivlendi')
  const gorunenListe = sekme === 'arsiv' ? arsivListe : aktifListe

  const username =
    (user?.user_metadata?.ad as string | undefined) ||
    user?.email?.split('@')[0] ||
    ''

  const yeniProjeHref = '/projeler/yeni'
  const isTR = locale === 'tr'

  const durumLabelMap: Record<string, string> = {
    aktif:      isTR ? 'Aktif'      : 'Active',
    tamamlandi: isTR ? 'Tamamlandı' : 'Completed',
    arsivlendi: isTR ? 'Arşivlendi' : 'Archived',
  }

  return (
    <>
      <main className="flex-1 bg-kx-bg">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-8 pb-20 w-full">

          {projelerHata && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {t('hataMesaji')}
            </div>
          )}

          <DashboardHeader
            username={username}
            toplam={gorunenListe.length}
            yeniProjeLabel={t('yeniProje').replace(/^\+\s*/, '')}
            yeniProjeHref={yeniProjeHref}
          />

          <Suspense fallback={null}>
            <ProjeSekmesi
              aktifLabel={isTR ? 'Aktif Projeler' : 'Active Projects'}
              arsivLabel={isTR ? 'Arşiv' : 'Archive'}
              aktifSayi={aktifListe.length}
              arsivSayi={arsivListe.length}
            />
          </Suspense>

          {gorunenListe.length === 0 ? (
            <EmptyState t={t} yeniProjeHref={yeniProjeHref} isArsiv={sekme === 'arsiv'} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {gorunenListe.map((proje) => (
                <ProjeKarti
                  key={proje.id}
                  proje={proje}
                  href={`/projeler/${proje.id}`}
                  olusturmaTarihi={
                    proje.olusturma_tarihi
                      ? formatTarih(proje.olusturma_tarihi, locale)
                      : ''
                  }
                  hikayeEtiketi={t('kart.hikayeSayisi')}
                  dokumanEtiketi={t('kart.dokumanSayisi')}
                  dilEtiketi={(proje.dil ?? 'TR').toUpperCase()}
                  durumLabel={durumLabelMap[proje.durum] ?? proje.durum}
                  locale={locale}
                  arsivleOnayi={
                    isTR
                      ? `"${proje.ad}" projesini arşivlemek istediğinize emin misiniz? Arşivlenen projeler Arşiv sekmesinden erişilebilir.`
                      : `Are you sure you want to archive "${proje.ad}"? Archived projects can be accessed from the Archive tab.`
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
