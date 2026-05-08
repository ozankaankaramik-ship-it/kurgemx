import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { genel, isAnalizi } from '@/lib/standartlar'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SISTEM = `${genel}\n\n---\n\n${isAnalizi}`

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

interface HikayeItem {
  no: string; ad: string; destan: string; surum: string; sprint: string
}

interface HikayeHaritasiInput {
  destanlar: string[]
  hikayeler: HikayeItem[]
  sprintPlani?: Array<Record<string, string | number>>
}

function formatHikayeHaritasi(hh: HikayeHaritasiInput, projeDili: string): string {
  const isTR = projeDili === 'TR'
  const lines: string[] = []

  lines.push(isTR ? `Destanlar: ${hh.destanlar.join(', ')}` : `Epics: ${hh.destanlar.join(', ')}`)
  lines.push('')

  for (const r of ['R1', 'R2', 'R3'] as const) {
    const hikayeler = hh.hikayeler.filter(h => h.surum === r)
    if (!hikayeler.length) continue
    const label = r === 'R1' ? 'MVP'
      : r === 'R2' ? (isTR ? 'İyileştirme' : 'Enhancement')
      : (isTR ? 'Gelişmiş' : 'Advanced')
    lines.push(`${r} — ${label} (${hikayeler.length} ${isTR ? 'hikaye' : 'stories'}):`)
    for (const h of hikayeler) {
      lines.push(`  ${h.no}: ${h.ad}  |  Destan/Epic: ${h.destan}  |  Sprint: ${h.sprint}`)
    }
    lines.push('')
  }

  if (hh.sprintPlani?.length) {
    lines.push(isTR ? 'Sprint Planı:' : 'Sprint Plan:')
    for (const row of hh.sprintPlani) {
      lines.push('  ' + Object.values(row).map(String).join(' | '))
    }
  }

  return lines.join('\n')
}

function kullaniciPrompt(
  projeAdi: string,
  detayliAciklama: string,
  hh: HikayeHaritasiInput,
  projeDili: string,
  dilAdi: string,
): string {
  const isTR = projeDili === 'TR'
  const hikayeMetni = formatHikayeHaritasi(hh, projeDili)

  return isTR
    ? `Aşağıdaki proje için standartlara tam uygun bir iş analizi dokümanı oluştur.
Tüm R1, R2 ve R3 hikayelerini kapsamalı; her hikaye için kullanıcı hikayesi, kapsam tablosu, kabul kriterleri ve iş kuralları içermeli.

Proje Adı: ${projeAdi}
Çıktı Dili: ${dilAdi}

PROJE AÇIKLAMASI:
${detayliAciklama}

HİKAYE HARİTASI:
${hikayeMetni}

Yanıt olarak SADECE markdown formatında dokümanı döndür. JSON, kod bloğu veya ek açıklama ekleme.`
    : `Create a business analysis document fully compliant with the standards for the project below.
Cover all R1, R2, R3 stories; each story must have user story, scope table, acceptance criteria and business rules.

Project Name: ${projeAdi}
Output Language: ${dilAdi}

PROJECT DESCRIPTION:
${detayliAciklama}

STORY MAP:
${hikayeMetni}

Return ONLY the markdown document. No JSON wrapper, no code block, no preamble.`
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeHaritasi?: HikayeHaritasiInput
    projeDili?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayeHaritasi = body.hikayeHaritasi
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const dilAdi = DIL_ETIKET[projeDili] ?? 'English'

  if (!projeAdi || !detayliAciklama || !hikayeHaritasi) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const bugun = new Date().toISOString().split('T')[0]
  const baslik = projeDili === 'TR'
    ? `${projeAdi} — İş Analizi Dokümanı`
    : `${projeAdi} — Business Analysis Document`

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let finishReason: string | null = null
      try {
        const stream = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 32000,
          stream: true,
          system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: kullaniciPrompt(projeAdi, detayliAciklama, hikayeHaritasi, projeDili, dilAdi) }],
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
          if (event.type === 'message_delta') {
            finishReason = event.delta.stop_reason ?? null
          }
        }

        if (finishReason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n\n<!-- TRUNCATED -->'))
        }
      } catch (err) {
        console.error('[is-analizi] stream hatası:', err)
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Baslik': encodeURIComponent(baslik),
      'X-Tarih': bugun,
      'X-Versiyon': '1.0',
    },
  })
}
