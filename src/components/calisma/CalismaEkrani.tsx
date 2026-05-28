'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Adim1Formu from './Adim1Formu'
import { ProjeProvider, useProje, type InitialProje } from './ProjeContext'
import GenerateButton, { ProgressBar } from './GenerateButton'
import MarkdownGoster from '@/components/MarkdownGoster'
import { createClient } from '@/lib/supabase/client'
import { DOKUMAN_TIPLERI } from '@/lib/dokuman-tipleri'
import type { PlanBilgisi } from '@/lib/abonelik'
import { planIzinVeriyor } from '@/lib/abonelik'
import StepRail, { StepCard, BackgroundBanner, type StepState } from './StepRail'

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

// Adım 3 artık 5 bölümlük üretim yapıyor: bolum1 → R1 → R2 → R3 → bolum345
// Mesajlar hangi bölümde olduğumuza göre değişir. Mesaj sırası kodda
// üretilen bolumler dizisiyle aynı olmalı.
const ADIM3_MESAJLAR = {
  TR: [
    'Doküman başlığı ve genel bilgiler hazırlanıyor... (1/5)',
    'R1 — MVP analiz ediliyor... (2/5)',
    'R2 — İyileştirme analiz ediliyor... (3/5)',
    'R3 — Gelişmiş analiz ediliyor... (4/5)',
    'Sistem gereksinimleri ve etki analizi hazırlanıyor... (5/5)',
  ],
  EN: [
    'Generating header and general information... (1/5)',
    'Analyzing R1 — MVP... (2/5)',
    'Analyzing R2 — Enhancement... (3/5)',
    'Analyzing R3 — Advanced... (4/5)',
    'Generating system requirements and impact analysis... (5/5)',
  ],
} as const

const ADIM4_MESAJLAR = {
  TR: [
    'Hikayeler analiz ediliyor...',
    'Ekranlar tasarlanıyor...',
    'Navigasyon oluşturuluyor...',
    'Prototip tamamlanıyor...',
  ],
  EN: [
    'Analyzing stories...',
    'Designing screens...',
    'Building navigation...',
    'Finalizing prototype...',
  ],
} as const

// is-analizi API stream'in sonuna gömdüğü metadata marker'ı.
const META_MARKER_RE = /\n?<!--\s*META\s*(\{[\s\S]*?\})\s*-->\n?/g
const TRUNCATED_MARKER_RE = /\n?<!--\s*TRUNCATED\s*-->\n?/g

function stripStreamMarkers(s: string): string {
  return s.replace(META_MARKER_RE, '').replace(TRUNCATED_MARKER_RE, '')
}

function parseMetaFromChunk(chunk: string): { sonAC?: number; sonBR?: number; finishReason?: string } | null {
  const m = chunk.match(/<!--\s*META\s*(\{[\s\S]*?\})\s*-->/)
  if (!m) return null
  try {
    return JSON.parse(m[1])
  } catch {
    return null
  }
}

function parsePositiveAcler(icerik: string): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  const lines = icerik.split('\n')
  let currentStory: string | null = null

  for (const line of lines) {
    const headingMatch =
      line.match(/^#{1,6}\s+.*?\b(ST\d+)\b/) ??
      line.match(/^\*{1,2}(ST\d+)(?:\s|[*:\-—]|$)/) ??
      line.match(/^(ST\d+)[:\s—\-|]/)
    if (headingMatch) currentStory = headingMatch[1]

    const acM = line.match(/\bAC[-–]?(\d+)\s*(?:\\?\[)?([PNSBpnsb])(?:\\?\])?\s*[:\s]+(.+)/)
    if (currentStory && acM && acM[2].toUpperCase() === 'P') {
      const text = acM[3].replace(/\|.*$/, '').trim()
      if (text.length > 5) {
        if (!result[currentStory]) result[currentStory] = []
        result[currentStory].push(text)
      }
    }
  }

  return result
}

