'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import DilDegistirici from './DilDegistirici'
import Adim1Formu from './Adim1Formu'
import { ProjeProvider, useProje } from './ProjeContext'

interface HikayeItem {
  no: string
  ad: string
  destan: string
  surum: string
  sprint: string
}

interface SprintPlaniRow {
  sprint: string
  odakAlani: string
  hikayeler: string
  hikayeSayisi: number | string
  sure: string
}

interface GenelOzetRow {
  surum: string
  hikayeSayisi: number | string
  sprintAraligi: string
  sprintSayisi: number | string
  sure: string
}

interface StoryMapData {
  hikayeHaritasi: { destanlar: string[]; hikayeler: HikayeItem[] }
  sprintPlani: SprintPlaniRow[]
  genelOzet: GenelOzetRow[]
}

function hikayelerFiltrele(data: StoryMapData, surum: string, destanAdi: string): HikayeItem[] {
  return data.hikayeHaritasi.hikayeler.filter(h => h.surum === surum && h.destan === destanAdi)
}

async function exportToExcel(data: StoryMapData, projeAdi: string) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const { destanlar, hikayeler } = data.hikayeHaritasi

  // Sheet 1: Hikaye Haritası — satırları veriden türet
  const mevcutSurumler = (['R1', 'R2', 'R3'] as const).filter(s =>
    hikayeler.some(h => h.surum === s)
  )
  const hmRows = [
    ['Sürüm', ...destanlar],
    ...mevcutSurumler.map(s => [
      s,
      ...destanlar.map(d =>
        hikayeler
          .filter(h => h.surum === s && h.destan === d)
          .map(h => `${h.no} · ${h.ad} (${h.sprint})`)
          .join('\n') || ''
      ),
    ]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hmRows), 'Hikaye Haritası')

  // Sheet 2: Sprint Planı — başlıklar data'dan
  if (data.sprintPlani.length > 0) {
    const spHeaders = Object.keys(data.sprintPlani[0])
    const spRows = [spHeaders, ...data.sprintPlani.map(r => Object.values(r).map(v => v ?? ''))]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(spRows), 'Sprint Planı')
  }

  // Sheet 3: Genel Özet — başlıklar data'dan
  if (data.genelOzet.length > 0) {
    const goHeaders = Object.keys(data.genelOzet[0])
    const goRows = [goHeaders, ...data.genelOzet.map(r => Object.values(r).map(v => v ?? ''))]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(goRows), 'Genel Özet')
  }

  const dosyaAdi = `hikaye-haritasi-${projeAdi.toLowerCase().replace(/\s+/g, '-')}.xlsx`
  XLSX.writeFile(wb, dosyaAdi)
}

function ButtonSpinner() {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
  )
}

// Dış bileşen: ProjeProvider sağlar
export default function CalismaEkrani() {
  return (
    <ProjeProvider>
      <EkranIci />
    </ProjeProvider>
  )
}

