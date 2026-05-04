'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Adim1Formu from './Adim1Formu'
import { ProjeProvider, useProje } from './ProjeContext'
import GenerateButton, { ProgressBar } from './GenerateButton'

interface HikayeItem {
  no: string
  ad: string
  destan: string
  surum: string
  sprint: string
}

type SprintPlaniRow = Record<string, string | number>
type GenelOzetRow = Record<string, string | number>

const ADIM2_MESAJLAR = {
  TR: [
    'Proje açıklaması analiz ediliyor...',
    'Destanlar ve hikayeler belirleniyor...',
    'Sürümler ve sprintler planlanıyor...',
    'Hikaye haritası tamamlanıyor...',
  ],
  EN: [
    'Analyzing project description...',
    'Identifying epics and user stories...',
    'Planning releases and sprints...',
    'Finalizing story map...',
  ],
} as const

interface StoryMapData {
  hikayeHaritasi: { destanlar: string[]; hikayeler: HikayeItem[] }
  sprintPlani: SprintPlaniRow[]
  genelOzet: GenelOzetRow[]
}

function hikayelerFiltrele(data: StoryMapData, surum: string, destanAdi: string): HikayeItem[] {
  return data.hikayeHaritasi.hikayeler.filter(h => h.surum === surum && h.destan === destanAdi)
}

