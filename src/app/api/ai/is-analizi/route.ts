import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { genel, isAnalizi } from '@/lib/standartlar'

// Tek bir release ~13 hikaye × 800-1000 token = 10-13K token. Sonnet
// ~50-80 tok/s ile üretir → 150-260s. 120s yetmiyordu, 300s güvenli üst sınır.
export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SISTEM = `${genel}\n\n---\n\n${isAnalizi}`

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

type Release = 'R1' | 'R2' | 'R3'
const GECERLI_RELEASE: readonly Release[] = ['R1', 'R2', 'R3']

interface HikayeItem {
  no: string; ad: string; destan: string; surum: string; sprint: string
}

interface HikayeHaritasiInput {
  destanlar: string[]
  hikayeler: HikayeItem[]
  sprintPlani?: Array<Record<string, string | number>>
}

function releaseLabel(release: Release, projeDili: string): string {
  const isTR = projeDili === 'TR'
  if (release === 'R1') return 'MVP'
  if (release === 'R2') return isTR ? 'İyileştirme' : 'Enhancement'
  return isTR ? 'Gelişmiş' : 'Advanced'
}

function formatReleaseHikayeleri(
  hh: HikayeHaritasiInput,
  release: Release,
  projeDili: string,
): string {
  const isTR = projeDili === 'TR'
  const hikayeler = hh.hikayeler.filter(h => h.surum === release)
  const lines: string[] = []
  lines.push(isTR ? `Destanlar: ${hh.destanlar.join(', ')}` : `Epics: ${hh.destanlar.join(', ')}`)
  lines.push('')
  const label = releaseLabel(release, projeDili)
  lines.push(`${release} — ${label} (${hikayeler.length} ${isTR ? 'hikaye' : 'stories'}):`)
  for (const h of hikayeler) {
    lines.push(`  ${h.no}: ${h.ad}  |  Destan/Epic: ${h.destan}  |  Sprint: ${h.sprint}`)
  }
  return lines.join('\n')
}

