import Anthropic from '@anthropic-ai/sdk'
import { genel, prototip as prototipStandart } from '@/lib/standartlar'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SISTEM_EK = `

Minimal ve sade HTML üret.
Gereksiz CSS animasyonu ekleme.
Her ekran için sadece o hikayeye ait UI elemanlarını üret.
JavaScript sadece navigasyon ve form simülasyonu için kullan.
Inline style yerine CSS class kullan.`

const SISTEM = `${genel}\n\n${prototipStandart}${SISTEM_EK}`

const MAX_TOKENS: Record<string, number> = {
  Küçük: 10000,
  Orta: 20000,
  Büyük: 32000,
}

interface HikayeItem {
  no: string
  ad: string
  destan: string
  surum: string
  sprint: string
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeler?: HikayeItem[]
    positiveAcler?: Record<string, string[]>
    projeDili?: string
    projeBuyuklugu?: string
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_body' }), { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayeler = body.hikayeler ?? []
  const positiveAcler = body.positiveAcler ?? {}
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const projeBuyuklugu = (body.projeBuyuklugu ?? 'Orta').trim()
  const isTR = projeDili === 'TR'
  const maxTokens = MAX_TOKENS[projeBuyuklugu] ?? 20000

  if (!projeAdi || !detayliAciklama || hikayeler.length === 0) {
    return new Response(JSON.stringify({ error: 'empty_input' }), { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'api_key_missing' }), { status: 500 })
  }

  const hikayelerMetni = hikayeler
    .map(h => {
      const aclar = positiveAcler[h.no]
      const acMetni = aclar && aclar.length > 0
        ? `\n  Positive ACs: ${aclar.join(' | ')}`
        : ''
      return `- ${h.no} | ${h.ad} | ${isTR ? 'Destan' : 'Epic'}: ${h.destan} | ${h.surum} | ${h.sprint}${acMetni}`
    })
    .join('\n')

  const kullaniciPrompt = isTR
    ? `Proje adı: ${projeAdi}
Detaylı açıklama: ${detayliAciklama}
Çıktı dili: Türkçe

Hikayeler:
${hikayelerMetni}

Prototip.md standartlarına uygun, tüm hikayeler için tek bir standalone HTML dosyası üret.
Tüm CSS ve JavaScript satır içinde olsun — dış bağımlılık olmadan çalışsın.

Navigasyon ve Ekran Kuralları:
- Sol menüde maksimum 10 öğe göster; menü gruplandırmasını mantıksal olarak yap (destanlara birebir uymak zorunda değil)
- İlgili hikayeler tek ekranda birleştirilebilir — her hikaye için ayrı ekran zorunlu değil
- Bir ekran birden fazla hikayeyi kapsayabilir; bir hikaye birden fazla ekrana yayılabilir
- Sayfanın altında footer görünür olsun: sol tarafta bugünün tarihi, sağ tarafta "KurgemX" yazısı
- KRİTİK: Her nav-item'ın onclick'inde kullandığı screen ID ile tam olarak eşleşen id'ye sahip bir div.screen elementi MUTLAKA bulunmalıdır. Menüde listelenen her ekran için içerik div'i üretilmeli, hiçbir ekran atlanmamalı

Yalnızca HTML döndür — açıklama veya markdown kod bloğu ekleme.`
    : `Project name: ${projeAdi}
Detailed description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}

Generate a single standalone HTML file following prototip.md standards for all stories.
All CSS and JavaScript must be inline — no external dependencies.

Navigation and Screen Rules:
- Show maximum 10 items in the sidebar; group navigation logically (does not need to mirror epics exactly)
- Related stories can be combined on a single screen — a separate screen per story is not required
- One screen can cover multiple stories; one story can span multiple screens
- Footer must be visible at the bottom: today's date on the left, "KurgemX" on the right
- CRITICAL: Every nav-item's onclick screen ID MUST have a matching div.screen element with that exact id. Generate a content div for every screen listed in the sidebar — no screen may be omitted

Return only HTML — no explanation or markdown code block.`

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: [
        { type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: kullaniciPrompt }],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[prototip] API hatası:', err)
    return new Response(JSON.stringify({ error: 'api_error', detail: String(err) }), { status: 500 })
  }
}
