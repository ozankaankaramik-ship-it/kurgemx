import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000 })

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

const GECERLI_BUYUKLUK = ['Küçük', 'Orta', 'Büyük'] as const
type ProjeBuyuklugu = typeof GECERLI_BUYUKLUK[number]

function sistemPrompt(projeDili: string): string {
  const dil = DIL_ETIKET[projeDili] ?? projeDili
  return `Sen bir iş analizi asistanısın. Kullanıcının verdiği proje bilgilerine göre iki şeyi belirle:

1. Detaylı proje özeti: Proje Amacı, Hedef Kitle, Temel Özellikler, Kısıtlar ve Notlar başlıklarını içeren bir özet üret. Tüm metni ${dil} dilinde yaz. Markdown kullanma — sadece düz metin, başlık karakteri (#) yok.

2. Proje büyüklüğü ve hikaye sayısı tahmini:
   - Küçük: 1–5 hikaye, 1 hafta – 2 ay (mevcut ürüne yeni özellik veya MVP odaklı küçük ürün)
   - Orta: 6–15 hikaye, 2 ay – 4 ay (çok modüllü, birden fazla kullanıcı rolü)
   - Büyük: 16–40 hikaye, 4 ay ve üzeri (kurumsal ürün, birden fazla release)

Çıktı sırası — başka hiçbir şey ekleme:
a) Düz metin proje özeti (birden fazla paragraf, Markdown yok)
b) Metnin sonunda, yeni satırda SADECE şu satırı yaz:
<!-- META {"projeBuyuklugu":"Orta","hikayeSayisiTahmini":8} -->`
}

export async function POST(req: Request) {
  let body: { aciklama?: string; projeAdi?: string; projeDili?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const aciklama = (body.aciklama ?? '').trim()
  const projeAdi = (body.projeAdi ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()

  if (!aciklama && !projeAdi) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const mesaj = [
    projeAdi && `Proje adı: ${projeAdi}`,
    aciklama && `Açıklama: ${aciklama}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: [{ type: 'text', text: sistemPrompt(projeDili), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: mesaj }],
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
  } catch {
    return NextResponse.json({ error: 'ai_error' }, { status: 500 })
  }
}

// Dışa aktarılan tip — Adim1Formu tarafından kullanılır
export type { ProjeBuyuklugu }
