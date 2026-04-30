import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const STANDARTLAR = (() => {
  const genel = fs.readFileSync(path.join(process.cwd(), 'standartlar/genel.md'), 'utf-8')
  const hikayeHaritasi = fs.readFileSync(
    path.join(process.cwd(), 'standartlar/hikaye_haritasi.md'),
    'utf-8'
  )
  return `${genel}\n\n---\n\n${hikayeHaritasi}`
})()

export async function POST(req: Request) {
  let body: { projeAdi?: string; detayliAciklama?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()

  if (!projeAdi || !detayliAciklama) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const kullaniciPrompt = `Aşağıdaki proje için hikaye haritası oluştur.

Proje Adı: ${projeAdi}
Detaylı Açıklama: ${detayliAciklama}

Yalnızca aşağıdaki JSON yapısını döndür. Markdown kod bloğu, ön yazı veya ek açıklama ekleme — sadece JSON:
{
  "destanlar": ["Destan Adı 1", "Destan Adı 2"],
  "hikayeler": [
    { "no": "H1", "ad": "hikaye adı ...yapabilme", "destan": "Destan Adı veya non_functional veya transition", "surum": "R1", "sprint": "S1" }
  ]
}

Kurallar:
- "destanlar" listesine yalnızca dinamik destanları ekle; "Fonksiyonel Olmayan Gereksinimler" ve "Geçiş Gereksinimleri" destanlarını buraya ekleme
- "destan" değeri ya "destanlar" listesindeki bir ad olmalı ya da sabit: "non_functional" (Fonk. Olmayan Gereksinimler) veya "transition" (Geçiş Gereksinimleri)
- "surum": yalnızca "R1", "R2" veya "R3"
- "sprint": "S1", "S2" vb.`

  try {
    const yanit = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: STANDARTLAR, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: kullaniciPrompt }],
    })

    const ilkBlok = yanit.content[0]
    const text = ilkBlok.type === 'text' ? ilkBlok.text : ''

    // JSON'u çıkar — Claude bazen kod bloğuna sarabilir
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'invalid_response' }, { status: 500 })
    }

    const data = JSON.parse(match[0]) as {
      destanlar: string[]
      hikayeler: Array<{
        no: string
        ad: string
        destan: string
        surum: string
        sprint: string
      }>
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
