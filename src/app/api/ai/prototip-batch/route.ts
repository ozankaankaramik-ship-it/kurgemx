import Anthropic from '@anthropic-ai/sdk'
import { SISTEM } from '@/lib/prototip-helpers'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 })

interface BatchScreen { id: string; name: string }

export async function POST(req: Request) {
  let body: {
    ekranlar?: BatchScreen[]
    skeletonCSS?: string
    projeAdi?: string
    detayliAciklama?: string
    hikayelerMetni?: string
    projeDili?: string
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 })
  }

  const ekranlar = body.ekranlar ?? []
  const skeletonCSS = (body.skeletonCSS ?? '').trim()
  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayelerMetni = (body.hikayelerMetni ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const isTR = projeDili === 'TR'

  if (!projeAdi || !detayliAciklama || ekranlar.length === 0) {
    return Response.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const screenList = ekranlar.map(e => `- ${e.id}: ${e.name}`).join('\n')
  const cssSection = skeletonCSS ? `\nMevcut CSS:\n${skeletonCSS}\n` : ''

  const prompt = isTR
    ? `Proje: ${projeAdi}
Açıklama: ${detayliAciklama}
Çıktı dili: Türkçe

Hikayeler:
${hikayelerMetni}
${cssSection}
Aşağıdaki ekranların iç HTML içeriğini üret. Hikayenin işlevine uygun UI kullan:
- Liste/tablo → veri tablosu (prototip.md tablo stili)
- Form → doldurulabilir form (prototip.md form stili)
- Detay → detay kartı
- Dashboard → özet kartlar

SADECE şu formatta döndür — başka açıklama ekleme:

SCREEN:[screen-id]
[ekranın iç HTML içeriği — wrapper div hariç, direkt içerik elementleri]
/SCREEN

Ekranlar:
${screenList}

Kurallar:
- Prototip.md tasarım standardına uy (renkler, butonlar, tablolar)
- Gerçekçi Türkçe örnek veriler kullan
- Her ekran bağımsız çalışmalı`
    : `Project: ${projeAdi}
Description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}
${cssSection}
Generate the inner HTML content for the following screens. Use appropriate UI for each screen's function:
- List/table → data table (prototip.md table style)
- Form → fillable form (prototip.md form style)
- Detail → detail card
- Dashboard → summary cards

Return ONLY in this exact format — no other text:

SCREEN:[screen-id]
[screen inner HTML content — no wrapper div, just the content elements]
/SCREEN

Screens:
${screenList}

Rules:
- Follow prototip.md design standards (colors, buttons, tables)
- Use realistic English example data
- Each screen must work independently`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20000,
      system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })

    console.log(
      '[prototip-batch] stop_reason:', response.stop_reason,
      'output_tokens:', response.usage?.output_tokens,
      'screens:', ekranlar.map(e => e.id).join(','),
    )

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const screens: Record<string, string> = {}
    const re = /SCREEN:([A-Za-z0-9_-]+)\n([\s\S]*?)\/SCREEN/g
    let m
    while ((m = re.exec(raw)) !== null) {
      screens[m[1].trim()] = m[2].trim()
    }

    const failedScreens = ekranlar.map(e => e.id).filter(id => !(id in screens))
    if (failedScreens.length > 0) {
      console.warn('[prototip-batch] parse edilemeyen ekranlar:', failedScreens.join(','))
    }

    return Response.json({ screens, failedScreens })
  } catch (err) {
    console.error('[prototip-batch] HATA:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'generation_failed' }, { status: 500 })
  }
}
