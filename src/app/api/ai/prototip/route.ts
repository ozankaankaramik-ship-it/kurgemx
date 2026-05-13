import Anthropic from '@anthropic-ai/sdk'
import { genel, prototip as prototipStandart } from '@/lib/standartlar'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SISTEM = `${genel}\n\n${prototipStandart}`

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
  const isTR = projeDili === 'TR'

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
Sol menüde destanlar ana başlık, her destanın altında hikayeleri tıklanabilir bağlantı olarak listele.
Tüm CSS ve JavaScript satır içinde olsun — dış bağımlılık olmadan çalışsın.
Yalnızca HTML döndür — açıklama veya markdown kod bloğu ekleme.`
    : `Project name: ${projeAdi}
Detailed description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}

Generate a single standalone HTML file following prototip.md standards for all stories.
Left sidebar lists epics as headings with their stories as clickable links underneath.
All CSS and JavaScript must be inline — no external dependencies.
Return only HTML — no explanation or markdown code block.`

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 32000,
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