async function exportToExcel(data: StoryMapData, projeAdi: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (await import('xlsx-js-style')) as any
  const wb = XLSX.utils.book_new()

  // ── Sabitler ──────────────────────────────────────────────
  const DARK_BLUE = '1F3864'
  const LIGHT_BLUE = 'D6E4F0'
  const WHITE = 'FFFFFF'
  const SPRINT_PALETTE = ['EEF4FB', 'EAF3DE', 'FFFDE7', 'FFF3E0', 'EDE7F6']

  const THIN_BORDER = {
    top:    { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left:   { style: 'thin', color: { rgb: 'D1D5DB' } },
    right:  { style: 'thin', color: { rgb: 'D1D5DB' } },
  }

  // Sprint → renk haritası (sprintPlani sırasına göre)
  const sprintColorMap = new Map<string, string>()
  data.sprintPlani.forEach(row => {
    const sprint = String(Object.values(row)[0] ?? '')
    if (!sprintColorMap.has(sprint)) {
      sprintColorMap.set(sprint, SPRINT_PALETTE[sprintColorMap.size % SPRINT_PALETTE.length])
    }
  })

  // Yardımcılar
  function c(v: string | number, s: Record<string, unknown> = {}) {
    return { v, t: typeof v === 'number' ? 'n' : 's', s: { border: THIN_BORDER, ...s } }
  }
  function hdr(v: string) {
    return c(v, {
      font: { bold: true, sz: 10, color: { rgb: WHITE } },
      fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isToplam(row: any) {
    const v = String(Object.values(row as Record<string, unknown>)[0] ?? '').toLowerCase()
    return v.includes('toplam') || v.includes('total')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function autoW(keys: string[], rows: any[]) {
    return keys.map((k, ci) => ({
      wch: Math.min(
        Math.ceil(
          Math.max(k.length, ...rows.map(r => String(Object.values(r)[ci] ?? '').length)) * 1.2
        ),
        55
      ),
    }))
  }
  function enc(r: number, c: number) { return XLSX.utils.encode_cell({ r, c }) }

  // ── SHEET 1: Story Map ─────────────────────────────────────
  const { destanlar, hikayeler } = data.hikayeHaritasi
  const surumler = (['R1', 'R2', 'R3'] as const).filter(s => hikayeler.some(h => h.surum === s))
  const numCols = destanlar.length + 1

  const toplamRow = data.genelOzet.find(isToplam)
  const summaryText = toplamRow ? Object.values(toplamRow).slice(1).join(' · ') : ''

  const ws1: Record<string, unknown> = {}
  const m1: unknown[] = []
  const rows1: { hpx: number }[] = []

  // Satır 1: proje adı
  ws1[enc(0, 0)] = c(projeAdi, {
    font: { bold: true, sz: 14, color: { rgb: WHITE } },
    fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } },
    alignment: { horizontal: 'center', vertical: 'center' },
  })
  for (let i = 1; i < numCols; i++) ws1[enc(0, i)] = c('', { fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } } })
  m1.push({ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } })
  rows1.push({ hpx: 40 })

  // Satır 2: özet
  ws1[enc(1, 0)] = c(summaryText, {
    font: { italic: true, sz: 10, color: { rgb: DARK_BLUE } },
    fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } },
    alignment: { horizontal: 'center', vertical: 'center' },
  })
  for (let i = 1; i < numCols; i++) ws1[enc(1, i)] = c('', { fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } } })
  m1.push({ s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } })
  rows1.push({ hpx: 24 })

  // Satır 3: başlıklar
  ws1[enc(2, 0)] = hdr('Version')
  destanlar.forEach((d, i) => { ws1[enc(2, i + 1)] = hdr(d) })
  rows1.push({ hpx: 36 })

  // Veri satırları
  surumler.forEach((surum, si) => {
    const row = 3 + si
    const maxCount = Math.max(1, ...destanlar.map(d =>
      hikayeler.filter(h => h.surum === surum && h.destan === d).length
    ))
    ws1[enc(row, 0)] = c(surum, {
      font: { bold: true, sz: 10, color: { rgb: DARK_BLUE } },
      fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center' },
    })
    destanlar.forEach((destan, di) => {
      const stories = hikayeler.filter(h => h.surum === surum && h.destan === destan)
      const text = stories.map(h => `${h.no} · ${h.ad} (${h.sprint})`).join('\n')
      const bg = stories.length > 0 ? (sprintColorMap.get(stories[0].sprint) ?? WHITE) : WHITE
      ws1[enc(row, di + 1)] = c(text, {
        font: { sz: 9, color: { rgb: '374151' } },
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        alignment: { vertical: 'top', wrapText: true },
      })
    })
    rows1.push({ hpx: Math.max(30, maxCount * 18) })
  })

  ws1['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 2 + surumler.length, c: numCols - 1 } })
  ws1['!merges'] = m1
  ws1['!cols']   = [{ wch: 12 }, ...destanlar.map(() => ({ wch: 28 }))]
  ws1['!rows']   = rows1
  ws1['!views']  = [{ state: 'frozen', ySplit: 3 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Story Map')

  // ── SHEET 2: Sprint Plan ───────────────────────────────────
  if (data.sprintPlani.length > 0) {
    const sp = data.sprintPlani
    const spKeys = Object.keys(sp[0])
    const nSp = spKeys.length
    const ws2: Record<string, unknown> = {}
    const m2: unknown[] = []
    const rows2: { hpx: number }[] = [{ hpx: 32 }, { hpx: 32 }]

    ws2[enc(0, 0)] = c('Sprint Plan', {
      font: { bold: true, sz: 12, color: { rgb: WHITE } },
      fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center' },
    })
    for (let i = 1; i < nSp; i++) ws2[enc(0, i)] = c('', { fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } } })
    m2.push({ s: { r: 0, c: 0 }, e: { r: 0, c: nSp - 1 } })

    spKeys.forEach((k, i) => { ws2[enc(1, i)] = hdr(k) })

    sp.forEach((row, ri) => {
      const r = 2 + ri
      const vals = Object.values(row)
      const sprint = String(vals[0] ?? '')
      const isTotal = isToplam(row)
      const bg = sprintColorMap.get(sprint) ?? WHITE
      vals.forEach((v, ci) => {
        ws2[enc(r, ci)] = c(String(v ?? ''), isTotal
          ? { font: { bold: true, sz: 10, color: { rgb: DARK_BLUE } }, fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } } }
          : {
              font: { sz: 10, color: { rgb: '374151' } },
              fill: { patternType: 'solid', fgColor: { rgb: ci === 0 ? bg : WHITE } },
              alignment: { vertical: 'top', wrapText: ci === 1 || ci === 2 },
            })
      })
      rows2.push({ hpx: 24 })
    })

    ws2['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 1 + sp.length, c: nSp - 1 } })
    ws2['!merges'] = m2
    ws2['!cols']   = autoW(spKeys, sp as unknown as Record<string, unknown>[])
    ws2['!rows']   = rows2
    ws2['!views']  = [{ state: 'frozen', ySplit: 2 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Sprint Plan')
  }

  // ── SHEET 3: General Summary ───────────────────────────────
  if (data.genelOzet.length > 0) {
    const go = data.genelOzet
    const goKeys = Object.keys(go[0])
    const nGo = goKeys.length
    const ws3: Record<string, unknown> = {}
    const m3: unknown[] = []
    const rows3: { hpx: number }[] = [{ hpx: 32 }, { hpx: 32 }]

    ws3[enc(0, 0)] = c('General Summary', {
      font: { bold: true, sz: 12, color: { rgb: WHITE } },
      fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center' },
    })
    for (let i = 1; i < nGo; i++) ws3[enc(0, i)] = c('', { fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } } })
    m3.push({ s: { r: 0, c: 0 }, e: { r: 0, c: nGo - 1 } })

    goKeys.forEach((k, i) => { ws3[enc(1, i)] = hdr(k) })

    go.forEach((row, ri) => {
      const r = 2 + ri
      const vals = Object.values(row)
      const isTotal = isToplam(row)
      vals.forEach((v, ci) => {
        ws3[enc(r, ci)] = c(String(v ?? ''), isTotal
          ? { font: { bold: true, sz: 10, color: { rgb: DARK_BLUE } }, fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } } }
          : {
              font: { sz: 10, color: { rgb: '374151' } },
              fill: { patternType: 'solid', fgColor: { rgb: WHITE } },
              alignment: { horizontal: ci > 0 ? 'center' : 'left', vertical: 'center' },
            })
      })
      rows3.push({ hpx: 24 })
    })

    ws3['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 1 + go.length, c: nGo - 1 } })
    ws3['!merges'] = m3
    ws3['!cols']   = autoW(goKeys, go as unknown as Record<string, unknown>[])
    ws3['!rows']   = rows3
    ws3['!views']  = [{ state: 'frozen', ySplit: 2 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'General Summary')
  }

  XLSX.writeFile(wb, `story-map-${projeAdi.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
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
  const { projeId, ad, shortDesc, detailedDesc, projektDili } = ctx
  const [adim2Yukleniyor, setAdim2Yukleniyor] = useState(false)
  const [adim2Hata, setAdim2Hata] = useState(false)
  const [adim2MesajIdx, setAdim2MesajIdx] = useState(0)
  const adim2IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [adim3Yukleniyor, setAdim3Yukleniyor] = useState(false)
  const [adim3Hata, setAdim3Hata] = useState(false)
  const [adim4Yukleniyor, setAdim4Yukleniyor] = useState(false)
  const [adim4Hata, setAdim4Hata] = useState(false)
  const [adim5Yukleniyor, setAdim5Yukleniyor] = useState(false)
  const [adim5Hata, setAdim5Hata] = useState(false)
  const [kapsamYukleniyor, setKapsamYukleniyor] = useState(false)
  const [kapsamHata, setKapsamHata] = useState(false)
  const [mimariYukleniyor, setMimariYukleniyor] = useState(false)
  const [mimariHata, setMimariHata] = useState(false)

  const storyMapData: StoryMapData | null = ctx.dokuman.storyMap
    ? (JSON.parse(ctx.dokuman.storyMap) as StoryMapData)
    : null

  const adim2Aktif = projeId !== null
  const adim3Aktif = storyMapData !== null

  async function generateStoryMap() {
    if (!detailedDesc) return
    setAdim2Yukleniyor(true)
    setAdim2Hata(false)
    setAdim2MesajIdx(0)

    let idx = 0
    adim2IntervalRef.current = setInterval(() => {
      idx += 1
      if (idx <= 3) setAdim2MesajIdx(idx)
      if (idx >= 3 && adim2IntervalRef.current) {
        clearInterval(adim2IntervalRef.current)
        adim2IntervalRef.current = null
      }
    }, 3000)

    try {
      const res = await fetch('/api/ai/hikaye-haritasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi: ad, detayliAciklama: detailedDesc, projeDili: projektDili }),
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
      if (adim2IntervalRef.current) {
        clearInterval(adim2IntervalRef.current)
        adim2IntervalRef.current = null
      }
      setAdim2Yukleniyor(false)
    }
  }

  async function generateDocuments() {
    setAdim3Yukleniyor(true)
    setAdim3Hata(false)
    try {
      // TODO: /api/ai/is-analizi endpoint'i eklendiğinde buraya gelecek
      await new Promise(r => setTimeout(r, 500))
    } catch {
      setAdim3Hata(true)
    } finally {
      setAdim3Yukleniyor(false)
    }
  }

  async function generatePrototype() {
    setAdim4Yukleniyor(true)
    setAdim4Hata(false)
    try {
      // TODO: /api/ai/prototip endpoint'i eklendiğinde buraya gelecek
      await new Promise(r => setTimeout(r, 500))
    } catch {
      setAdim4Hata(true)
    } finally {
      setAdim4Yukleniyor(false)
    }
  }

  async function generateTestScenarios() {
    setAdim5Yukleniyor(true)
    setAdim5Hata(false)
    try {
      // TODO: /api/ai/test-senaryosu endpoint'i eklendiğinde buraya gelecek
      await new Promise(r => setTimeout(r, 500))
    } catch {
      setAdim5Hata(true)
    } finally {
      setAdim5Yukleniyor(false)
    }
  }

  async function generateKapsam() {
    setKapsamYukleniyor(true)
    setKapsamHata(false)
    try {
      // TODO: /api/ai/kapsam endpoint'i eklendiğinde buraya gelecek
      await new Promise(r => setTimeout(r, 500))
    } catch {
      setKapsamHata(true)
    } finally {
      setKapsamYukleniyor(false)
    }
  }

  async function generateMimari() {
    setMimariYukleniyor(true)
    setMimariHata(false)
    try {
      // TODO: /api/ai/mimari endpoint'i eklendiğinde buraya gelecek
      await new Promise(r => setTimeout(r, 500))
    } catch {
      setMimariHata(true)
    } finally {
      setMimariYukleniyor(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">

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
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <GenerateButton
                      label={t('adim2.uret')}
                      loadingLabel={(ADIM2_MESAJLAR[projektDili === 'TR' ? 'TR' : 'EN'])[adim2MesajIdx]}
                      regenerateLabel={t('yenidenOlustur')}
                      disabled={!adim2Aktif}
                      loading={adim2Yukleniyor}
                      hasContent={storyMapData !== null}
                      onClick={generateStoryMap}
                    />
                  {storyMapData && (
                    <button
                      onClick={() => exportToExcel(storyMapData, ad)}
                      className="inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB] transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t('adim2.exportExcel')}
                    </button>
                  )}
                  </div>
                  {adim2Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}
                </div>

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
                            {storyMapData.genelOzet[0]
                              ? Object.keys(storyMapData.genelOzet[0])[0]
                              : (projektDili === 'TR' ? 'Sürüm' : 'Release')}
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
                <div className="space-y-2 mb-5">
                  <GenerateButton
                    label={t('adim3.uret')}
                    loadingLabel={t('adim3.olusturuluyor')}
                    regenerateLabel={t('yenidenOlustur')}
                    disabled={!adim3Aktif}
                    loading={adim3Yukleniyor}
                    hasContent={false}
                    onClick={generateDocuments}
                  />
                  {adim3Yukleniyor && <ProgressBar />}
                  {adim3Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}
                </div>
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
                <div className="space-y-2 mb-5">
                  <GenerateButton
                    label={t('adim4.uret')}
                    loadingLabel={t('adim4.olusturuluyor')}
                    regenerateLabel={t('yenidenOlustur')}
                    disabled={!adim3Aktif}
                    loading={adim4Yukleniyor}
                    hasContent={false}
                    onClick={generatePrototype}
                  />
                  {adim4Yukleniyor && <ProgressBar />}
                  {adim4Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}
                </div>
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
                <div className="space-y-2 mb-5">
                  <GenerateButton
                    label={t('adim5.uret')}
                    loadingLabel={t('adim5.olusturuluyor')}
                    regenerateLabel={t('yenidenOlustur')}
                    disabled={!adim3Aktif}
                    loading={adim5Yukleniyor}
                    hasContent={false}
                    onClick={generateTestScenarios}
                  />
                  {adim5Yukleniyor && <ProgressBar />}
                  {adim5Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}
                </div>
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
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('tamamlayici.kapsam')}</p>
                    <span className="rounded-full bg-[#F1EFE8] px-2.5 py-0.5 text-xs text-[#444441]">
                      {t('tamamlayici.durum')}
                    </span>
                  </div>
                  <GenerateButton
                    label={t('tamamlayici.uret')}
                    loadingLabel={t('tamamlayici.kapsamOlusturuluyor')}
                    regenerateLabel={t('yenidenOlustur')}
                    disabled={!adim2Aktif}
                    loading={kapsamYukleniyor}
                    hasContent={false}
                    onClick={generateKapsam}
                  />
                </div>
                {kapsamYukleniyor && <ProgressBar />}
                {kapsamHata && <p className="text-xs text-red-500 mt-1">{t('adim1.hatalar.genel')}</p>}
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('tamamlayici.mimari')}</p>
                    <span className="rounded-full bg-[#F1EFE8] px-2.5 py-0.5 text-xs text-[#444441]">
                      {t('tamamlayici.durum')}
                    </span>
                  </div>
                  <GenerateButton
                    label={t('tamamlayici.uret')}
                    loadingLabel={t('tamamlayici.mimariOlusturuluyor')}
                    regenerateLabel={t('yenidenOlustur')}
                    disabled={!adim2Aktif}
                    loading={mimariYukleniyor}
                    hasContent={false}
                    onClick={generateMimari}
                  />
                </div>
                {mimariYukleniyor && <ProgressBar />}
                {mimariHata && <p className="text-xs text-red-500 mt-1">{t('adim1.hatalar.genel')}</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
