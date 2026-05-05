import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

function sistemPrompt(projeDili: string): string {
  const dil = DIL_ETIKET[projeDili] ?? projeDili
  return `Sen bir iş analizi asistanısın. Kullanıcının verdiği proje açıklamasını alarak şu başlıkları içeren detaylı bir proje özeti üret: Proje Amacı, Hedef Kitle, Temel Özellikler, Kısıtlar ve Notlar. Tüm çıktıları ${dil} dilinde üret. Çıktının sonuna asistan adı, imza, dipnot veya herhangi bir ek satır ekleme.`
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

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          stream: true,
          system: [{ type: 'text', text: sistemPrompt(projeDili), cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: mesaj }],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