function parseAllAcler(icerik: string): Array<{ hikayeNo: string; no: string; tip: string; metin: string }> {
  const result: Array<{ hikayeNo: string; no: string; tip: string; metin: string }> = []
  const TIP_MAP: Record<string, string> = { P: 'positive', N: 'negative', S: 'security', B: 'boundary' }
  let currentStory: string | null = null

  for (const line of icerik.split('\n')) {
    const heading =
      line.match(/^#{1,6}\s+.*?\b(ST\d+)\b/) ??
      line.match(/^\*{1,2}(ST\d+)(?:\s|[*:\-—]|$)/) ??
      line.match(/^(ST\d+)[:\s—\-|]/)
    if (heading) currentStory = heading[1]
    if (!currentStory) continue

    const ac = line.match(/\bAC[-–]?(\d+)\s*(?:\\?\[)?([PNSBpnsb])(?:\\?\])?\s*[:\s]+(.+)/)
    if (ac) {
      result.push({
        hikayeNo: currentStory,
        no: `AC-${String(ac[1]).padStart(3, '0')}`,
        tip: TIP_MAP[ac[2].toUpperCase()] ?? 'positive',
        metin: ac[3].replace(/\|.*$/, '').trim(),
      })
    }
  }
  return result
}

interface IsAnaliziData {
  baslik: string
  tarih: string
  versiyon: string
  icerik: string
}

interface TestCaseItem {
  no: string; ac_no: string; ac_metni: string; ac_tip: string; release: string
  test_on_kosul: string; test_adimlar: string[]; beklenen_sonuc: string; durum: string
}

interface StoryMapData {
  hikayeHaritasi: { destanlar: string[]; hikayeler: HikayeItem[] }
  sprintPlani: SprintPlaniRow[]
  genelOzet: GenelOzetRow[]
}

function hikayelerFiltrele(data: StoryMapData, surum: string, destanAdi: string): HikayeItem[] {
  return (data.hikayeHaritasi?.hikayeler ?? []).filter(h => h.surum === surum && h.destan === destanAdi)
}

function formatSurum(surum: string): string {
  if (surum === 'R1') return 'R1 — MVP'
  if (surum === 'R2') return 'R2 — Enhancement'
  if (surum === 'R3') return 'R3 — Advanced'
  return surum
}

function formatSure(saniye: number, dil: string): string {
  if (saniye < 60) return dil === 'TR' ? `${saniye} san.` : `${saniye} sec`
  const dak = Math.floor(saniye / 60)
  const san = saniye % 60
  return dil === 'TR' ? `${dak} dak. ${san} san.` : `${dak} min ${san} sec`
}

// showScreen içeren tüm script kopyalarını siler, sona tek temiz kopya ekler.
function deduplicateNavScript(html: string): string {
  const CANONICAL = `<script>
(function(){
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(function(s){s.style.display='none';});
    var el=document.getElementById(id);if(el)el.style.display='block';
    document.querySelectorAll('[data-screen]').forEach(function(n){n.classList.remove('active');});
    var nav=document.querySelector('[data-screen="'+id+'"]');if(nav)nav.classList.add('active');
  }
  window.showScreen=showScreen;
  document.addEventListener('DOMContentLoaded',function(){
    var screens=document.querySelectorAll('.screen');
    screens.forEach(function(s){s.style.display='none';});
    if(screens.length>0){
      var first=screens[0];first.style.display='block';
      var n=document.querySelector('[data-screen="'+first.id+'"]');if(n)n.classList.add('active');
    }
    document.querySelectorAll('[data-screen]').forEach(function(nav){
      nav.addEventListener('click',function(e){
        e.preventDefault();
        var sid=nav.getAttribute('data-screen');
        if(sid){showScreen(sid);var sb=document.querySelector('.sidebar');if(sb)sb.classList.remove('open');}
      });
    });
    var ham=document.querySelector('.hamburger');
    if(ham){ham.addEventListener('click',function(){var sb=document.querySelector('.sidebar');if(sb)sb.classList.toggle('open');});}
  });
})();
</script>`
  const stripped = html.replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?showScreen(?:(?!<\/script>)[\s\S])*<\/script>/gi, '')
  if (stripped.includes('</body>')) return stripped.replace('</body>', CANONICAL + '\n</body>')
  return stripped + '\n' + CANONICAL
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
  const destanlar = data.hikayeHaritasi?.destanlar ?? []
  const hikayeler = data.hikayeHaritasi?.hikayeler ?? []
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
    ws1[enc(row, 0)] = c(formatSurum(surum), {
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

  // ── Abbreviations table ───────────────────────────────────
  const abbrevOffset = 3 + surumler.length
  const ABBREV_BORDER = {
    top:    { style: 'thin', color: { rgb: 'E5E5E5' } },
    bottom: { style: 'thin', color: { rgb: 'E5E5E5' } },
    left:   { style: 'thin', color: { rgb: 'E5E5E5' } },
    right:  { style: 'thin', color: { rgb: 'E5E5E5' } },
  }
  rows1.push({ hpx: 16 }) // empty separator

  ws1[enc(abbrevOffset + 1, 0)] = c('Abbreviations', {
    border: ABBREV_BORDER,
    font: { bold: true, sz: 10, color: { rgb: '444441' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F1EFE8' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  })
  for (let i = 1; i < numCols; i++) ws1[enc(abbrevOffset + 1, i)] = { v: '', t: 's', s: { fill: { patternType: 'solid', fgColor: { rgb: 'F1EFE8' } } } }
  m1.push({ s: { r: abbrevOffset + 1, c: 0 }, e: { r: abbrevOffset + 1, c: numCols - 1 } })
  rows1.push({ hpx: 24 })

  const abbrevHdrStyle = { border: ABBREV_BORDER, font: { bold: true, sz: 9, color: { rgb: '666663' } }, fill: { patternType: 'solid', fgColor: { rgb: 'F9F9F9' } }, alignment: { horizontal: 'left', vertical: 'center' } }
  ws1[enc(abbrevOffset + 2, 0)] = c('Abbreviation', abbrevHdrStyle)
  ws1[enc(abbrevOffset + 2, 1)] = c('Full Name', abbrevHdrStyle)
  ws1[enc(abbrevOffset + 2, 2)] = c('Example', abbrevHdrStyle)
  for (let i = 3; i < numCols; i++) ws1[enc(abbrevOffset + 2, i)] = { v: '', t: 's', s: {} }
  rows1.push({ hpx: 20 })

  const abbrevData = [
    ['ST', 'Story', 'ST1, ST2'],
    ['SP', 'Sprint', 'SP1, SP2'],
    ['R', 'Release', 'R1, R2, R3'],
  ] as const
  const abbrevCellStyle = { border: ABBREV_BORDER, font: { italic: true, sz: 9, color: { rgb: '9CA3AF' } }, fill: { patternType: 'solid', fgColor: { rgb: WHITE } } }
  abbrevData.forEach(([code, name, example], ai) => {
    const r = abbrevOffset + 3 + ai
    ws1[enc(r, 0)] = c(code, abbrevCellStyle)
    ws1[enc(r, 1)] = c(name, abbrevCellStyle)
    ws1[enc(r, 2)] = c(example, abbrevCellStyle)
    for (let i = 3; i < numCols; i++) ws1[enc(r, i)] = { v: '', t: 's', s: {} }
    rows1.push({ hpx: 18 })
  })

  const footerRow1 = abbrevOffset + 3 + abbrevData.length + 1
  ws1[enc(footerRow1, 0)] = { v: 'Created with KurgemX • kurgemx.com', t: 's', s: { font: { italic: true, sz: 8, color: { rgb: '9CA3AF' } }, alignment: { horizontal: 'left', vertical: 'center' } } }
  m1.push({ s: { r: footerRow1, c: 0 }, e: { r: footerRow1, c: numCols - 1 } })
  rows1.push({ hpx: 12 })
  rows1.push({ hpx: 14 })
  ws1['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow1, c: numCols - 1 } })
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

    const footerRow2 = 3 + sp.length
    ws2[enc(footerRow2, 0)] = { v: 'Created with KurgemX • kurgemx.com', t: 's', s: { font: { italic: true, sz: 8, color: { rgb: '9CA3AF' } }, alignment: { horizontal: 'left', vertical: 'center' } } }
    m2.push({ s: { r: footerRow2, c: 0 }, e: { r: footerRow2, c: nSp - 1 } })
    rows2.push({ hpx: 16 })
    rows2.push({ hpx: 14 })
    ws2['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow2, c: nSp - 1 } })
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

    const footerRow3 = 3 + go.length
    ws3[enc(footerRow3, 0)] = { v: 'Created with KurgemX • kurgemx.com', t: 's', s: { font: { italic: true, sz: 8, color: { rgb: '9CA3AF' } }, alignment: { horizontal: 'left', vertical: 'center' } } }
    m3.push({ s: { r: footerRow3, c: 0 }, e: { r: footerRow3, c: nGo - 1 } })
    rows3.push({ hpx: 16 })
    rows3.push({ hpx: 14 })
    ws3['!ref']    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow3, c: nGo - 1 } })
    ws3['!merges'] = m3
    ws3['!cols']   = autoW(goKeys, go as unknown as Record<string, unknown>[])
    ws3['!rows']   = rows3
    ws3['!views']  = [{ state: 'frozen', ySplit: 2 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'General Summary')
  }

  XLSX.writeFile(wb, `story-map-${projeAdi.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
}

async function exportTestExcel(testCases: TestCaseItem[], projeAdi: string, projektDili: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (await import('xlsx-js-style')) as any
  const wb = XLSX.utils.book_new()
  const isTR = projektDili === 'TR'

  const DARK_BLUE = '1F3864'
  const LIGHT_BLUE = 'D6E4F0'
  const WHITE = 'FFFFFF'
  const THIN = { top: { style: 'thin', color: { rgb: 'D1D5DB' } }, bottom: { style: 'thin', color: { rgb: 'D1D5DB' } }, left: { style: 'thin', color: { rgb: 'D1D5DB' } }, right: { style: 'thin', color: { rgb: 'D1D5DB' } } }

  function enc(r: number, c: number) { return XLSX.utils.encode_cell({ r, c }) }
  function cell(v: string, s: Record<string, unknown> = {}) {
    return { v, t: 's', s: { border: THIN, ...s } }
  }
  function hdr(v: string) {
    return cell(v, { font: { bold: true, sz: 10, color: { rgb: WHITE } }, fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } })
  }

  const today = new Date().toISOString().split('T')[0]
  const NUM_COLS = 9
  const ws: Record<string, unknown> = {}
  const merges: unknown[] = []
  const rows: { hpx: number }[] = []

  // Row 0: title + prepared by
  const title = isTR ? `${projeAdi} — Test Senaryoları` : `${projeAdi} — Test Scenarios`
  const prepBy = isTR ? 'Hazırlayan: KurgemX' : 'Prepared by: KurgemX'
  ws[enc(0, 0)] = cell(title, { font: { bold: true, sz: 12, color: { rgb: WHITE } }, fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } }, alignment: { horizontal: 'left', vertical: 'center' } })
  for (let i = 1; i < NUM_COLS - 1; i++) ws[enc(0, i)] = cell('', { fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } } })
  ws[enc(0, NUM_COLS - 1)] = cell(prepBy, { font: { sz: 10, color: { rgb: WHITE } }, fill: { patternType: 'solid', fgColor: { rgb: DARK_BLUE } }, alignment: { horizontal: 'right', vertical: 'center' } })
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: NUM_COLS - 2 } })
  rows.push({ hpx: 36 })

  // Row 1: placeholder — dateLine yazılacak ama TC sayısı data'dan sonra hesaplanacak
  rows.push({ hpx: 22 })
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: NUM_COLS - 1 } })

  // Row 2: abbreviations
  const abbrev = isTR
    ? 'Kısaltmalar: TC — Test Senaryosu  |  AC — Kabul Kriteri  |  ST — Hikaye  |  R — Sürüm'
    : 'Abbreviations: TC — Test Case  |  AC — Acceptance Criteria  |  ST — Story  |  R — Release'
  ws[enc(2, 0)] = cell(abbrev, { font: { italic: true, sz: 9, color: { rgb: '6B7280' } }, fill: { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } }, alignment: { horizontal: 'left', vertical: 'center' } })
  for (let i = 1; i < NUM_COLS; i++) ws[enc(2, i)] = cell('', { fill: { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } } })
  rows.push({ hpx: 20 })

  // Row 3: empty
  rows.push({ hpx: 10 })

  // Row 4: headers
  const colKeys = isTR
    ? ['TC No', 'Sürüm', 'AC No', 'AC Metni', 'AC Tip', 'Test Ön Koşul', 'Test Adımları', 'Beklenen Sonuç', 'Durum']
    : ['TC No', 'Release', 'AC No', 'AC Description', 'AC Type', 'Precondition', 'Test Steps', 'Expected Result', 'Status']
  colKeys.forEach((k, i) => { ws[enc(4, i)] = hdr(k) })
  rows.push({ hpx: 32 })

  // Rows 5+: data — önce yaz, sonra say
  let writtenCount = 0
  testCases.forEach((tc, ri) => {
    const r = 5 + ri
    const adimlarText = Array.isArray(tc.test_adimlar) ? tc.test_adimlar.join('\n') : String(tc.test_adimlar ?? '')
    const vals = [tc.no, tc.release, tc.ac_no, tc.ac_metni, tc.ac_tip, tc.test_on_kosul, adimlarText, tc.beklenen_sonuc, tc.durum]
    vals.forEach((v, ci) => {
      ws[enc(r, ci)] = cell(String(v ?? ''), { font: { sz: 9, color: { rgb: '374151' } }, alignment: { vertical: 'top', wrapText: true } })
    })
    rows.push({ hpx: Math.max(20, adimlarText.split('\n').length * 16) })
    writtenCount++
  })

  // Row 1: dateLine — gerçek yazılan satır sayısıyla doldur
  const dateLine = isTR ? `Tarih: ${today}  |  Toplam TC: ${writtenCount}` : `Date: ${today}  |  Total TC: ${writtenCount}`
  ws[enc(1, 0)] = cell(dateLine, { font: { italic: true, sz: 10, color: { rgb: DARK_BLUE } }, fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } }, alignment: { horizontal: 'left', vertical: 'center' } })
  for (let i = 1; i < NUM_COLS; i++) ws[enc(1, i)] = cell('', { fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } } })

  const footerRow = 5 + writtenCount
  ws[enc(footerRow, 0)] = { v: 'Created with KurgemX • kurgemx.com', t: 's', s: { font: { italic: true, sz: 8, color: { rgb: '9CA3AF' } } } }
  merges.push({ s: { r: footerRow, c: 0 }, e: { r: footerRow, c: NUM_COLS - 1 } })
  rows.push({ hpx: 14 })

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: footerRow, c: NUM_COLS - 1 } }) // footerRow = 5 + writtenCount
  ws['!merges'] = merges
  ws['!rows'] = rows
  ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 35 }, { wch: 10 }, { wch: 25 }, { wch: 40 }, { wch: 30 }, { wch: 10 }]
  ws['!views'] = [{ state: 'frozen', ySplit: 5 }]
  XLSX.utils.book_append_sheet(wb, ws, isTR ? 'Test Senaryoları' : 'Test Scenarios')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-senaryosu-${projeAdi.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').slice(0, 50)}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


type DokumanRow = { tip_id: string; icerik: unknown; created_at: string; uretim_suresi?: number | null; token_tahmini?: number | null }
type BatchDetay = { toplamSure: number; toplamToken: number; batches: Array<{ ekranlar: string[]; sure: number; token: number }> }

// Dış bileşen: ProjeProvider sağlar
export default function CalismaEkrani({
  initialProje,
  backHref,
  backLabel,
  mevcutDokumanlar = [],
  initialPlan,
}: {
  initialProje?: InitialProje
  backHref?: string
  backLabel?: string
  mevcutDokumanlar?: DokumanRow[]
  initialPlan?: PlanBilgisi
} = {}) {
  const storyMapRow = mevcutDokumanlar.find(d => d.tip_id === DOKUMAN_TIPLERI.hikaye_haritasi) ?? null
  const isAnaliziRow = mevcutDokumanlar.find(d => d.tip_id === DOKUMAN_TIPLERI.is_analizi) ?? null
  const prototipRow = mevcutDokumanlar.find(d => d.tip_id === DOKUMAN_TIPLERI.prototip) ?? null
  const testSenaryosuRow = mevcutDokumanlar.find(d => d.tip_id === DOKUMAN_TIPLERI.test_senaryosu) ?? null

  const toMetrik = (row: DokumanRow | null) =>
    row?.uretim_suresi != null && row?.token_tahmini != null
      ? { sure: row.uretim_suresi as number, token: row.token_tahmini as number }
      : null
  const storyMapMetrik = toMetrik(storyMapRow)
  const isAnaliziMetrik = toMetrik(isAnaliziRow)
  const prototipMetrik = toMetrik(prototipRow)
  const testSenaryosuMetrik = toMetrik(testSenaryosuRow)

  let initialAdim4BatchDetay: BatchDetay | null = null
  if (typeof prototipRow?.icerik === 'string') {
    const m = prototipRow.icerik.match(/<!--\s*kurgemx-metrics:(.+?)-->/)
    if (m) { try { initialAdim4BatchDetay = JSON.parse(m[1]) as BatchDetay } catch { /* ignore */ } }
  }

  const isAnaliziStr: string | null = isAnaliziRow
    ? JSON.stringify({
        baslik: (isAnaliziRow as { baslik?: string }).baslik ?? '',
        tarih: (isAnaliziRow.created_at ?? new Date().toISOString()).split('T')[0],
        versiyon: '1.0',
        icerik: typeof isAnaliziRow.icerik === 'string'
          ? isAnaliziRow.icerik
          : JSON.stringify(isAnaliziRow.icerik),
      })
    : null

  const enrichedInitialProje: InitialProje | undefined = initialProje
    ? {
        ...initialProje,
        storyMapIcerik: storyMapRow?.icerik ?? null,
        storyMapTarih: storyMapRow?.created_at ?? null,
        isAnaliziStr,
        prototipIcerik: prototipRow
          ? (typeof prototipRow.icerik === 'string' ? prototipRow.icerik : null)
          : null,
        prototipTarih: prototipRow?.created_at ?? null,
        testSenaryosuIcerik: testSenaryosuRow
          ? (typeof testSenaryosuRow.icerik === 'string' ? testSenaryosuRow.icerik : null)
          : null,
      }
    : undefined

  return (
    <ProjeProvider initialProje={enrichedInitialProje} initialPlan={initialPlan}>
      <EkranIci
        backHref={backHref}
        backLabel={backLabel}
        initialAdim2Metrigi={storyMapMetrik}
        initialAdim3Metrigi={isAnaliziMetrik}
        initialAdim4Metrigi={prototipMetrik}
        initialAdim4BatchDetay={initialAdim4BatchDetay}
        initialAdim5Metrigi={testSenaryosuMetrik}
      />
    </ProjeProvider>
  )
}

// İç bileşen: context'i kullanır
function EkranIci({
  backHref,
  backLabel,
  initialAdim2Metrigi = null,
  initialAdim3Metrigi = null,
  initialAdim4Metrigi = null,
  initialAdim4BatchDetay = null,
  initialAdim5Metrigi = null,
}: {
  backHref?: string
  backLabel?: string
  initialAdim2Metrigi?: { sure: number; token: number } | null
  initialAdim3Metrigi?: { sure: number; token: number } | null
  initialAdim4Metrigi?: { sure: number; token: number } | null
  initialAdim4BatchDetay?: BatchDetay | null
  initialAdim5Metrigi?: { sure: number; token: number } | null
}) {
  const t = useTranslations('calismaEkrani')
  const locale = useLocale()
  const ctx = useProje()
  const { projeId, ad, shortDesc, detailedDesc, projektDili, projeBuyuklugu } = ctx
  const planBilgisi = ctx.kullaniciPlan
  const exportIzni   = planBilgisi ? planIzinVeriyor(planBilgisi.plan, 'export')        : false
  const prototipIzni = planBilgisi ? planIzinVeriyor(planBilgisi.plan, 'prototip')      : false
  const testIzni     = planBilgisi ? planIzinVeriyor(planBilgisi.plan, 'test_senaryosu'): false
  const gosterPlanWidget = planBilgisi
    ? (planBilgisi.plan.kod === 'freemium' || planBilgisi.plan.kod === 'analyst')
    : false

  // Başarı banner'ı: sadece yeni proje oluşturulduğunda göster
  const initialProjeIdRef = useRef<string | null>(projeId)
  const [basariBannerGoster, setBasariBannerGoster] = useState(false)
  useEffect(() => {
    if (initialProjeIdRef.current === null && projeId !== null) {
      setBasariBannerGoster(true)
      document.getElementById('adim2')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const timer = setTimeout(() => setBasariBannerGoster(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [projeId])

  const [adim2Yukleniyor, setAdim2Yukleniyor] = useState(false)
  const [adim2Hata, setAdim2Hata] = useState(false)
  const [adim2HataMesaji, setAdim2HataMesaji] = useState<string | null>(null)
  const [adim2MesajIdx, setAdim2MesajIdx] = useState(0)
  const adim2IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const storyMapRef = useRef<HTMLElement | null>(null)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)
  const [adim3Yukleniyor, setAdim3Yukleniyor] = useState(false)
  const [adim3Hata, setAdim3Hata] = useState(false)
  const [adim3HataMesaji, setAdim3HataMesaji] = useState<string | null>(null)
  const [adim3MesajIdx, setAdim3MesajIdx] = useState(0)
  const [adim3StreamContent, setAdim3StreamContent] = useState<string | null>(null)
  const [adim3TokenLimiti, setAdim3TokenLimiti] = useState(false)
  const isAnaliziContainerRef = useRef<HTMLDivElement>(null)
  const [adim4Yukleniyor, setAdim4Yukleniyor] = useState(false)
  const [adim4Hata, setAdim4Hata] = useState(false)
  const [adim4HataMesaji, setAdim4HataMesaji] = useState<string | null>(null)
  const [adim4MesajIdx, setAdim4MesajIdx] = useState(0)
  const adim4IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [adim4StreamMsg, setAdim4StreamMsg] = useState<string | null>(null)
  const [adim4ProgressList, setAdim4ProgressList] = useState<string[]>([])
  const [adim4FailedScreens, setAdim4FailedScreens] = useState<string[]>([])
  const [adim4Tarih, setAdim4Tarih] = useState<string | null>(ctx.dokuman.prototipTarih ?? null)
  const [adim2Metrigi, setAdim2Metrigi] = useState<{sure: number; token: number} | null>(initialAdim2Metrigi)
  const [adim3Metrigi, setAdim3Metrigi] = useState<{sure: number; token: number} | null>(initialAdim3Metrigi)
  const [adim4Metrigi, setAdim4Metrigi] = useState<{sure: number; token: number} | null>(initialAdim4Metrigi)
  const [adim4BatchDetay, setAdim4BatchDetay] = useState<BatchDetay | null>(initialAdim4BatchDetay)
  const [adim5Yukleniyor, setAdim5Yukleniyor] = useState(false)
  const [adim5Hata, setAdim5Hata] = useState(false)
  const [adim5StreamMsg, setAdim5StreamMsg] = useState<string | null>(null)
  const [adim5ProgressList, setAdim5ProgressList] = useState<string[]>([])
  const [adim5Metrigi, setAdim5Metrigi] = useState<{sure: number; token: number} | null>(initialAdim5Metrigi)
  const [kapsamYukleniyor, setKapsamYukleniyor] = useState(false)
  const [kapsamHata, setKapsamHata] = useState(false)
  const [mimariYukleniyor, setMimariYukleniyor] = useState(false)
  const [mimariHata, setMimariHata] = useState(false)
  const [tamEkranTablo, setTamEkranTablo] = useState<'hikaye' | 'sprint' | null>(null)

  useEffect(() => {
    const el = isAnaliziContainerRef.current
    if (!el || !adim3Yukleniyor) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    if (isAtBottom) el.scrollTop = el.scrollHeight
  }, [adim3StreamContent, adim3Yukleniyor])

  const storyMapData: StoryMapData | null = ctx.dokuman.storyMap
    ? (JSON.parse(ctx.dokuman.storyMap) as StoryMapData)
    : null

  const isAnaliziData: IsAnaliziData | null = ctx.dokuman.isAnalizi
    ? (JSON.parse(ctx.dokuman.isAnalizi) as IsAnaliziData)
    : null

  const adim2Aktif = projeId !== null
  const adim3Aktif = storyMapData !== null
  const adim5Aktif = isAnaliziData !== null

  const [storyMapTarihStr, setStoryMapTarihStr] = useState<string>('')
  const [isAnaliziTarihStr, setIsAnaliziTarihStr] = useState<string>('')
  const [adim4TarihStr, setAdim4TarihStr] = useState<string>('')

  useEffect(() => {
    const l = projektDili === 'TR' ? 'tr-TR' : 'en-US'
    const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setStoryMapTarihStr(new Date(ctx.dokuman.storyMapTarih ?? new Date()).toLocaleDateString(l, o))
  }, [ctx.dokuman.storyMapTarih, projektDili])

  useEffect(() => {
    if (!isAnaliziData) { setIsAnaliziTarihStr(''); return }
    const l = projektDili === 'TR' ? 'tr-TR' : 'en-US'
    const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setIsAnaliziTarihStr(new Date(isAnaliziData.tarih).toLocaleDateString(l, o))
  }, [isAnaliziData, projektDili])

  useEffect(() => {
    if (!adim4Tarih) { setAdim4TarihStr(''); return }
    const l = projektDili === 'TR' ? 'tr-TR' : 'en-US'
    const o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    setAdim4TarihStr(new Date(adim4Tarih).toLocaleDateString(l, o))
  }, [adim4Tarih, projektDili])

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

    const startTime2 = Date.now()
    try {
      const res = await fetch('/api/ai/hikaye-haritasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi: ad, detayliAciklama: detailedDesc, projeDili: projektDili, projeBuyuklugu }),
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
      const sure2 = Math.round((Date.now() - startTime2) / 1000)
      const token2 = Math.round(JSON.stringify(veri).length / 4)
      if (projeId) {
        const supabase = createClient()
        const upsertData = {
          proje_id: projeId,
          tip_id: DOKUMAN_TIPLERI.hikaye_haritasi,
          baslik: projektDili === 'TR' ? 'Hikaye Haritası' : 'Story Map',
          icerik: veri,
          dil: projektDili ?? 'TR',
          uretim_suresi: sure2,
          token_tahmini: token2,
        }
        const { error: upsertError } = await supabase
          .from('dokumanlar')
          .upsert(upsertData, { onConflict: 'proje_id,tip_id' })
        if (upsertError) {
          console.error('[generateStoryMap] Kayıt hatası (tam):', JSON.stringify(upsertError, null, 2))
          setAdim2HataMesaji(`Kayıt hatası: ${upsertError.message} (code: ${upsertError.code})`)
          setAdim2Hata(true)
        }
      }
      ctx.setDokuman('storyMap', JSON.stringify(veri))
      setAdim2Metrigi({ sure: sure2, token: token2 })
    } catch (err) {
      console.error('[generateStoryMap] hata:', err)
      setAdim2HataMesaji(err instanceof Error ? err.message : String(err))
      setAdim2Hata(true)
    } finally {
      if (adim2IntervalRef.current) {
        clearInterval(adim2IntervalRef.current)
        adim2IntervalRef.current = null
      }
      setAdim2Yukleniyor(false)
    }
  }

  // Adım 3: bolum1 → R1 → R2 → R3 → bolum345 sırasıyla 5 ayrı API çağrısı.
  //   bolum1   → Doküman başlığı + header + Bölüm 1
  //   R1/R2/R3 → Bölüm 2.1 / 2.2 / 2.3 (AC/BR numaraları zincirleme akar)
  //   bolum345 → Ekran notu + Bölüm 3,4,5 + kısaltmalar tablosu + footer
  // Yalnızca R1-R3 AC/BR ürettiği için bolum1 ve bolum345 numaralandırma
  // zincirini etkilemez. Tüm parçalar "\n\n" ile birleşip Supabase'e tek
  // kayıt olur.
  async function generateDocuments() {
    if (!detailedDesc || !storyMapData) return
    setAdim3Yukleniyor(true)
    setAdim3Hata(false)
    setAdim3HataMesaji(null)
    setAdim3MesajIdx(0)
    setAdim3StreamContent('')
    setAdim3TokenLimiti(false)

    type Bolum = 'bolum1' | 'R1' | 'R2' | 'R3' | 'bolum345'
    const hikayeler = storyMapData.hikayeHaritasi?.hikayeler ?? []
    // Sırayı koru, hikaye haritasında olmayan release'leri atla.
    const bolumler: Bolum[] = ['bolum1']
    for (const r of ['R1', 'R2', 'R3'] as const) {
      if (hikayeler.some(h => h.surum === r)) bolumler.push(r)
    }
    bolumler.push('bolum345')

    const parcalar: Record<string, string> = {}
    let acBaslangic = 1
    let brBaslangic = 1
    let baslik = ''
    let tarih = new Date().toISOString().split('T')[0]
    let versiyon = '1.0'
    let truncated = false

    // ADIM3_MESAJLAR sabit 5 öğelik. Hikaye haritasında bazı release'ler
    // yoksa bolumler.length < 5 olur; bu durumda mesaj sayısı da kısalır
    // ama indeks olarak ADIM3_MESAJLAR sırasındaki konuma map'lemek gerek.
    const mesajIdxFor = (bolum: Bolum): number =>
      bolum === 'bolum1' ? 0
      : bolum === 'R1' ? 1
      : bolum === 'R2' ? 2
      : bolum === 'R3' ? 3
      : 4

    const startTime3 = Date.now()
    try {
      for (let i = 0; i < bolumler.length; i++) {
        const bolum = bolumler[i]
        setAdim3MesajIdx(mesajIdxFor(bolum))

        const res = await fetch('/api/ai/is-analizi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projeAdi: ad,
            detayliAciklama: detailedDesc,
            hikayeHaritasi: storyMapData.hikayeHaritasi,
            projeDili: projektDili,
            bolum,
            acBaslangic,
            brBaslangic,
            projeBuyuklugu: ctx.projeBuyuklugu ?? 'Orta',
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(
            (errData as { detail?: string; error?: string }).detail ??
              (errData as { error?: string }).error ??
              `HTTP ${res.status} (${bolum})`,
          )
        }

        baslik = decodeURIComponent(res.headers.get('X-Baslik') ?? baslik)
        tarih = res.headers.get('X-Tarih') ?? tarih
        versiyon = res.headers.get('X-Versiyon') ?? versiyon

        if (!res.body) throw new Error('no_body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let aktif = ''

        // Bitmiş önceki parçalar ekranda kalsın, geçerli bölüm stream eder.
        const oncekiParcalar = bolumler
          .slice(0, i)
          .map(b => parcalar[b])
          .filter(Boolean)
          .join('\n\n')

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          aktif += decoder.decode(value, { stream: true })
          const display = [oncekiParcalar, stripStreamMarkers(aktif)]
            .filter(Boolean)
            .join('\n\n')
          setAdim3StreamContent(display)
        }
        aktif += decoder.decode()

        // META marker'dan sonAC / sonBR'yi al → bir sonraki release'in başlangıçları
        const meta = parseMetaFromChunk(aktif)
        if (meta) {
          if (typeof meta.sonAC === 'number') acBaslangic = meta.sonAC + 1
          if (typeof meta.sonBR === 'number') brBaslangic = meta.sonBR + 1
        }
        if (aktif.includes('<!-- TRUNCATED -->')) {
          truncated = true
        }
        parcalar[bolum] = stripStreamMarkers(aktif).trim()
      }

      const icerik = bolumler
        .map(b => parcalar[b])
        .filter(Boolean)
        .join('\n\n')

      if (truncated) setAdim3TokenLimiti(true)

      const sure3 = Math.round((Date.now() - startTime3) / 1000)
      const token3 = Math.round(icerik.length / 4)

      if (projeId) {
        const supabase = createClient()
        const { error: upsertError } = await supabase
          .from('dokumanlar')
          .upsert(
            {
              proje_id: projeId,
              tip_id: DOKUMAN_TIPLERI.is_analizi,
              baslik:
                baslik ||
                (projektDili === 'TR'
                  ? `${ad} — İş Analizi Dokümanı`
                  : `${ad} — Business Analysis Document`),
              icerik,
              dil: projektDili ?? 'TR',
              uretim_suresi: sure3,
              token_tahmini: token3,
            },
            { onConflict: 'proje_id,tip_id' },
          )
        if (upsertError) {
          console.error('[generateDocuments] kayıt hatası:', upsertError)
        }
      }

      ctx.setDokuman('isAnalizi', JSON.stringify({ baslik, tarih, versiyon, icerik }))
      setAdim3Metrigi({ sure: sure3, token: token3 })
      setAdim3StreamContent(null)
    } catch (err) {
      console.error('[generateDocuments] hata:', err)
      setAdim3HataMesaji(err instanceof Error ? err.message : String(err))
      setAdim3Hata(true)
      setAdim3StreamContent(null)
    } finally {
      setAdim3Yukleniyor(false)
    }
  }

  async function generatePrototype() {
    if (!detailedDesc || !storyMapData) return
    setAdim4Yukleniyor(true)
    setAdim4Hata(false)
    setAdim4HataMesaji(null)
    setAdim4MesajIdx(0)
    setAdim4StreamMsg(null)
    setAdim4ProgressList([])
    setAdim4FailedScreens([])

    const isTR = !projektDili || projektDili === 'TR'
    const hikayeler = storyMapData.hikayeHaritasi?.hikayeler ?? []
    const positiveAcler: Record<string, string[]> = isAnaliziData?.icerik
      ? parsePositiveAcler(isAnaliziData.icerik)
      : {}
    const startTime4 = Date.now()

    async function doSave(htmlIcerik: string) {
      const sure4 = Math.round((Date.now() - startTime4) / 1000)
      const token4 = Math.round(htmlIcerik.length / 4)
      if (projeId) {
        const supabase = createClient()
        const { error: upsertError } = await supabase
          .from('dokumanlar')
          .upsert(
            {
              proje_id: projeId,
              tip_id: DOKUMAN_TIPLERI.prototip,
              baslik: projektDili === 'TR' ? `${ad} — Prototip` : `${ad} — Prototype`,
              icerik: htmlIcerik,
              dil: projektDili ?? 'TR',
              uretim_suresi: sure4,
              token_tahmini: token4,
            },
            { onConflict: 'proje_id,tip_id' },
          )
        if (upsertError) console.error('[generatePrototype] kayıt hatası:', upsertError)
      }
      setAdim4Tarih(new Date().toISOString())
      setAdim4Metrigi({ sure: sure4, token: token4 })
      ctx.setDokuman('prototype', htmlIcerik)
    }

    try {
      // 1. Skeleton
      setAdim4StreamMsg(locale === 'tr' ? 'İskelet oluşturuluyor...' : 'Building skeleton...')
      const skelRes = await fetch('/api/ai/prototip-skeleton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projeAdi: ad,
          detayliAciklama: detailedDesc,
          hikayeler,
          positiveAcler,
          projeDili: projektDili,
          arayuzDili: locale,
        }),
      })
      if (!skelRes.ok) {
        const errData = await skelRes.json().catch(() => ({}))
        throw new Error((errData as { error?: string }).error ?? `HTTP ${skelRes.status}`)
      }
      const { skeleton, screenIds, screenNames, skeletonCSS, hikayelerMetni } = await skelRes.json() as {
        skeleton: string
        screenIds: string[]
        screenNames: Record<string, string>
        skeletonCSS: string
        hikayelerMetni: string
      }
      setAdim4ProgressList(prev => [...prev, locale === 'tr' ? 'Navigasyon hazırlandı ✓' : 'Navigation ready ✓'])

      if (screenIds.length === 0) {
        await doSave(deduplicateNavScript(skeleton))
        return
      }

      // Placeholder replace: regex ile esnek boşluk eşleşmesi + $ işaretini korur
      function fillPlaceholder(html: string, id: string, content: string): string {
        return html.replace(
          new RegExp(`<!--\\s*SCREEN_CONTENT_${id}\\s*-->`, 'g'),
          () => content,
        )
      }

      // 2. Batch ekran içerikleri
      const batches: string[][] = []
      for (let i = 0; i < screenIds.length; i += 2) batches.push(screenIds.slice(i, i + 2))

      const contentMap: Record<string, string> = {}
      const allFailed: string[] = []
      const batchMetrikler: Array<{ ekranlar: string[]; sure: number; token: number }> = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        const startNum = i * 2 + 1
        const endNum = Math.min((i + 1) * 2, screenIds.length)
        setAdim4StreamMsg(
          locale === 'tr' ? `Ekranlar ${startNum}-${endNum} oluşturuluyor...` : `Generating screens ${startNum}-${endNum}...`
        )
        const batchStartTime = Date.now()

        let remaining = [...batch]
        for (let attempt = 0; attempt <= 2 && remaining.length > 0; attempt++) {
          if (attempt === 1) await new Promise(r => setTimeout(r, 3000))
          if (attempt === 2) await new Promise(r => setTimeout(r, 8000))
          try {
            const batchRes = await fetch('/api/ai/prototip-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ekranlar: remaining.map(id => ({ id, name: screenNames[id] ?? id })),
                skeletonCSS,
                projeAdi: ad,
                detayliAciklama: detailedDesc,
                hikayelerMetni,
                projeDili: projektDili,
              }),
            })
            if (!batchRes.ok) continue
            const data = await batchRes.json() as { screens: Record<string, string>; failedScreens: string[] }
            Object.assign(contentMap, data.screens)
            remaining = data.failedScreens ?? []
          } catch {
            // devam et
          }
        }
        if (remaining.length > 0) allFailed.push(...remaining)

        batchMetrikler.push({
          ekranlar: batch,
          sure: Math.round((Date.now() - batchStartTime) / 1000),
          token: Math.round(batch.reduce((s, id) => s + (contentMap[id]?.length ?? 0), 0) / 4),
        })

        // Ara kayıt — hata fırlatırsa orkestrasyon durmasın
        try {
          if (projeId) {
            let partialHtml = skeleton
            for (const [id, content] of Object.entries(contentMap)) {
              partialHtml = fillPlaceholder(partialHtml, id, content)
            }
            const supabase = createClient()
            await supabase.from('dokumanlar').upsert(
              {
                proje_id: projeId,
                tip_id: DOKUMAN_TIPLERI.prototip,
                baslik: projektDili === 'TR' ? `${ad} — Prototip` : `${ad} — Prototype`,
                icerik: partialHtml,
                dil: projektDili ?? 'TR',
                uretim_suresi: Math.round((Date.now() - startTime4) / 1000),
                token_tahmini: Math.round(partialHtml.length / 4),
              },
              { onConflict: 'proje_id,tip_id' },
            )
          }
        } catch (saveErr) {
          console.error('[generatePrototype] ara kayıt hatası:', saveErr)
        }

        setAdim4ProgressList(prev => [
          ...prev,
          locale === 'tr' ? `Ekranlar ${startNum}-${endNum} hazır ✓` : `Screens ${startNum}-${endNum} ready ✓`,
        ])
      }

      // 3. Final birleştirme
      let htmlIcerik = skeleton
      for (const [id, content] of Object.entries(contentMap)) {
        htmlIcerik = fillPlaceholder(htmlIcerik, id, content)
      }
      for (const id of allFailed) {
        htmlIcerik = fillPlaceholder(
          htmlIcerik,
          id,
          '<div style="padding:40px;text-align:center;color:#991B1B;background:#FEE2E2;border-radius:8px;">Bu ekran üretilemedi. Sistem yöneticisine başvurun: destek@kurgemx.com</div>',
        )
      }
      htmlIcerik = deduplicateNavScript(htmlIcerik)
      const batchDetay: BatchDetay = {
        toplamSure: Math.round((Date.now() - startTime4) / 1000),
        toplamToken: Math.round(htmlIcerik.length / 4),
        batches: batchMetrikler,
      }
      htmlIcerik += `\n<!-- kurgemx-metrics:${JSON.stringify(batchDetay)} -->`
      setAdim4BatchDetay(batchDetay)
      try {
        await doSave(htmlIcerik)
      } catch (saveErr) {
        console.error('[generatePrototype] final kayıt hatası:', saveErr)
        setAdim4Tarih(new Date().toISOString())
        setAdim4Metrigi({ sure: Math.round((Date.now() - startTime4) / 1000), token: Math.round(htmlIcerik.length / 4) })
        ctx.setDokuman('prototype', htmlIcerik)
      }
      if (allFailed.length > 0) setAdim4FailedScreens(allFailed)
    } catch (err) {
      console.error('[generatePrototype] hata:', err)
      setAdim4HataMesaji(err instanceof Error ? err.message : String(err))
      setAdim4Hata(true)
    } finally {
      setAdim4StreamMsg(null)
      setAdim4Yukleniyor(false)
    }
  }

  async function generateTestScenarios() {
    if (!isAnaliziData || !storyMapData) return
    setAdim5Yukleniyor(true)
    setAdim5Hata(false)
    setAdim5StreamMsg(null)
    setAdim5ProgressList([])

    const hikayeler = storyMapData.hikayeHaritasi?.hikayeler ?? []
    const allAcler = parseAllAcler(isAnaliziData.icerik)
    const surumler = (['R1', 'R2', 'R3'] as const).filter(r => hikayeler.some(h => h.surum === r))
    const allTestCases: TestCaseItem[] = []
    const startTime = Date.now()

    try {
      for (const release of surumler) {
        const releaseHikayeler = hikayeler.filter(h => h.surum === release)
        const releaseAcler = allAcler.filter(ac => releaseHikayeler.some(h => h.no === ac.hikayeNo))

        setAdim5StreamMsg(locale === 'tr'
          ? `${release} test case'leri oluşturuluyor...`
          : `Generating ${release} test cases...`)

        const res = await fetch('/api/ai/test-senaryosu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projeAdi: ad,
            detayliAciklama: detailedDesc,
            projeDili: projektDili,
            release,
            projeBuyuklugu: ctx.projeBuyuklugu ?? 'Orta',
            hikayeler: releaseHikayeler.map(h => ({ no: h.no, ad: h.ad, destan: h.destan, sprint: h.sprint })),
            acler: releaseAcler,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error((errData as { error?: string }).error ?? `HTTP ${res.status} (${release})`)
        }

        const data = await res.json() as { testCases: TestCaseItem[]; release: string }
        allTestCases.push(...(data.testCases ?? []))
        const tcCount = data.testCases?.length ?? 0
        setAdim5ProgressList(prev => [...prev,
          locale === 'tr' ? `${release} tamamlandı ✓ (${tcCount} TC)` : `${release} complete ✓ (${tcCount} TCs)`
        ])
      }

      const icerik = JSON.stringify({ test_cases: allTestCases })
      const sure5 = Math.round((Date.now() - startTime) / 1000)
      const token5 = Math.round(icerik.length / 4)

      if (projeId) {
        const supabase = createClient()
        const { error: upsertError } = await supabase.from('dokumanlar').upsert(
          {
            proje_id: projeId,
            tip_id: DOKUMAN_TIPLERI.test_senaryosu,
            baslik: projektDili === 'TR' ? `${ad} — Test Senaryoları` : `${ad} — Test Scenarios`,
            icerik,
            dil: projektDili ?? 'TR',
            uretim_suresi: sure5,
            token_tahmini: token5,
          },
          { onConflict: 'proje_id,tip_id' },
        )
        if (upsertError) console.error('[generateTestScenarios] kayıt hatası:', upsertError)
      }

      setAdim5Metrigi({ sure: sure5, token: token5 })
      ctx.setDokuman('testScenarios', icerik)
    } catch (err) {
      console.error('[generateTestScenarios] hata:', err)
      setAdim5Hata(true)
    } finally {
      setAdim5StreamMsg(null)
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

  // ── Adım durumları (StepRail için) ──
  const steps: StepState[] = [
    {
      no: 1,
      label: t('adim1.baslik'),
      status: projeId ? 'done' : 'active',
    },
    {
      no: 2,
      label: t('adim2.baslik'),
      status: adim2Yukleniyor ? 'running' : storyMapData ? 'done' : projeId ? 'active' : 'pending',
      time: adim2Metrigi ? formatSure(adim2Metrigi.sure, projektDili ?? 'TR') : undefined,
      progress: adim2Yukleniyor ? (adim2MesajIdx + 1) / 4 : undefined,
    },
    {
      no: 3,
      label: t('adim3.baslik'),
      status: adim3Yukleniyor ? 'running' : isAnaliziData ? 'done' : storyMapData ? 'active' : 'pending',
      time: adim3Metrigi ? formatSure(adim3Metrigi.sure, projektDili ?? 'TR') : undefined,
      progress: adim3Yukleniyor ? (adim3MesajIdx + 1) / 5 : undefined,
    },
    {
      no: 4,
      label: t('adim4.baslik'),
      status: adim4Yukleniyor ? 'running' : ctx.dokuman.prototype ? 'done' : isAnaliziData ? 'active' : 'pending',
      time: adim4Metrigi ? formatSure(adim4Metrigi.sure, projektDili ?? 'TR') : undefined,
    },
    {
      no: 5,
      label: t('adim5.baslik'),
      status: adim5Yukleniyor ? 'running' : ctx.dokuman.testScenarios ? 'done' : isAnaliziData ? 'active' : 'pending',
      time: adim5Metrigi ? formatSure(adim5Metrigi.sure, projektDili ?? 'TR') : undefined,
    },
  ]
  const activeAdimId = steps.find(s => s.status === 'active' || s.status === 'running')?.no

  // Token + süre toplamları (StepRail footer kartı)
  const metrigi = [adim2Metrigi, adim3Metrigi, adim4Metrigi, adim5Metrigi].filter(Boolean)
  const toplamToken = metrigi.reduce((s, m) => s + (m?.token ?? 0), 0)
  const toplamSure = metrigi.reduce((s, m) => s + (m?.sure ?? 0), 0)

  return (
    <main className="min-h-screen bg-gray-100 overflow-x-hidden max-w-full">
      <div className="max-w-[1280px] mx-auto px-1 md:px-4 py-10 w-full">

        {/* Geri butonu + proje başlığı (mevcut proje görüntüleme) */}
        {backHref && backLabel && (
          <div className="flex items-center gap-4 mb-6">
            <a href={backHref} className="text-sm text-gray-500 hover:underline shrink-0">
              {backLabel}
            </a>
            {ad && <h1 className="text-lg font-semibold text-[#1F3864] truncate">{ad}</h1>}
          </div>
        )}

        {gosterPlanWidget && (
          <div className="mb-5 flex items-center justify-between rounded-lg bg-[#EEF4FB] border border-blue-100 px-4 py-2.5">
            <span className="text-xs text-[#1F3864]">
              <span className="font-semibold">{planBilgisi?.plan.ad}</span>{' '}
              {locale === 'tr' ? 'planındasınız' : 'plan active'}
            </span>
            <a href={`/${locale}/pricing`} className="text-xs font-medium text-[#2E75B6] hover:underline shrink-0">
              {locale === 'tr' ? 'Planı Yükselt →' : 'Upgrade plan →'}
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-start">
          <StepRail
            steps={steps}
            activeId={activeAdimId}
            extrasYakinda={locale === 'tr' ? ['Kapsam dokümanı', 'Mimari doküman'] : ['Scope document', 'Architecture doc']}
            tokenLine={toplamToken > 0 ? toplamToken.toLocaleString() : undefined}
            sureLine={toplamSure > 0 ? formatSure(toplamSure, projektDili ?? 'TR') : undefined}
          />
          <div className="flex flex-col gap-4">

          {/* ── Arka plan üretim banner'ı (Edit 5) ── */}
          {(adim3Yukleniyor || adim4Yukleniyor) && (
            <BackgroundBanner message={t('uretimNotu')} />
          )}

          {/* ── Adım 1 ── */}
          <StepCard
            id="adim1"
            no={1}
            title={t('adim1.baslik')}
            status={projeId ? 'done' : 'active'}
            subtitle={projeId && projeBuyuklugu ? `${projeBuyuklugu === 'Küçük' ? t('adim1.kucuk') : projeBuyuklugu === 'Orta' ? t('adim1.orta') : t('adim1.buyuk')} · ${projektDili ?? 'TR'}` : undefined}
          >
                {projeId ? (
                  // Read-only: proje oluşturulduktan sonra
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">{t('adim1.projeAdi')}</p>
                      <p className="text-sm font-semibold text-gray-800">{ad}</p>
                    </div>
                    {projeBuyuklugu && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">{t('adim1.projeBuyuklugu')}</p>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF4FB] border border-blue-100 px-2.5 py-1 text-xs font-medium text-[#1F3864]">
                          {projeBuyuklugu === 'Küçük' ? t('adim1.kucuk') : projeBuyuklugu === 'Orta' ? t('adim1.orta') : t('adim1.buyuk')}
                          <span className="text-[#2E75B6]">·</span>
                          {projeBuyuklugu === 'Küçük' ? t('adim1.kucukHikaye') : projeBuyuklugu === 'Orta' ? t('adim1.ortaHikaye') : t('adim1.buyukHikaye')}
                        </span>
                      </div>
                    )}
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
          </StepCard>

          {/* ── Adım 2 ── */}
          <StepCard
            id="adim2"
            no={2}
            title={t('adim2.baslik')}
            status={adim2Yukleniyor ? 'running' : storyMapData ? 'done' : adim2Aktif ? 'active' : 'pending'}
            time={adim2Metrigi && storyMapData ? formatSure(adim2Metrigi.sure, projektDili ?? 'TR') : undefined}
          >
            <div className="space-y-6">
                {/* Proje oluşturma bildirimi */}
                {basariBannerGoster && (
                  <div
                    className="flex items-start gap-2"
                    style={{ backgroundColor: '#EAF3DE', color: '#27500A', border: '0.5px solid #C0DD97', borderRadius: 8, padding: '10px 14px' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{t('projeOlustu.baslik')}</p>
                      <p className="text-xs mt-0.5" style={{ opacity: 0.8 }}>{t('projeOlustu.aciklama')}</p>
                    </div>
                    <button
                      onClick={() => setBasariBannerGoster(false)}
                      className="shrink-0 hover:opacity-70 transition"
                      aria-label="Kapat"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )}
                {/* Generate butonu */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {storyMapData && !adim2Yukleniyor ? (
                      <p className="text-xs text-gray-500 italic">
                        {t('adim2.hikayeHaritasiTarih')}{' '}
                        {storyMapTarihStr}
                      </p>
                    ) : (
                      <GenerateButton
                        label={t('adim2.uret')}
                        loadingLabel={(ADIM2_MESAJLAR[locale === 'tr' ? 'TR' : 'EN'])[adim2MesajIdx]}
                        regenerateLabel=""
                        disabled={!adim2Aktif}
                        loading={adim2Yukleniyor}
                        hasContent={false}
                        onClick={generateStoryMap}
                      />
                    )}
                  {storyMapData && (
                    <button
                      onClick={exportIzni ? () => exportToExcel(storyMapData, ad) : () => { window.location.href = `/${locale}/pricing` }}
                      title={!exportIzni ? (locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade') : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] transition ${exportIzni ? 'border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]' : 'border-gray-200 text-gray-400 opacity-60'}`}
                    >
                      {exportIzni ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                      {t('adim2.exportExcel')}
                    </button>
                  )}
                  </div>
                  {adim2Hata && (
                    <p className="text-xs text-red-500">{adim2HataMesaji ?? t('adim1.hatalar.genel')}</p>
                  )}
                  {adim2Metrigi && storyMapData && !adim2Yukleniyor && (
                    <p style={{ fontSize: 11, opacity: 0.4, fontStyle: 'italic' }} className="text-gray-500">
                      {t('uretimMetrigi', { sure: formatSure(adim2Metrigi.sure, projektDili ?? 'TR'), token: adim2Metrigi.token.toLocaleString() })}
                    </p>
                  )}
                </div>

                {/* ── Tablo 1: Hikaye Haritası ── */}
                {storyMapData && (
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] text-gray-400">{t('adim2.scrollIpucu')}</span>
                    <button
                      onClick={() => setTamEkranTablo('hikaye')}
                      title={locale === 'tr' ? 'Tam ekranda görüntüle' : 'View fullscreen'}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#2E75B6] transition-colors shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                      </svg>
                    </button>
                  </div>
                )}
                <div className="relative w-full">
                  {/* Üst scroll bar — sadece içerik yok, phantom div ile tablo genişliğini taklit eder */}
                  {storyMapData && (
                    <div
                      ref={topScrollRef}
                      className="overflow-x-auto"
                      style={{ height: 12 }}
                      onScroll={() => {
                        if (bottomScrollRef.current && topScrollRef.current &&
                            bottomScrollRef.current.scrollLeft !== topScrollRef.current.scrollLeft) {
                          bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
                        }
                      }}
                    >
                      <div style={{ minWidth: `${((storyMapData.hikayeHaritasi?.destanlar ?? []).length + 1) * 200}px`, height: 1 }} />
                    </div>
                  )}
                  {/* Alt scroll bar — gerçek tablo */}
                  <div
                    ref={bottomScrollRef}
                    className="overflow-x-auto rounded-lg border border-gray-200 bg-white w-full"
                    style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
                    onScroll={() => {
                      if (topScrollRef.current && bottomScrollRef.current &&
                          topScrollRef.current.scrollLeft !== bottomScrollRef.current.scrollLeft) {
                        topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft
                      }
                    }}
                  >
                    {storyMapData ? (
                      <table
                        className="text-sm text-left"
                        style={{ minWidth: 'max-content', tableLayout: 'auto' }}
                      >
                        <thead className="bg-[#1F3864]">
                          <tr>
                            <th className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide w-36 border-r border-white/20 sticky left-0 z-10 bg-[#1F3864] whitespace-nowrap">
                              {storyMapData.genelOzet[0]
                                ? Object.keys(storyMapData.genelOzet[0])[0]
                                : (projektDili === 'TR' ? 'Sürüm' : 'Release')}
                            </th>
                            {(storyMapData.hikayeHaritasi?.destanlar ?? []).map(d => (
                              <th key={d} className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
                                {d}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(['R1', 'R2', 'R3'] as const)
                            .filter(s => (storyMapData.hikayeHaritasi?.hikayeler ?? []).some(h => h.surum === s))
                            .map((surumKey, idx) => (
                              <tr key={surumKey} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                                <td
                                  className={`px-3 py-2 text-xs font-semibold text-gray-600 border-r border-gray-100 align-top w-36 whitespace-nowrap sticky left-0 z-10 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                                  style={{ boxShadow: '1px 0 0 #E5E7EB' }}
                                >
                                  {formatSurum(surumKey)}
                                </td>
                                {(storyMapData.hikayeHaritasi?.destanlar ?? []).map(destan => (
                                  <td key={destan} className="px-3 py-2 border-r border-gray-100 align-top min-w-[180px] last:border-r-0 whitespace-nowrap">
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
                      <div style={{ opacity: 0.4 }}>
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr>
                              {['Release', 'Epic 1', 'Epic 2', 'Epic 3'].map(col => (
                                <th
                                  key={col}
                                  className="px-4 py-2.5 text-xs font-semibold"
                                  style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'R1 — MVP', widths: [['65%', '45%'], ['75%', '50%'], ['55%', '70%']] as [string, string][] },
                              { label: 'R2 — Enhancement', widths: [['50%', '70%'], ['60%', '40%'], ['75%', '55%']] as [string, string][] },
                              { label: 'R3 — Advanced', widths: [['70%', '50%'], ['45%', '65%'], ['60%', '40%']] as [string, string][] },
                            ].map(({ label, widths }) => (
                              <tr key={label}>
                                <td className="px-4 py-3 text-xs font-semibold" style={{ border: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)' }}>
                                  {label}
                                </td>
                                {widths.map((pair, i) => (
                                  <td key={i} className="px-4 py-3" style={{ border: '0.5px solid var(--color-border-tertiary)' }}>
                                    <div className="h-2 rounded-full mb-1.5" style={{ width: pair[0], background: 'var(--color-background-secondary)' }} />
                                    <div className="h-2 rounded-full" style={{ width: pair[1], background: 'var(--color-background-secondary)' }} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {storyMapData && (
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-lg"
                      style={{ background: 'linear-gradient(to right, transparent, white)' }}
                    />
                  )}
                </div>
            </div>
          </StepCard>

          {/* ── Sprint Planı ── */}
          {storyMapData && storyMapData.sprintPlani.length > 0 && (() => {
            const keys = Object.keys(storyMapData.sprintPlani[0])
            return (
              <div className="flex gap-0 md:gap-6">
                <div className="hidden md:block w-9 shrink-0" />
                <div className="flex-1 pb-4 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[#1F3864]">{t('adim2.sprintPlanBaslik')}</h3>
                    <button
                      onClick={() => setTamEkranTablo('sprint')}
                      title={locale === 'tr' ? 'Tam ekranda görüntüle' : 'View fullscreen'}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#2E75B6] transition-colors shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                      </svg>
                    </button>
                  </div>
                  <div className="overflow-x-auto w-full" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
                  <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <table className="text-sm text-left" style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
                      <thead className="bg-[#1F3864]">
                        <tr>
                          {keys.map(k => (
                            <th key={k} className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
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
                                <td key={i} className="px-3 py-2 text-xs text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
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
                </div>
              </div>
            )
          })()}

          {/* ── Genel Özet ── */}
          {storyMapData && storyMapData.genelOzet.length > 0 && (() => {
            const keys = Object.keys(storyMapData.genelOzet[0])
            return (
              <div className="flex gap-0 md:gap-6">
                <div className="hidden md:block w-9 shrink-0" />
                <div className="flex-1 pb-10 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1F3864] mb-2">{t('adim2.genelOzetBaslik')}</h3>
                  <div className="overflow-x-auto w-full" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
                  <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <table className="text-sm text-left" style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
                      <thead className="bg-[#1F3864]">
                        <tr>
                          {keys.map(k => (
                            <th key={k} className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
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
                                <td key={i} className="px-3 py-2 text-xs text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
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
                </div>
              </div>
            )
          })()}

          {/* ── Kısaltmalar (Hikaye Haritası) ── */}
          {storyMapData && (
            <div className="flex gap-6">
              <div className="w-9 shrink-0" />
              <div className="flex-1 pb-6 min-w-0">
                <p
                  className="text-xs text-gray-500"
                  style={{
                    opacity: 0.4,
                    borderLeft: '2px solid var(--color-border-tertiary)',
                    paddingLeft: 10,
                  }}
                >
                  ST Story · SP Sprint · R Release · AC Acceptance Criteria · BR Business Rule · TC Test Case
                </p>
              </div>
            </div>
          )}

          {/* ── Adım 3 ── */}
          <StepCard
            id="adim3"
            no={3}
            title={t('adim3.baslik')}
            status={adim3Yukleniyor ? 'running' : isAnaliziData ? 'done' : adim3Aktif ? 'active' : 'pending'}
            time={adim3Metrigi && isAnaliziData ? formatSure(adim3Metrigi.sure, projektDili ?? 'TR') : undefined}
          >
            <div className="space-y-4">
                {/* Buton / tarih satırı */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3">
                    {isAnaliziData && !adim3Yukleniyor ? (
                      <p className="text-xs text-gray-500 italic">
                        {t('adim3.belgeTarih')}{' '}
                        {isAnaliziTarihStr}
                      </p>
                    ) : (
                      <GenerateButton
                        label={t('adim3.uret')}
                        loadingLabel={(ADIM3_MESAJLAR[locale === 'tr' ? 'TR' : 'EN'])[adim3MesajIdx]}
                        regenerateLabel=""
                        disabled={!adim3Aktif}
                        loading={adim3Yukleniyor}
                        hasContent={false}
                        onClick={generateDocuments}
                      />
                    )}
                    {isAnaliziData && (
                      <button
                        onClick={!exportIzni ? () => { window.location.href = `/${locale}/pricing` } : async () => {
                          try {
                            const res = await fetch('/api/dokuman/is-analizi-docx', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                icerik: isAnaliziData.icerik,
                                projeAdi: ad,
                                versiyon: isAnaliziData.versiyon,
                                tarih: isAnaliziData.tarih,
                              }),
                            })
                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}))
                              throw new Error(
                                (err as { detail?: string; error?: string }).detail ??
                                  (err as { error?: string }).error ??
                                  `HTTP ${res.status}`,
                              )
                            }
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `is-analizi-${ad
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9ğşıöüçîâûÇĞİÖÜŞ-]/gi, '')
                              .slice(0, 50)}.docx`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          } catch (e) {
                            console.error('[is-analizi-docx] indirme hatası:', e)
                            alert(
                              projektDili === 'TR'
                                ? 'Doküman indirilemedi. Lütfen tekrar deneyin.'
                                : 'Failed to download document. Please try again.',
                            )
                          }
                        }}
                        title={!exportIzni ? (locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade') : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] transition ${exportIzni ? 'border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]' : 'border-gray-200 text-gray-400 opacity-60'}`}
                      >
                        {exportIzni ? (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                        {t('adim3.indir')}
                      </button>
                    )}
                  </div>
                  {adim3Yukleniyor && <ProgressBar />}
                  {adim3Yukleniyor && (
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{t('uretimNotu')}</p>
                  )}
                  {adim3Hata && (
                    <p className="text-xs text-red-500">{adim3HataMesaji ?? t('adim1.hatalar.genel')}</p>
                  )}
                  {adim3Metrigi && isAnaliziData && !adim3Yukleniyor && (
                    <p style={{ fontSize: 11, opacity: 0.4, fontStyle: 'italic' }} className="text-gray-500">
                      {t('uretimMetrigi', { sure: formatSure(adim3Metrigi.sure, projektDili ?? 'TR'), token: adim3Metrigi.token.toLocaleString() })}
                    </p>
                  )}
                </div>

                {/* Doküman içeriği */}
                {adim3TokenLimiti && (
                  <p className="text-xs text-amber-600 mb-2">{t('adim3.tokenLimiti')}</p>
                )}
                {(isAnaliziData || adim3StreamContent !== null) ? (
                  <div
                    ref={isAnaliziContainerRef}
                    className="bg-white border border-gray-200 rounded-lg p-6 overflow-auto max-h-[70vh]"
                  >
                    <MarkdownGoster icerik={isAnaliziData?.icerik ?? adim3StreamContent ?? ''} />
                  </div>
                ) : (
                  !adim3Yukleniyor && (
                    <div style={{ opacity: 0.4 }} className="space-y-3">
                      <p className="text-sm font-semibold text-gray-500">Business Analysis Document</p>
                      {[
                        { no: 1, title: 'Document Overview' },
                        { no: 2, title: 'Story-Based Acceptance Criteria' },
                        { no: 3, title: 'System Requirements' },
                        { no: 4, title: 'Impact Analysis' },
                        { no: 5, title: 'Technical Details & Integrations' },
                      ].map(({ no, title }) => (
                        <div
                          key={no}
                          className="rounded-lg p-4 space-y-2"
                          style={{ border: '0.5px solid var(--color-border-tertiary)' }}
                        >
                          <p className="text-xs font-semibold text-gray-600">{no} — {title}</p>
                          <div className="h-2 rounded-full" style={{ background: 'var(--color-background-secondary)', width: '75%' }} />
                          <div className="h-2 rounded-full" style={{ background: 'var(--color-background-secondary)', width: '50%' }} />
                        </div>
                      ))}
                    </div>
                  )
                )}
            </div>
          </StepCard>

          {/* ── Adım 4 ── */}
          <StepCard
            id="adim4"
            no={4}
            title={t('adim4.baslik')}
            status={adim4Yukleniyor ? 'running' : ctx.dokuman.prototype ? 'done' : adim3Aktif ? 'active' : 'pending'}
            time={adim4Metrigi && ctx.dokuman.prototype ? formatSure(adim4Metrigi.sure, projektDili ?? 'TR') : undefined}
          >
            <div className="space-y-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {ctx.dokuman.prototype && !adim4Yukleniyor ? (
                      <p className="text-xs text-gray-500 italic">
                        {t('adim4.prototipOlusturuldu')}
                        {adim4Tarih && (
                          <>{' — '}{adim4TarihStr}</>
                        )}
                      </p>
                    ) : !prototipIzni ? (
                      <button
                        onClick={() => { window.location.href = `/${locale}/pricing` }}
                        className="inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] border-gray-200 text-gray-400 opacity-70"
                        title={locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade'}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {locale === 'tr' ? 'Analyst planında mevcut' : 'Available on Analyst plan'}
                      </button>
                    ) : (
                      <div title={isAnaliziData === null ? t('adim4.isAnaliziGerekli') : undefined} style={{ display: 'inline-block' }}>
                        <GenerateButton
                          label={t('adim4.uret')}
                          loadingLabel={adim4StreamMsg ?? (ADIM4_MESAJLAR[locale === 'tr' ? 'TR' : 'EN'])[adim4MesajIdx]}
                          regenerateLabel=""
                          disabled={isAnaliziData === null}
                          loading={adim4Yukleniyor}
                          hasContent={false}
                          onClick={generatePrototype}
                        />
                      </div>
                    )}
                    {ctx.dokuman.prototype && !adim4Yukleniyor && (
                      <>
                        <button
                          onClick={!exportIzni
                            ? () => { window.location.href = `/${locale}/pricing` }
                            : () => {
                                const blob = new Blob([ctx.dokuman.prototype!], { type: 'text/html;charset=utf-8' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `prototip-${ad.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').slice(0, 50)}.html`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }}
                          title={!exportIzni ? (locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade') : undefined}
                          className={`inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] transition ${exportIzni ? 'border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]' : 'border-gray-200 text-gray-400 opacity-60'}`}
                        >
                          {exportIzni ? (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                          {t('adim4.indir')}
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([ctx.dokuman.prototype!], { type: 'text/html;charset=utf-8' })
                            const url = URL.createObjectURL(blob)
                            window.open(url, '_blank')
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB] transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9M9 2h5m0 0v5m0-5L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {t('adim4.yeniSekme')}
                        </button>
                        <button
                          onClick={generatePrototype}
                          className="inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB] transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M1 8a7 7 0 1012-5M13 1v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {t('adim4.yenidenUret')}
                        </button>
                      </>
                    )}
                  </div>
                  {adim4Yukleniyor && <ProgressBar />}
                  {adim4Yukleniyor && adim4ProgressList.length > 0 && (
                    <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                      {adim4ProgressList.map((step, i) => (
                        <span key={i} style={{ color: '#2E75B6' }}>✓ {step}</span>
                      ))}
                      {adim4StreamMsg && (
                        <span style={{ color: '#9CA3AF' }}>⟳ {adim4StreamMsg}</span>
                      )}
                    </div>
                  )}
                  {adim4Yukleniyor && (
                    <p style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>{t('uretimNotu')}</p>
                  )}
                  {adim4Hata && (
                    <p className="text-xs text-red-500">{adim4HataMesaji ?? t('adim1.hatalar.genel')}</p>
                  )}
                  {adim4FailedScreens.length > 0 && !adim4Yukleniyor && (
                    <p className="text-xs text-amber-600">
                      {locale === 'tr'
                        ? `${adim4FailedScreens.length} ekran üretilemedi.`
                        : `${adim4FailedScreens.length} screen(s) could not be generated.`}
                      {' '}
                      <button onClick={generatePrototype} className="underline hover:no-underline">
                        {locale === 'tr' ? 'Tekrar dene' : 'Try again'}
                      </button>
                    </p>
                  )}
                  {adim4Metrigi && ctx.dokuman.prototype && !adim4Yukleniyor && (
                    <p style={{ fontSize: 11, opacity: 0.4, fontStyle: 'italic' }} className="text-gray-500">
                      {t('uretimMetrigi', { sure: formatSure(adim4Metrigi.sure, projektDili ?? 'TR'), token: adim4Metrigi.token.toLocaleString() })}
                    </p>
                  )}
                  {adim4BatchDetay && ctx.dokuman.prototype && !adim4Yukleniyor && (
                    <div className="mt-1 space-y-0.5">
                      {adim4BatchDetay.batches.map((b, idx) => (
                        <p key={idx} style={{ fontSize: 10, opacity: 0.35, fontStyle: 'italic' }} className="text-gray-500">
                          {b.ekranlar.join(', ')} — {formatSure(b.sure, projektDili ?? 'TR')} / {b.token.toLocaleString()} token
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                {!ctx.dokuman.prototype && (
                  <div style={{ opacity: 0.4, height: 320, border: '0.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                    {/* Sol menü skeleton */}
                    <div style={{ width: 180, borderRight: '0.5px solid #e5e7eb', background: '#f9fafb', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', width: '70%' }} />
                        <div style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: '50%' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 6, borderRadius: 4, background: '#d1d5db', width: '40%', marginBottom: 4 }} />
                        {([80, 60, 70] as number[]).map((w, i) => (
                          <div key={i} style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: `${w}%` }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 6, borderRadius: 4, background: '#d1d5db', width: '40%', marginBottom: 4 }} />
                        {([65, 75] as number[]).map((w, i) => (
                          <div key={i} style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: `${w}%` }} />
                        ))}
                      </div>
                    </div>
                    {/* Sağ içerik alanı skeleton */}
                    <div style={{ flex: 1, background: '#f9fafb', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 10, borderRadius: 4, background: '#e5e7eb', width: '30%' }} />
                        <div style={{ height: 10, borderRadius: 10, background: '#e5e7eb', width: 40 }} />
                        <div style={{ height: 10, borderRadius: 10, background: '#e5e7eb', width: 48 }} />
                      </div>
                      <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 6, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, background: '#ffffff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {([0, 1, 2, 3] as number[]).map(i => (
                            <div key={i} style={{ height: 24, borderRadius: 4, background: '#e5e7eb' }} />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ height: 20, borderRadius: 4, background: '#e5e7eb', width: 60 }} />
                          <div style={{ height: 20, borderRadius: 4, background: '#e5e7eb', width: 80 }} />
                        </div>
                      </div>
                      <div style={{ border: '0.5px solid #e5e7eb', borderRadius: 6, overflow: 'hidden', background: '#ffffff' }}>
                        <div style={{ height: 24, background: '#e5e7eb' }} />
                        {([0, 1] as number[]).map(i => (
                          <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 12px', borderTop: '0.5px solid #e5e7eb' }}>
                            <div style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: '25%' }} />
                            <div style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: '40%' }} />
                            <div style={{ height: 6, borderRadius: 4, background: '#e5e7eb', width: '20%' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </StepCard>

          {/* ── Adım 5 ── */}
          <StepCard
            id="adim5"
            no={5}
            title={t('adim5.baslik')}
            status={adim5Yukleniyor ? 'running' : ctx.dokuman.testScenarios ? 'done' : adim5Aktif ? 'active' : 'pending'}
            time={adim5Metrigi && ctx.dokuman.testScenarios ? formatSure(adim5Metrigi.sure, projektDili ?? 'TR') : undefined}
          >
            <div className="space-y-4">
                {(() => {
                  const testCases: TestCaseItem[] = (() => {
                    try { return (JSON.parse(ctx.dokuman.testScenarios ?? '{}') as { test_cases: TestCaseItem[] }).test_cases ?? [] }
                    catch { return [] }
                  })()
                  return (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          {!testIzni ? (
                            <button
                              onClick={() => { window.location.href = `/${locale}/pricing` }}
                              className="inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] border-gray-200 text-gray-400 opacity-70"
                              title={locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade'}
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              {locale === 'tr' ? 'Analyst planında mevcut' : 'Available on Analyst plan'}
                            </button>
                          ) : (
                            <GenerateButton
                              label={t('adim5.uret')}
                              loadingLabel={adim5StreamMsg ?? t('adim5.olusturuluyor')}
                              regenerateLabel={t('yenidenOlustur')}
                              disabled={isAnaliziData === null}
                              loading={adim5Yukleniyor}
                              hasContent={testCases.length > 0}
                              onClick={generateTestScenarios}
                            />
                          )}
                          {testCases.length > 0 && !adim5Yukleniyor && (
                            <button
                              onClick={!exportIzni
                                ? () => { window.location.href = `/${locale}/pricing` }
                                : () => exportTestExcel(testCases, ad, projektDili)}
                              title={!exportIzni ? (locale === 'tr' ? 'Analyst planında mevcut → Planı Yükselt' : 'Available on Analyst plan → Upgrade') : undefined}
                              className={`inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium border-[0.5px] transition ${exportIzni ? 'border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]' : 'border-gray-200 text-gray-400 opacity-60'}`}
                            >
                              {exportIzni ? (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              )}
                              {t('adim5.indir')}
                            </button>
                          )}
                        </div>
                        {adim5Yukleniyor && <ProgressBar />}
                        {adim5Yukleniyor && adim5ProgressList.length > 0 && (
                          <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                            {adim5ProgressList.map((step, i) => (
                              <span key={i} style={{ color: '#2E75B6' }}>✓ {step}</span>
                            ))}
                            {adim5StreamMsg && (
                              <span style={{ color: '#9CA3AF' }}>⟳ {adim5StreamMsg}</span>
                            )}
                          </div>
                        )}
                        {adim5Hata && <p className="text-xs text-red-500">{t('adim1.hatalar.genel')}</p>}
                        {testCases.length > 0 && !adim5Yukleniyor && (
                          <p style={{ fontSize: 11, opacity: 0.5, fontStyle: 'italic' }} className="text-gray-500">
                            ✓ {testCases.length} {t('adim5.olusturuldu')}
                          </p>
                        )}
                        {adim5Metrigi && testCases.length > 0 && !adim5Yukleniyor && (
                          <p style={{ fontSize: 11, opacity: 0.4, fontStyle: 'italic' }} className="text-gray-500">
                            {t('uretimMetrigi', { sure: formatSure(adim5Metrigi.sure, projektDili ?? 'TR'), token: adim5Metrigi.token.toLocaleString() })}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-1/4">{t('adim5.sutun1')}</th>
                              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-1/2">{t('adim5.sutun2')}</th>
                              <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-1/4">{t('adim5.sutun3')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {testCases.length > 0
                              ? testCases.slice(0, 5).map((tc, i) => (
                                  <tr key={i}>
                                    <td className="px-4 py-3 text-xs text-gray-600">{tc.no}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{Array.isArray(tc.test_adimlar) ? tc.test_adimlar.slice(0, 2).join(' → ') : String(tc.test_adimlar ?? '')}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{tc.beklenen_sonuc}</td>
                                  </tr>
                                ))
                              : (
                                <>
                                  <tr><td className="px-4 py-3 text-gray-300">{t('adim5.ornekS1')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekA1')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekB1')}</td></tr>
                                  <tr><td className="px-4 py-3 text-gray-300">{t('adim5.ornekS2')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekA2')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekB2')}</td></tr>
                                  <tr><td className="px-4 py-3 text-gray-300">{t('adim5.ornekS3')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekA3')}</td><td className="px-4 py-3 text-gray-300">{t('adim5.ornekB3')}</td></tr>
                                </>
                              )
                            }
                          </tbody>
                        </table>
                        {testCases.length > 5 && !adim5Yukleniyor && (
                          <p className="px-4 py-2 text-xs text-gray-400 bg-gray-50">
                            {locale === 'tr' ? `+${testCases.length - 5} test case daha — tam liste için Excel'i indirin` : `+${testCases.length - 5} more test cases — download Excel for full list`}
                          </p>
                        )}
                      </div>
                    </>
                  )
                })()}
            </div>
          </StepCard>

          {/* ── Tamamlayıcı Dokümanlar ── */}
          <div className="border-t-2 border-dashed border-gray-200 pt-8 mt-2">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base font-semibold text-gray-400">{t('tamamlayici.baslik')}</h2>
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                {t('tamamlayici.etiket')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-5" style={{ opacity: 0.6 }}>
                <p className="text-sm font-medium text-gray-600 mb-2">{t('tamamlayici.kapsam')}</p>
                <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 12, fontSize: 11, padding: '2px 10px' }}>
                  {t('tamamlayici.yakinda')}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-5" style={{ opacity: 0.6 }}>
                <p className="text-sm font-medium text-gray-600 mb-2">{t('tamamlayici.mimari')}</p>
                <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 12, fontSize: 11, padding: '2px 10px' }}>
                  {t('tamamlayici.yakinda')}
                </span>
              </div>
            </div>
          </div>

          </div>{/* /flex flex-col gap-4 */}
        </div>{/* /grid */}
      </div>
      {projeId && (
        <p className="fixed bottom-2 right-3 text-[10px] text-gray-400 select-all cursor-text">
          {projeId}
        </p>
      )}

      {/* ── Tam Ekran Tablo Modalı ── */}
      {tamEkranTablo && storyMapData && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setTamEkranTablo(null) }}
        >
          <div className="bg-white m-3 md:m-6 rounded-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 24px)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-semibold text-[#1F3864]">
                {tamEkranTablo === 'hikaye' ? t('adim2.baslik') : t('adim2.sprintPlanBaslik')}
              </h3>
              <button
                onClick={() => setTamEkranTablo(null)}
                className="w-8 h-8 rounded-lg grid place-items-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={locale === 'tr' ? 'Kapat' : 'Close'}
              >
                ✕
              </button>
            </div>
            {/* Modal içerik */}
            <div className="flex-1 overflow-auto p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
              {tamEkranTablo === 'hikaye' ? (
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table className="text-sm text-left" style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
                    <thead className="bg-[#1F3864]">
                      <tr>
                        <th className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide w-36 border-r border-white/20 whitespace-nowrap sticky left-0 z-10 bg-[#1F3864]">
                          {storyMapData.genelOzet[0]
                            ? Object.keys(storyMapData.genelOzet[0])[0]
                            : (projektDili === 'TR' ? 'Sürüm' : 'Release')}
                        </th>
                        {(storyMapData.hikayeHaritasi?.destanlar ?? []).map(d => (
                          <th key={d} className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(['R1', 'R2', 'R3'] as const)
                        .filter(s => (storyMapData.hikayeHaritasi?.hikayeler ?? []).some(h => h.surum === s))
                        .map((surumKey, idx) => (
                          <tr key={surumKey} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                            <td
                              className={`px-3 py-2 text-xs font-semibold text-gray-600 border-r border-gray-100 align-top w-36 whitespace-nowrap sticky left-0 z-10 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                              style={{ boxShadow: '1px 0 0 #E5E7EB' }}
                            >
                              {formatSurum(surumKey)}
                            </td>
                            {(storyMapData.hikayeHaritasi?.destanlar ?? []).map(destan => (
                              <td key={destan} className="px-3 py-2 border-r border-gray-100 align-top min-w-[180px] last:border-r-0 whitespace-nowrap">
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
                </div>
              ) : (
                (() => {
                  const keys = Object.keys(storyMapData.sprintPlani[0] ?? {})
                  return (
                    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <table className="text-sm text-left" style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
                        <thead className="bg-[#1F3864]">
                          <tr>
                            {keys.map(k => (
                              <th key={k} className="px-3 py-2 text-xs font-semibold text-white uppercase tracking-wide border-r border-white/20 last:border-r-0 whitespace-nowrap">
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
                                  <td key={i} className="px-3 py-2 text-xs text-gray-700 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                    {String(val ?? '')}
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
