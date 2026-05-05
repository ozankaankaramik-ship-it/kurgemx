import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import type { ProjeListeRow } from '@/lib/projects/actions'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projeler')
  return { title: t('baslik') }
}

function formatTarih(tarihStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(tarihStr))
}

function ProjeBadge({ proje, label }: { proje: ProjeListeRow; label: string }) {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  const durum = proje.durum

  let bg: string
  let color: string

  if (hikayeSayisi > 0) {
    bg = '#EEF4FB'
    color = '#0C447C'
  } else if (durum === 'aktif') {
    bg = '#EAF3DE'
    color = '#27500A'
  } else {
    bg = '#F1EFE8'
    color = '#444441'
  }

  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}

function getBadgeLabel(proje: ProjeListeRow, t: (key: string) => string): string {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  if (hikayeSayisi > 0) return t('badge.hikayeHaritasi')
  if (proje.durum === 'aktif') return t('badge.devamEdiyor')
  return t('badge.yeni')
}

export default async function ProjelerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const locale = await getLocale()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const t = await getTranslations('projeler')

  const { data: projeler, error: projelerHata } = await supabase
    .from('projeler')
    .select('*')
    .eq('kullanici_id', user!.id)
    .order('olusturma_tarihi', { ascending: false })

  if (projelerHata) {
    console.error('[ProjelerPage] Projeler sorgu hatası:', projelerHata)
  }

  const liste = (projeler ?? []) as unknown as ProjeListeRow[]

  return (
    <main className="flex-1 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">

        {/* Hata mesajı */}
        {projelerHata && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {t('hataMesaji')}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[18px] font-semibold" style={{ color: '#1F3864' }}>
            {t('baslik')}
          </h1>
          {liste.length > 0 && (
            <Link
              href="/projeler/yeni"
              className="inline-flex items-center h-[34px] px-4 rounded-md text-white text-[12px] font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1F3864' }}
            >
              {t('yeniProje')}
            </Link>
          )}
        </div>

        {/* Empty state */}
        {liste.length === 0 ? (
          <div
            className="bg-white rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center"
            style={{ border: '0.5px solid #E5E7EB' }}
          >
            <div
              className="flex items-center justify-center rounded-[10px] mb-4"
              style={{ width: 52, height: 52, backgroundColor: '#EEF4FB' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                  stroke="#2E75B6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[#1F3864] mb-2">
              {t('bosHal.baslik')}
            </p>
            <p className="text-[13px] text-gray-400 mb-6 max-w-xs leading-relaxed">
              {t('bosHal.aciklama')}
            </p>
            <Link
              href="/projeler/yeni"
              className="inline-flex items-center h-[34px] px-4 rounded-md text-white text-[12px] font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1F3864' }}
            >
              {t('bosHal.btn')}
            </Link>
          </div>
        ) : (
          /* Project list */
          <div className="flex flex-col gap-[4px]">
            {liste.map((proje) => (
              <Link
                key={proje.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={{ pathname: '/projeler/[id]', params: { id: proje.id } } as any}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 transition-colors hover:border-[#2E75B6]/30"
                style={{ border: '0.5px solid #E5E7EB' }}
              >
                {/* Left: icon + name + date */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: '#1F3864',
                      borderRadius: 8,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        fill="rgba(255,255,255,0.85)"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-[500] text-[#1F3864] truncate">
                      {proje.ad}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {proje.olusturma_tarihi
                        ? formatTarih(proje.olusturma_tarihi, locale)
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Right: badge + arrow */}
                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                  <ProjeBadge proje={proje} label={getBadgeLabel(proje, t)} />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