function kullaniciPrompt(
  projeAdi: string,
  detayliAciklama: string,
  hh: HikayeHaritasiInput,
  projeDili: string,
  dilAdi: string,
  release: Release,
  acBaslangic: number,
  brBaslangic: number,
): string {
  const isTR = projeDili === 'TR'
  const hikayeMetni = formatReleaseHikayeleri(hh, release, projeDili)
  const label = releaseLabel(release, projeDili)

  // Ekran notunu yalnızca son release (R3) sonunda istiyoruz — aksi halde
  // her bölümde tekrar eder.
  const ekranNotu =
    release === 'R3'
      ? isTR
        ? `\n\nBu bölümün en sonuna, tüm hikayelerden sonra şu notu ekle:\n> **Ekran Tasarımları:** Bu dokümanda ekran mockup'ı yer almamaktadır. Tüm ekran tasarımları için KurgemX'te üretilen prototipe bakınız.`
        : `\n\nAt the very end of this section, after all stories, include this note:\n> **Screen Designs:** This document does not include screen mockups. For all screen designs, refer to the prototype generated in KurgemX.`
      : ''

  const numerasyon = isTR
    ? `\n\nNUMARALANDIRMA KURALI:\n- Kabul kriterleri (AC) numaraları AC-${acBaslangic}'dan başla, sırayla artır.\n- İş kuralı (BR) numaraları BR-${brBaslangic}'dan başla, sırayla artır.\n- ST (hikaye) numaraları hikaye haritasındaki değerlerle aynı kalır, değiştirme.`
    : `\n\nNUMBERING RULE:\n- Acceptance criteria (AC) numbers start at AC-${acBaslangic} and increment sequentially.\n- Business rule (BR) numbers start at BR-${brBaslangic} and increment sequentially.\n- ST (story) numbers must match the story map exactly — do not change them.`

  const kapsamDirektifi = isTR
    ? `\n\nBu yanıt SADECE ${release} — ${label} bölümünü içerir. Doküman başlığı, kapak, içindekiler veya diğer release'lere referans YAZMA. Yalnızca bu bölümün başlığıyla başla (örn: "## ${release} — ${label}") ve hikayeleri yaz.`
    : `\n\nThis response covers ONLY the ${release} — ${label} section. Do NOT write a document title, cover page, table of contents or references to other releases. Start directly with this section's heading (e.g., "## ${release} — ${label}") followed by the stories.`

  return isTR
    ? `Aşağıdaki proje için SADECE ${release} — ${label} sürümünün iş analizi bölümünü oluştur.
Sadece bu release'in hikayelerini işle; her hikaye için kullanıcı hikayesi, kabul kriterleri ve iş kuralları içersin.${kapsamDirektifi}${numerasyon}${ekranNotu}

Proje Adı: ${projeAdi}
Çıktı Dili: ${dilAdi}

PROJE AÇIKLAMASI:
${detayliAciklama}

${release} HİKAYELERİ:
${hikayeMetni}

Yanıt olarak SADECE markdown formatında bu bölümü döndür. JSON, kod bloğu veya ek açıklama ekleme.`
    : `Create the business analysis section for ONLY the ${release} — ${label} release of the project below.
Cover only this release's stories; each story must have user story, acceptance criteria and business rules.${kapsamDirektifi}${numerasyon}${ekranNotu}

Project Name: ${projeAdi}
Output Language: ${dilAdi}

PROJECT DESCRIPTION:
${detayliAciklama}

${release} STORIES:
${hikayeMetni}

Return ONLY the markdown for this section. No JSON wrapper, no code block, no preamble.`
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeHaritasi?: HikayeHaritasiInput
    projeDili?: string
    release?: Release
    acBaslangic?: number
    brBaslangic?: number
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
  const release = body.release
  const acBaslangic = Math.max(1, Math.floor(body.acBaslangic ?? 1))
  const brBaslangic = Math.max(1, Math.floor(body.brBaslangic ?? 1))
  const dilAdi = DIL_ETIKET[projeDili] ?? 'English'

  if (!projeAdi || !detayliAciklama || !hikayeHaritasi || !release) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }
  if (!GECERLI_RELEASE.includes(release)) {
    return NextResponse.json({ error: 'invalid_release', detail: `release '${release}' must be R1|R2|R3` }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const bugun = new Date().toISOString().split('T')[0]
  const baslik = projeDili === 'TR'
    ? `${projeAdi} — İş Analizi Dokümanı`
    : `${projeAdi} — Business Analysis Document`

  const encoder = new TextEncoder()
  const userPromptText = kullaniciPrompt(
    projeAdi, detayliAciklama, hikayeHaritasi, projeDili, dilAdi,
    release, acBaslangic, brBaslangic,
  )

  const readable = new ReadableStream({
    async start(controller) {
      let accumulated = ''
      let finishReason: string | null = null
      try {
        const stream = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 16000,
          stream: true,
          system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userPromptText }],
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            accumulated += chunk
            controller.enqueue(encoder.encode(chunk))
          }
          if (event.type === 'message_delta') {
            finishReason = event.delta.stop_reason ?? null
          }
        }

        // Üretilen içerikten son AC ve BR numaralarını çıkar — bir sonraki
        // release çağrısı bu değerleri acBaslangic / brBaslangic olarak kullanır.
        const acMatches = [...accumulated.matchAll(/\bAC-(\d+)\b/g)].map(m => Number(m[1]))
        const brMatches = [...accumulated.matchAll(/\bBR-(\d+)\b/g)].map(m => Number(m[1]))
        const sonAC = acMatches.length ? Math.max(...acMatches) : acBaslangic - 1
        const sonBR = brMatches.length ? Math.max(...brMatches) : brBaslangic - 1

        // NOT: Web Streams API'da response header'ları body başlamadan kilitlenir;
        // stream tamamlandıktan sonra eklenemez. Bu yüzden son AC/BR numaralarını
        // stream'in EN SONUNA özel bir HTML yorumu olarak gömüyoruz. Client bunu
        // parse edip gösterimden önce strip ediyor.
        const meta = JSON.stringify({ sonAC, sonBR, finishReason })
        controller.enqueue(encoder.encode(`\n<!-- META ${meta} -->\n`))

        if (finishReason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n<!-- TRUNCATED -->\n'))
        }

        console.log(
          `[is-analizi] release=${release} finish=${finishReason} sonAC=${sonAC} sonBR=${sonBR} len=${accumulated.length}`,
        )
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
      'X-Release': release,
    },
  })
}
