import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { projeGetir, type ProjeDetayRow } from '@/lib/projects/actions'
import SonProjeKaydet from '@/components/SonProjeKaydet'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

function formatTarih(tarihStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(tarihStr))
}

function dilEtiketiHesapla(dil: string, locale: string) {
  if (locale === 'tr') return dil === 'EN' ? 'İngilizce' : 'Türkçe'
  return dil === 'EN' ? 'English' : 'Turkish'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const proje = await projeGetir(id)
  const t = await getTranslations('projeDetay')
  return { title: proje?.ad ?? t('baslik') }
}

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

  // İK-004: Uygulama katmanı erişim kontrolü — RLS zaten Supabase seviyesinde korur,
  // burada da null kontrolü yaparak yetkisiz erişimi yakalarız.
  const projeRaw = await projeGetir(id)

  // K7-02: Proje bulunamadı (başka kullanıcıya ait veya mevcut değil) → listeye yönlendir
  if (!projeRaw) {
    redirect({ href: '/projeler', locale })
  }

  const proje = projeRaw as ProjeDetayRow
  const t = await getTranslations('projeDetay')
  const tw = await getTranslations('calismaEkrani')

  return (
    <main className="min-h-screen bg-gray-100">
      <SonProjeKaydet id={proje.id} ad={proje.ad} />

      <div className="max-w-4xl mx-auto px-4 py-10 w-full">

        {/* Üst bar: geri + proje adı */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/projeler"
            className="text-sm text-gray-500 hover:underline shrink-0"
          >
            ← {t('geri')}
          </Link>
          <h1 className="text-lg font-semibold text-[#1F3864] truncate">
            {proje.ad}
          </h1>
        </div>

        {/* Salt okunur banner */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {tw('saltOkunurBanner')}
        </div>

        {/* Adımlar */}
        <div>

          {/* Adım 1 — Salt okunur proje bilgileri */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {tw('adim1.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {tw('adim1.projeAdi')}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">{proje.ad}</p>
                </div>
                {proje.aciklama && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">
                      {tw('adim1.aciklama')}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">{proje.aciklama}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {t('olusturmaTarihi')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTarih(proje.olusturma_tarihi, locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 2 — Pasif */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {tw('adim2.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                  {tw('adim2.uret')}
                </button>
                <div className="mt-5 rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{tw('adim2.sutun1')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/2">{tw('adim2.sutun2')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{tw('adim2.sutun3')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-300">
                          {tw('adim2.tabloBos')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 3 — Pasif */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {tw('adim3.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5">
                  {tw('adim3.uret')}
                </button>
                <div className="grid grid-cols-3 gap-4">
                  {([tw('adim3.r1'), tw('adim3.r2'), tw('adim3.r3')] as string[]).map((r) => (
                    <div key={r} className="rounded-lg border border-gray-100 p-4 flex flex-col gap-3">
                      <p className="text-sm font-semibold text-gray-300">{r}</p>
                      <span className="self-start rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                        {tw('adim3.beklemede')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Adım 4 — Pasif */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                4
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {tw('adim4.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5">
                  {tw('adim4.uret')}
                </button>
                <div className="rounded-lg border-2 border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2.5 border-b border-gray-100">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                    </div>
                    <div className="flex-1 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="h-44 flex items-center justify-center bg-white">
                    <p className="text-sm text-gray-300">{tw('adim4.cerceveBos')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adım 5 — Pasif (son adım) */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                5
              </div>
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {tw('adim5.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5">
                  {tw('adim5.uret')}
                </button>
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{tw('adim5.sutun1')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/2">{tw('adim5.sutun2')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{tw('adim5.sutun3')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekS1')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekA1')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekB1')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekS2')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekA2')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekB2')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekS3')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekA3')}</td>
                        <td className="px-4 py-3 text-gray-300">{tw('adim5.ornekB3')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Tamamlayıcı Dokümanlar */}
          <div className="border-t-2 border-dashed border-gray-200 pt-8 mt-2">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base font-semibold text-gray-400">
                {tw('tamamlayici.baslik')}
              </h2>
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                {tw('tamamlayici.etiket')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([tw('tamamlayici.kapsam'), tw('tamamlayici.mimari')] as string[]).map((doc) => (
                <div key={doc} className="rounded-xl border border-gray-100 bg-white p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1.5">{doc}</p>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                      {tw('tamamlayici.durum')}
                    </span>
                  </div>
                  <button disabled className="rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                    {tw('tamamlayici.uret')}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