// İç bileşen: context'i kullanır
function EkranIci() {
  const t = useTranslations('calismaEkrani')
  const ctx = useProje()
  const { projeId, ad, shortDesc, detailedDesc } = ctx
  const [adim2Yukleniyor, setAdim2Yukleniyor] = useState(false)
  const [adim2Hata, setAdim2Hata] = useState(false)

  const storyMapData: StoryMapData | null = ctx.dokuman.storyMap
    ? (JSON.parse(ctx.dokuman.storyMap) as StoryMapData)
    : null

  const adim2Aktif = projeId !== null
  const adim3Aktif = storyMapData !== null

  async function generateStoryMap() {
    if (!detailedDesc) return
    setAdim2Yukleniyor(true)
    setAdim2Hata(false)
    try {
      const res = await fetch('/api/ai/hikaye-haritasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi: ad, detayliAciklama: detailedDesc }),
      })
      const raw = await res.json()
      if (!res.ok) {
        console.error('[generateStoryMap] API hata yanıtı:', raw)
        throw new Error(`HTTP ${res.status}`)
      }
      const { hikayeHaritasi, sprintPlani, genelOzet } = raw
      if (!hikayeHaritasi) {
        console.error('[generateStoryMap] hikayeHaritasi alanı eksik:', raw)
        throw new Error('hikayeHaritasi missing')
      }
      const veri: StoryMapData = {
        hikayeHaritasi: {
          destanlar: hikayeHaritasi.destanlar ?? [],
          hikayeler: hikayeHaritasi.hikayeler ?? [],
        },
        sprintPlani: sprintPlani ?? [],
        genelOzet: genelOzet ?? [],
      }
      ctx.setDokuman('storyMap', JSON.stringify(veri))
    } catch (err) {
      console.error('[generateStoryMap] hata:', err)
      setAdim2Hata(true)
    } finally {
      setAdim2Yukleniyor(false)
    }
  }

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
              <div className={`rounded-xl p-6 ${projeId ? 'bg-white border border-gray-100' : 'bg-[#EEF4FB] border border-blue-100'}`}>
                {projeId ? (
                  // Read-only: proje oluşturulduktan sonra
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">{t('adim1.projeAdi')}</p>
                      <p className="text-sm font-semibold text-gray-800">{ad}</p>
                    </div>
                    {shortDesc && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">{t('adim1.shortDesc')}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{shortDesc}</p>
                      </div>
                    )}
                    {detailedDesc && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">{t('adim1.yzCikti')}</p>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{detailedDesc}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Adim1Formu />
                )}
              </div>
            </div>
          </div>

          {/* ── Adım 2 ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${adim2Aktif ? 'bg-[#1F3864] text-white' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className={`text-base font-semibold mb-4 ${adim2Aktif ? 'text-[#1F3864]' : 'text-gray-400'}`}>
                {t('adim2.baslik')}
              </h2>
              <div className={`rounded-xl p-6 space-y-6 ${adim2Aktif ? 'bg-[#EEF4FB] border border-blue-100' : 'bg-white border border-gray-100'}`}>
                {/* Generate butonu */}
                <div className="flex items-center gap-3">
                  <button
                    disabled={!adim2Aktif || adim2Yukleniyor}
                    onClick={generateStoryMap}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      adim2Aktif && !adim2Yukleniyor
                        ? 'bg-[#1F3864] text-white hover:bg-[#2E75B6]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {adim2Yukleniyor && <ButtonSpinner />}
                    {t('adim2.uret')}
                  </button>
                  {storyMapData && (
                    <button
                      onClick={() => exportToExcel(storyMapData, ad)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F3864] px-3 py-1.5 text-sm font-medium text-[#1F3864] hover:bg-[#EEF4FB] transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t('adim2.exportExcel')}
                    </button>
                  )}
                </div>
                {adim2Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}

                {/* ── Tablo 1: Hikaye Haritası ── */}
                <div className="rounded-lg border border-gray-200 overflow-hidden overflow-x-auto bg-white">
                  {storyMapData ? (
                    <table
                      className="text-sm text-left"
                      style={{ minWidth: `${(storyMapData.hikayeHaritasi.destanlar.length + 1) * 200}px`, width: '100%' }}
                    >
                      <thead className="bg-[#1F3864]">
                        <tr>
                          <th className="px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide w-36 border-r border-white/20">
                            {t('adim2.surum')}
                          </th>
                          {storyMapData.hikayeHaritasi.destanlar.map(d => (
                            <th key={d} className="px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0">
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {// Satırları veriden türet — R1→R2→R3 sırasını koru
                          (['R1', 'R2', 'R3'] as const)
                            .filter(s => storyMapData.hikayeHaritasi.hikayeler.some(h => h.surum === s))
                            .map((surumKey, idx) => (
                              <tr key={surumKey} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                                <td className="px-4 py-3 text-xs font-semibold text-gray-600 border-r border-gray-100 align-top w-36 whitespace-nowrap">
                                  {surumKey}
                                </td>
                                {storyMapData.hikayeHaritasi.destanlar.map(destan => (
                                  <td key={destan} className="px-4 py-3 border-r border-gray-100 align-top min-w-[180px] last:border-r-0">
                                    {hikayelerFiltrele(storyMapData, surumKey, destan).map(h => (
                                      <div key={h.no} className="mb-1 text-xs text-gray-700 leading-relaxed">
                                        <span className="font-semibold text-[#2E75B6]">{h.no}</span>
                                        {' · '}{h.ad}{' '}
                                        <span className="text-gray-400">({h.sprint})</span>
                                      </div>
                                    ))}
                                  </td>
                                ))}
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-300">{t('adim2.tabloBos')}</div>
                  )}
                </div>

                {/* ── Tablo 2: Sprint Planı Özeti ── */}
                {storyMapData && storyMapData.sprintPlani.length > 0 && (() => {
                  const keys = Object.keys(storyMapData.sprintPlani[0])
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F3864] mb-2">{t('adim2.sprintPlanBaslik')}</h3>
                      <div className="rounded-lg border border-gray-200 overflow-hidden overflow-x-auto bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-[#1F3864]">
                            <tr>
                              {keys.map(k => (
                                <th key={k} className="px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {storyMapData.sprintPlani.map((row, idx) => {
                              const vals = Object.values(row)
                              return (
                                <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                                  {vals.map((val, i) => (
                                    <td key={i} className="px-4 py-2.5 text-xs text-gray-700 border-r border-gray-100 last:border-r-0">
                                      {String(val ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}

                {/* ── Tablo 3: Genel Özet ── */}
                {storyMapData && storyMapData.genelOzet.length > 0 && (() => {
                  const keys = Object.keys(storyMapData.genelOzet[0])
                  return (
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F3864] mb-2">{t('adim2.genelOzetBaslik')}</h3>
                      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-[#1F3864]">
                            <tr>
                              {keys.map(k => (
                                <th key={k} className="px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {storyMapData.genelOzet.map((row, idx) => {
                              const vals = Object.values(row)
                              const ilkDeger = String(vals[0] ?? '').toLowerCase()
                              const isToplam = ilkDeger.includes('toplam') || ilkDeger.includes('total')
                              return (
                                <tr key={idx} className={isToplam ? 'bg-gray-50 font-semibold' : idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                                  {vals.map((val, i) => (
                                    <td key={i} className="px-4 py-2.5 text-xs text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                      {String(val ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* ── Adım 3 ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${adim3Aktif ? 'bg-[#1F3864] text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className={`text-base font-semibold mb-4 ${adim3Aktif ? 'text-[#1F3864]' : 'text-gray-400'}`}>{t('adim3.baslik')}</h2>
              <div className={`rounded-xl p-6 ${adim3Aktif ? 'bg-[#EEF4FB] border border-blue-100' : 'bg-white border border-gray-100'}`}>
                <button disabled className={`rounded-lg px-4 py-2 text-sm font-medium mb-5 ${adim3Aktif ? 'bg-[#1F3864] text-white hover:bg-[#2E75B6] cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  {t('adim3.uret')}
                </button>
                <div className="grid grid-cols-3 gap-4">
                  {([t('adim3.r1'), t('adim3.r2'), t('adim3.r3')] as string[]).map((r) => (
                    <div key={r} className="rounded-lg border border-gray-100 p-4 flex flex-col gap-3">
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
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">4</div>
              <div className="w-px flex-1 bg-gray-200 mt-2" />
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">{t('adim4.baslik')}</h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5">
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

          {/* ── Adım 5 — Pasif ── */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold shrink-0">5</div>
            </div>
            <div className="flex-1 pb-10">
              <h2 className="text-base font-semibold text-gray-400 mb-4">{t('adim5.baslik')}</h2>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <button disabled className="rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mb-5">
                  {t('adim5.uret')}
                </button>
                <div className="rounded-lg border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{t('adim5.sutun1')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/2">{t('adim5.sutun2')}</th>
                        <th className="px-4 py-2.5 text-xs font-semibold text-gray-300 uppercase tracking-wide w-1/4">{t('adim5.sutun3')}</th>
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
              <h2 className="text-base font-semibold text-gray-400">{t('tamamlayici.baslik')}</h2>
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                {t('tamamlayici.etiket')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([t('tamamlayici.kapsam'), t('tamamlayici.mimari')] as string[]).map((doc) => (
                <div key={doc} className="rounded-xl border border-gray-100 bg-white p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1.5">{doc}</p>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                      {t('tamamlayici.durum')}
                    </span>
                  </div>
                  <button disabled className="rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
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
