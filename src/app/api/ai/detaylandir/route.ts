import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SISTEM =
  'Sen bir iş analizi asistanısın. Kullanıcının verdiği proje açıklamasını alarak şu başlıkları içeren detaylı bir proje özeti üret: Proje Amacı, Hedef Kitle, Temel Özellikler, Kısıtlar ve Notlar. Kullanıcının yazdığı dilde yanıt ver — hangi dilde yazdıysa o dilde cevap ver, dili değiştirme.'

export async function POST(req: Request) {
  let body: { aciklama?: string; projeAdi?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const aciklama = (body.aciklama ?? '').trim()
  const projeAdi = (body.projeAdi ?? '').trim()

  if (!aciklama && !projeAdi) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  try {
    const mesaj = [
      projeAdi && `Proje adı: ${projeAdi}`,
      aciklama && `Açıklama: ${aciklama}`,
    ]
      .filter(Boolean)
      .join('\n')

    const yanit = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: mesaj }],
    })

    const ilkBlok = yanit.content[0]
    const detay = ilkBlok.type === 'text' ? ilkBlok.text : ''

    return NextResponse.json({ detay })
  } catch {
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
