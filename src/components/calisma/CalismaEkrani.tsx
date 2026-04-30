'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import DilDegistirici from './DilDegistirici'
import Adim1Formu from './Adim1Formu'

interface ProjeState {
  id: string
  ad: string
  aciklama: string | null
}

export default function CalismaEkrani() {
  const t = useTranslations('calismaEkrani')
  const locale = useLocale()
  const [proje, setProje] = useState<ProjeState | null>(null)

  function handleProjeOlusturuldu(id: string, ad: string, aciklama: string | null) {
    setProje({ id, ad, aciklama })
    const route =
      locale === 'en'
        ? `/${locale}/projects/${id}`
        : `/${locale}/projeler/${id}`
    window.history.replaceState(null, '', route)
  }

  const adim2Aktif = proje !== null

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">

        <div className="flex justify-end mb-10">
          <DilDegistirici />
        </div>

        <div>

          {/* ── Adım 1 ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#1F3864] text-white flex items-center justify-center text-sm font-bold shrink-0">
                1
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-[#1F3864] mb-4">
                {t('adim1.baslik')}
              </h2>
              <div
                className={`rounded-xl p-6 ${
                  proje
                    ? 'bg-white border border-gray-100'
                    : 'bg-[#EEF4FB] border border-blue-100'
                }`}
              >
                {proje ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">
                        {t('adim1.projeAdi')}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{proje.ad}</p>
                    </div>
                    {proje.aciklama && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">
                          {t('adim1.aciklama')}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {proje.aciklama}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Adim1Formu onSuccess={handleProjeOlusturuldu} />
                )}
              </div>
            </div>
          </div>

          {/* ── Adım 2 ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  adim2Aktif
                    ? 'bg-[#1F3864] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                2
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2
                className={`text-base font-semibold mb-4 ${
                  adim2Aktif ? 'text-[#1F3864]' : 'text-gray-400'
                }`}
              >
                {t('adim2.baslik')}
              </h2>
              <div
                className={`rounded-xl p-6 ${
                  adim2Aktif
                    ? 'bg-[#EEF4FB] border border-blue-100'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <button
                  disabled={!adim2Aktif}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    adim2Aktif
                      ? 'bg-[#1F3864] text-white hover:bg-[#2E75B6]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('adim2.uret')}
                </button>
                <div className="mt-5 rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">
                          {t('adim2.sutun1')}
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/2">
                          {t('adim2.sutun2')}
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">
                          {t('adim2.sutun3')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-300">
                          {t('adim2.tabloBos')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ── Adım 3 — Pasif ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {t('adim3.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button
                  disabled
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5"
                >
                  {t('adim3.uret')}
                </button>
                <div className="grid grid-cols-3 gap-4">
                  {([t('adim3.r1'), t('adim3.r2'), t('adim3.r3')] as string[]).map((r) => (
                    <div
                      key={r}
                      className="rounded-lg border border-gray-100 p-4 flex flex-col gap-3"
                    >
                      <p className="text-sm font-semibold text-gray-300">{r}</p>
                      <span className="self-start rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                        {t('adim3.beklemede')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Adım 4 — Pasif ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                4
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {t('adim4.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button
                  disabled
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5"
                >
                  {t('adim4.uret')}
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
                    <p className="text-sm text-gray-300">{t('adim4.cerceveBos')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Adım 5 — Pasif (son adım, bağlantı çizgisi yok) ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">
                5
              </div>
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">
                {t('adim5.baslik')}
              </h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button
                  disabled
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5"
                >
                  {t('adim5.uret')}
                </button>
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">
                          {t('adim5.sutun1')}
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/2">
                          {t('adim5.sutun2')}
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">
                          {t('adim5.sutun3')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekS1')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekA1')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekB1')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekS2')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekA2')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekB2')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekS3')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekA3')}</td>
                        <td className="px-4 py-3 text-gray-300">{t('adim5.ornekB3')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tamamlayıcı Dokümanlar ── */}
          <div className="border-t-2 border-dashed border-gray-200 pt-8 mt-2">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base font-semibold text-gray-400">
                {t('tamamlayici.baslik')}
              </h2>
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                {t('tamamlayici.etiket')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([t('tamamlayici.kapsam'), t('tamamlayici.mimari')] as string[]).map((doc) => (
                <div
                  key={doc}
                  className="rounded-xl border border-gray-100 bg-white p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1.5">{doc}</p>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                      {t('tamamlayici.durum')}
                    </span>
                  </div>
                  <button
                    disabled
                    className="rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    {t('tamamlayici.uret')}
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
