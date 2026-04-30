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
  "hikayeHaritasi": {
    "destanlar": ["Destan 1", "Destan 2", "Fonksiyonel Olmayan Gereksinimler", "Geçiş Gereksinimleri"],
    "hikayeler": [
      { "no": "H1", "ad": "hikaye adı ...yapabilme", "destan": "Destan 1", "surum": "R1", "sprint": "S1" }
    ]
  },
  "sprintPlani": [
    { "sprint": "S1", "odakAlani": "Temel altyapı", "hikayeler": "H1, H2, H3", "hikayeSayisi": 3, "sure": "2 hafta" }
  ],
  "genelOzet": [
    { "surum": "R1 — MVP", "hikayeSayisi": 7, "sprintAraligi": "S1 → S2", "sprintSayisi": 2, "sure": "4 hafta" },
    { "surum": "R2 — İyileştirme", "hikayeSayisi": 8, "sprintAraligi": "S3 → S5", "sprintSayisi": 3, "sure": "6 hafta" },
    { "surum": "R3 — Gelişmiş", "hikayeSayisi": 10, "sprintAraligi": "S6 → S8", "sprintSayisi": 3, "sure": "6 hafta" },
    { "surum": "Toplam", "hikayeSayisi": 25, "sprintAraligi": "S1 → S8", "sprintSayisi": 8, "sure": "16 hafta" }
  ]
}

Kurallar:
- "hikayeHaritasi.destanlar" listesinin son iki elemanı her zaman "Fonksiyonel Olmayan Gereksinimler" ve "Geçiş Gereksinimleri" olmalı
- "hikayeler"deki her "destan" değeri "destanlar" listesindeki bir adla birebir eşleşmeli
- "surum": yalnızca "R1", "R2" veya "R3"
- "sprint": "S1", "S2" vb.
- "sprintPlani": standartlardaki Sprint Planı Özeti formatında, her sprint için bir satır
- "genelOzet": standartlardaki Genel Özet Tablosu formatında, R1/R2/R3 ve Toplam satırı`

  try {
    const yanit = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{ type: 'text', text: STANDARTLAR, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: kullaniciPrompt }],
    })

    const ilkBlok = yanit.content[0]
    const text = ilkBlok.type === 'text' ? ilkBlok.text : ''

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'invalid_response' }, { status: 500 })
    }

    const data = JSON.parse(match[0]) as {
      hikayeHaritasi: {
        destanlar: string[]
        hikayeler: Array<{ no: string; ad: string; destan: string; surum: string; sprint: string }>
      }
      sprintPlani: Array<{ sprint: string; odakAlani: string; hikayeler: string; hikayeSayisi: number | string; sure: string }>
      genelOzet: Array<{ surum: string; hikayeSayisi: number | string; sprintAraligi: string; sprintSayisi: number | string; sure: string }>
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
