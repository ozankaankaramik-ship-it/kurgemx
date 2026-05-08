import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { genel, hikayeHaritasi } from '@/lib/standartlar'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SISTEM = `${genel}\n\n${hikayeHaritasi}`

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

function dilKurali(projeDili: string, dilAdi: string): string {
  const fixedKeys = 'hikayeHaritasi, destanlar, hikayeler, no, ad, destan, surum, sprint'
  const firstOzetKey = projeDili === 'TR' ? '"Sürüm"' : '"Release"'
  const totalValue = projeDili === 'TR' ? '"Toplam"' : '"Total"'

  const kurallar = [
    `- Sabit JSON anahtarları (değiştirme): ${fixedKeys}`,
    `- sprintPlani objelerinde key isimleri tam olarak şunlar olsun (sırayla): "Sprint", "Focus", "Stories", "Story Count", "Duration"`,
    `- genelOzet objelerinde key isimleri tam olarak şunlar olsun (sırayla): ${firstOzetKey}, "Story Count", "Sprint Range", "Sprint Count", "Duration"`,
    `- genelOzet son satırının (toplamlar) ${firstOzetKey} değeri ${totalValue} olmalı`,
    `- Tüm metin değerleri ${dilAdi} dilinde üretilir`,
    `- Key isimleri camelCase veya teknik değil — doğal dil ifadeler (zaten yukarıda belirtildi)`,
  ].join('\n')

  if (projeDili === 'TR') {
    return `DİL VE ANAHTAR KURALI: Tüm içerik Türkçe üretilir.\n${kurallar}`
  }
  return `LANGUAGE AND KEY RULE: All content in ${dilAdi}.\n${kurallar}`
}

function buyuklukKurali(projeBuyuklugu: string | null, projeDili: string): string {
  if (!projeBuyuklugu) return ''
  const isTR = projeDili === 'TR'
  const sinir =
    projeBuyuklugu === 'Küçük' ? (isTR ? 'en fazla 5 hikaye' : 'maximum 5 stories') :
    projeBuyuklugu === 'Orta'  ? (isTR ? 'en fazla 15 hikaye' : 'maximum 15 stories') :
                                  (isTR ? 'en fazla 40 hikaye' : 'maximum 40 stories')
  return isTR
    ? `\nProje Büyüklüğü: ${projeBuyuklugu} — Hikaye sayısı sınırı: ${sinir}\n`
    : `\nProject Size: ${projeBuyuklugu} — Story count limit: ${sinir}\n`
}

function kullaniciPromptOlustur(
  projeAdi: string,
  detayliAciklama: string,
  projeDili: string,
  dilAdi: string,
  projeBuyuklugu: string | null,
): string {
  const isTR = projeDili === 'TR'
  const versionKey = isTR ? 'Sürüm' : 'Release'
  const totalValue = isTR ? 'Toplam' : 'Total'
  const weekUnit = isTR ? 'hafta' : 'weeks'

  const sprintOrnek =
    `{ "Sprint": "SP1", "Focus": "${isTR ? 'Temel altyapı' : 'Core infrastructure'}", "Stories": "ST1, ST2, ST3", "Story Count": 3, "Duration": "2 ${weekUnit}" }`

  const ozetOrnekler = [
    `{ "${versionKey}": "R1 — MVP", "Story Count": 7, "Sprint Range": "SP1 → SP2", "Sprint Count": 2, "Duration": "4 ${weekUnit}" }`,
    `{ "${versionKey}": "${isTR ? 'R2 — İyileştirme' : 'R2 — Improvement'}", "Story Count": 8, "Sprint Range": "SP3 → SP5", "Sprint Count": 3, "Duration": "6 ${weekUnit}" }`,
    `{ "${versionKey}": "${isTR ? 'R3 — Gelişmiş' : 'R3 — Advanced'}", "Story Count": 10, "Sprint Range": "SP6 → SP8", "Sprint Count": 3, "Duration": "6 ${weekUnit}" }`,
    `{ "${versionKey}": "${totalValue}", "Story Count": 25, "Sprint Range": "SP1 → SP8", "Sprint Count": 8, "Duration": "16 ${weekUnit}" }`,
  ]

  return `Aşağıdaki proje için hikaye haritası oluştur.${buyuklukKurali(projeBuyuklugu, projeDili)}
Proje Adı: ${projeAdi}
Detaylı Açıklama: ${detayliAciklama}
Çıktı Dili: ${dilAdi}

Yalnızca aşağıdaki JSON yapısını döndür. Markdown kod bloğu, ön yazı veya ek açıklama ekleme — sadece JSON:
{
  "hikayeHaritasi": {
    "destanlar": ["Destan 1", "Destan 2"],
    "hikayeler": [
      { "no": "ST1", "ad": "hikaye adı", "destan": "Destan 1", "surum": "R1", "sprint": "SP1" }
    ]
  },
  "sprintPlani": [
    ${sprintOrnek}
  ],
  "genelOzet": [
    ${ozetOrnekler.join(',\n    ')}
  ]
}`
}

export async function POST(req: Request) {
  let body: { projeAdi?: string; detayliAciklama?: string; projeDili?: string; projeBuyuklugu?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const projeBuyuklugu = body.projeBuyuklugu ?? null
  const dilAdi = DIL_ETIKET[projeDili] ?? 'English'

  if (!projeAdi || !detayliAciklama) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const kullaniciPrompt = kullaniciPromptOlustur(projeAdi, detayliAciklama, projeDili, dilAdi, projeBuyuklugu)

  try {
    const yanit = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        { type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: dilKurali(projeDili, dilAdi) },
      ],
      messages: [{ role: 'user', content: kullaniciPrompt }],
    })

    const ilkBlok = yanit.content[0]
    const rawText = ilkBlok.type === 'text' ? ilkBlok.text : ''

    console.error('[hikaye-haritasi] raw response:', rawText)

    const first = rawText.indexOf('{')
    const last = rawText.lastIndexOf('}')
    if (first === -1 || last === -1 || last <= first) {
      console.error('[hikaye-haritasi] JSON sınırı bulunamadı')
      return NextResponse.json({ error: 'no_json_found', rawText }, { status: 500 })
    }

    const jsonText = rawText.slice(first, last + 1)

    let data: {
      hikayeHaritasi: {
        destanlar: string[]
        hikayeler: Array<{ no: string; ad: string; destan: string; surum: string; sprint: string }>
      }
      sprintPlani: Array<Record<string, string | number>>
      genelOzet: Array<Record<string, string | number>>
    }

    try {
      data = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('[hikaye-haritasi] JSON parse hatası:', parseErr, '\njsonText:', jsonText)
      return NextResponse.json(
        { error: 'json_parse_failed', parseError: String(parseErr), jsonText },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[hikaye-haritasi] API hatası:', err)
    return NextResponse.json({ error: 'api_error', detail: String(err) }, { status: 500 })
  }
}
