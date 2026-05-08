import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

const GECERLI_BUYUKLUK = ['Küçük', 'Orta', 'Büyük'] as const
type ProjeBuyuklugu = typeof GECERLI_BUYUKLUK[number]

function sistemPrompt(projeDili: string): string {
  const dil = DIL_ETIKET[projeDili] ?? projeDili
  return `Sen bir iş analizi asistanısın. Kullanıcının verdiği proje bilgilerine göre iki şeyi belirle:

1. Detaylı proje özeti: Proje Amacı, Hedef Kitle, Temel Özellikler, Kısıtlar ve Notlar başlıklarını içeren bir özet üret. Tüm metni ${dil} dilinde yaz. Markdown kullanma.

2. Proje büyüklüğü: Aşağıdaki tabloya göre belirle:
   - Küçük: 1–5 hikaye, 1 hafta – 2 ay (mevcut ürüne yeni özellik veya MVP odaklı küçük ürün)
   - Orta: 6–15 hikaye, 2 ay – 4 ay (çok modüllü, birden fazla kullanıcı rolü)
   - Büyük: 16–40 hikaye, 4 ay ve üzeri (kurumsal ürün, birden fazla release)

Yanıtını YALNIZCA aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:
{"detay":"...","projeBuyuklugu":"Küçük","hikayeSayisiTahmini":3}`
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
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: [{ type: 'text', text: sistemPrompt(projeDili), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: mesaj }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'parse_error' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      detay: string
      projeBuyuklugu: ProjeBuyuklugu
      hikayeSayisiTahmini: number
    }

    if (!GECERLI_BUYUKLUK.includes(parsed.projeBuyuklugu)) {
      parsed.projeBuyuklugu = 'Orta'
    }
    if (!Number.isFinite(parsed.hikayeSayisiTahmini) || parsed.hikayeSayisiTahmini < 1) {
      parsed.hikayeSayisiTahmini = 5
    }

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'ai_error' }, { status: 500 })
  }
}
