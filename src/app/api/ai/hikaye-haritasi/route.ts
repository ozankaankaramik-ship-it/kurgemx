import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { genel, hikayeHaritasi } from '@/lib/standartlar'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000 })

const SISTEM = `${genel}\n\n${hikayeHaritasi}`

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

function dilKurali(projeDili: string, dilAdi: string): string {
  const fixedKeys = 'kullanicilar, kod, tip, aciklama, hikayeHaritasi, destanlar, hikayeler, no, ad, destan, surum, kullanici_kodlari'
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
  "kullanicilar": [
    { "kod": "U1", "tip": "${isTR ? 'Son Kullanıcı' : 'End User'}", "aciklama": "${isTR ? 'Açıklama' : 'Description'}" }
  ],
  "hikayeHaritasi": {
    "destanlar": ["Destan 1", "Destan 2"],
    "hikayeler": [
      { "no": "ST1", "ad": "hikaye adı", "destan": "Destan 1", "surum": "R1", "kullanici_kodlari": ["U1"] }
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

  // Tool use ile structured output: Claude'un JSON üretirken virgül/quote
  // atlaması gibi hataları imkansız hale gelir, çıktı schema'ya uymak
  // zorunda. Eskiden serbest metinde JSON parse hatası alıyorduk.
  const versionKey = projeDili === 'TR' ? 'Sürüm' : 'Release'
  const tool = {
    name: 'hikaye_haritasi_olustur',
    description:
      projeDili === 'TR'
        ? 'Proje için hikaye haritası, sprint planı ve genel özet üretir.'
        : 'Produces story map, sprint plan and general summary for the project.',
    input_schema: {
      type: 'object' as const,
      properties: {
        kullanicilar: {
          type: 'array',
          description: projeDili === 'TR'
            ? 'Projeyi kullanan kullanıcı tipleri (U1, U2...). Ürün Sahibi/İş Analisti/Geliştirici dahil edilmez.'
            : 'User types that use the solution (U1, U2...). Product Owner/Business Analyst/Developer excluded.',
          items: {
            type: 'object',
            properties: {
              kod:      { type: 'string', description: 'U1, U2, U3 ...' },
              tip:      { type: 'string', description: projeDili === 'TR' ? 'Rol adı' : 'Role name' },
              aciklama: { type: 'string', description: projeDili === 'TR' ? 'Bu kullanıcının sistemle ne yaptığı' : 'What this user does with the system' },
            },
            required: ['kod', 'tip', 'aciklama'],
          },
        },
        hikayeHaritasi: {
          type: 'object',
          properties: {
            destanlar: { type: 'array', items: { type: 'string' } },
            hikayeler: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  no: { type: 'string', description: 'ST1, ST2 ...' },
                  ad: { type: 'string' },
                  destan: { type: 'string' },
                  surum: { type: 'string', enum: ['R1', 'R2', 'R3'] },
                  kullanici_kodlari: { type: 'array', items: { type: 'string' }, description: 'e.g. ["U1"] or ["U1","U2"]' },
                },
                required: ['no', 'ad', 'destan', 'surum', 'kullanici_kodlari'],
              },
            },
          },
          required: ['destanlar', 'hikayeler'],
        },
        sprintPlani: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              Sprint: { type: 'string' },
              Focus: { type: 'string' },
              Stories: { type: 'string', description: 'ST1, ST2, ST3' },
              'Story Count': { type: 'number' },
              Duration: { type: 'string' },
            },
            required: ['Sprint', 'Focus', 'Stories', 'Story Count', 'Duration'],
          },
        },
        genelOzet: {
          type: 'array',
          description: `Last item must be the totals row with ${versionKey}="${projeDili === 'TR' ? 'Toplam' : 'Total'}"`,
          items: {
            type: 'object',
            properties: {
              [versionKey]: { type: 'string' },
              'Story Count': { type: 'number' },
              'Sprint Range': { type: 'string' },
              'Sprint Count': { type: 'number' },
              Duration: { type: 'string' },
            },
            required: [versionKey, 'Story Count', 'Sprint Range', 'Sprint Count', 'Duration'],
          },
        },
      },
      required: ['kullanicilar', 'hikayeHaritasi', 'sprintPlani', 'genelOzet'],
    },
  }

  try {
    const yanit = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: [
        { type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: dilKurali(projeDili, dilAdi) },
      ],
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: kullaniciPrompt }],
    })

    // Bilgilendirme amaçlı log — başarılı durumda da yazılıyor; console.log
    // kullanılıyor ki Vercel logs'ta hata seviyesinde görünmesin.
    console.log('[hikaye-haritasi] stop_reason:', yanit.stop_reason, 'usage:', yanit.usage)

    if (yanit.stop_reason === 'max_tokens') {
      console.error('[hikaye-haritasi] UYARI: yanıt max_tokens ile kesildi')
      return NextResponse.json(
        {
          error: 'max_tokens_truncated',
          detail:
            'AI yanıtı token limitine takıldı. Lütfen tekrar deneyin veya proje büyüklüğünü daha küçük seçin.',
        },
        { status: 500 }
      )
    }

    // Tool use bloğunu bul — tool_choice forced olduğu için her zaman olmalı
    const toolBlock = yanit.content.find((b) => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      const textFallback = yanit.content.find((b) => b.type === 'text')
      console.error('[hikaye-haritasi] tool_use bloğu yok, content:', JSON.stringify(yanit.content))
      return NextResponse.json(
        {
          error: 'no_tool_use',
          detail: 'AI tool use yanıtı vermedi',
          rawText: textFallback?.type === 'text' ? textFallback.text : '',
        },
        { status: 500 }
      )
    }

    const data = toolBlock.input as {
      kullanicilar: Array<{ kod: string; tip: string; aciklama: string }>
      hikayeHaritasi: {
        destanlar: string[]
        hikayeler: Array<{ no: string; ad: string; destan: string; surum: string; kullanici_kodlari: string[] }>
      }
      sprintPlani: Array<Record<string, string | number>>
      genelOzet: Array<Record<string, string | number>>
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[hikaye-haritasi] API hatası:', err)
    return NextResponse.json({ error: 'api_error', detail: String(err) }, { status: 500 })
  }
}
