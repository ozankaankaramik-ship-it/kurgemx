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

  if (projeDili === 'TR') {
    return (
      `DİL VE ANAHTAR KURALI: Tüm içerik Türkçe üretilir.\n` +
      `- Sabit JSON anahtarları (değiştirme): ${fixedKeys}\n` +
      `- sprintPlani dizi objelerinde: sprint, odakAlani, hikayeler, hikayeSayisi, sure\n` +
      `- genelOzet dizi objelerinde: surum, hikayeSayisi, sprintAraligi, sprintSayisi, sure`
    )
  }

  return (
    `LANGUAGE AND KEY RULE: All content in ${dilAdi}.\n` +
    `- Fixed JSON keys (do not rename): ${fixedKeys}\n` +
    `- For sprintPlani array objects use: sprint, focus, stories, numberOfStories, duration\n` +
    `- For genelOzet array objects use: release, numberOfStories, sprints, numberOfSprints, duration\n` +
    `- The last genelOzet row (totals) must have "Total" as its release value so it can be detected.`
  )
}

function kullaniciPromptOlustur(
  projeAdi: string,
  detayliAciklama: string,
  projeDili: string,
  dilAdi: string,
): string {
  const isTR = projeDili === 'TR'

  const sprintOrnek = isTR
    ? `{ "sprint": "SP1", "odakAlani": "Temel altyapı", "hikayeler": "ST1, ST2, ST3", "hikayeSayisi": 3, "sure": "2 hafta" }`
    : `{ "sprint": "SP1", "focus": "Core infrastructure", "stories": "ST1, ST2, ST3", "numberOfStories": 3, "duration": "2 weeks" }`

  const ozetOrnekler = isTR
    ? [
        `{ "surum": "R1 — MVP", "hikayeSayisi": 7, "sprintAraligi": "SP1 → SP2", "sprintSayisi": 2, "sure": "4 hafta" }`,
        `{ "surum": "R2 — İyileştirme", "hikayeSayisi": 8, "sprintAraligi": "SP3 → SP5", "sprintSayisi": 3, "sure": "6 hafta" }`,
        `{ "surum": "R3 — Gelişmiş", "hikayeSayisi": 10, "sprintAraligi": "SP6 → SP8", "sprintSayisi": 3, "sure": "6 hafta" }`,
        `{ "surum": "Toplam", "hikayeSayisi": 25, "sprintAraligi": "SP1 → SP8", "sprintSayisi": 8, "sure": "16 hafta" }`,
      ]
    : [
        `{ "release": "R1 — MVP", "numberOfStories": 7, "sprints": "SP1 → SP2", "numberOfSprints": 2, "duration": "4 weeks" }`,
        `{ "release": "R2 — Improvement", "numberOfStories": 8, "sprints": "SP3 → SP5", "numberOfSprints": 3, "duration": "6 weeks" }`,
        `{ "release": "R3 — Advanced", "numberOfStories": 10, "sprints": "SP6 → SP8", "numberOfSprints": 3, "duration": "6 weeks" }`,
        `{ "release": "Total", "numberOfStories": 25, "sprints": "SP1 → SP8", "numberOfSprints": 8, "duration": "16 weeks" }`,
      ]

  const dilNotu = isTR
    ? `Çıktı Dili: Türkçe`
    : `Output Language: ${dilAdi}`

  return `Aşağıdaki proje için hikaye haritası oluştur.

Proje Adı: ${projeAdi}
Detaylı Açıklama: ${detayliAciklama}
${dilNotu}

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
  let body: { projeAdi?: string; detayliAciklama?: string; projeDili?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const dilAdi = DIL_ETIKET[projeDili] ?? 'English'

  if (!projeAdi || !detayliAciklama) {
    return NextResponse.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const kullaniciPrompt = kullaniciPromptOlustur(projeAdi, detayliAciklama, projeDili, dilAdi)

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
