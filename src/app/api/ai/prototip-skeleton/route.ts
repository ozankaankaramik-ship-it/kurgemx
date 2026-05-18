import Anthropic from '@anthropic-ai/sdk'
import {
  SISTEM,
  buildHikayelerMetni, extractScreenIds, extractScreenName,
  type HikayeItem,
} from '@/lib/prototip-helpers'
import { PROTOTIP_BASE_CSS } from '@/lib/prototip-base-css'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })

function injectBaseCSS(html: string, css: string): string {
  const tag = `<style>\n${css}\n</style>`
  if (html.includes('</head>')) return html.replace('</head>', `${tag}\n</head>`)
  if (html.includes('<body')) return html.replace('<body', `${tag}\n<body`)
  return tag + '\n' + html
}


async function generateSkeleton(
  projeAdi: string,
  detayliAciklama: string,
  hikayelerMetni: string,
  isTR: boolean,
): Promise<string> {
  const prompt = isTR
    ? `Proje: ${projeAdi}
Açıklama: ${detayliAciklama}
Çıktı dili: Türkçe

Hikayeler:
${hikayelerMetni}

Bu proje için HTML prototip iskeletini üret. AŞAĞIDAKI ŞABLONU DOLDUR:

<html><head><meta charset="UTF-8"><title>${projeAdi}</title></head>
<body>
<div class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">${projeAdi}</div>
    <button class="hamburger"><span></span><span></span><span></span></button>
  </div>
  <nav class="sidebar-nav">
    [NAV GRUPLARI VE ITEM'LAR]
  </nav>
  <div class="sidebar-footer"><span>GÜN AY YIL</span><span>KurgemX</span></div>
</div>
<main class="main">
  [EKRAN DIV'LERİ]
</main>
</body></html>

Nav group kalıbı:
<div class="nav-group">
  <div class="nav-group-label">Grup Adı</div>
  <a class="nav-item" data-screen="SCREEN_ID" href="#">Ekran Adı</a>
</div>

Ekran div kalıbı:
<div id="SCREEN_ID" class="screen">
<!-- SCREEN_CONTENT_SCREEN_ID -->
</div>

KRİTİK KURALLAR:
- CSS ve JavaScript EKLEME — bunlar ayrıca programatik olarak eklenecek
- SCREEN_ID: YALNIZCA a-z İngiliz harfi, 0-9 rakam ve tire (-) — Türkçe harf veya özel karakter YASAK (yanlış: anket-yanıtla → doğru: anket-yanitla)
- Her nav-item data-screen değeri tam eşleşen bir div.screen id'siyle eşleşmeli
- Ekran div'lerinde SADECE <!-- SCREEN_CONTENT_SCREEN_ID --> olsun
- Maks 10 nav item, hikayeleri mantıksal gruplara böl
- sidebar-footer'da sol=bugünün tarihi (GG.AA.YYYY), sağ="KurgemX"

Yalnızca HTML döndür.`
    : `Project: ${projeAdi}
Description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}

Generate the HTML prototype skeleton. FILL IN THE TEMPLATE BELOW:

<html><head><meta charset="UTF-8"><title>${projeAdi}</title></head>
<body>
<div class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">${projeAdi}</div>
    <button class="hamburger"><span></span><span></span><span></span></button>
  </div>
  <nav class="sidebar-nav">
    [NAV GROUPS AND ITEMS]
  </nav>
  <div class="sidebar-footer"><span>DAY MONTH YEAR</span><span>KurgemX</span></div>
</div>
<main class="main">
  [SCREEN DIVS]
</main>
</body></html>

Nav group pattern:
<div class="nav-group">
  <div class="nav-group-label">Group Name</div>
  <a class="nav-item" data-screen="SCREEN_ID" href="#">Screen Name</a>
</div>

Screen div pattern:
<div id="SCREEN_ID" class="screen">
<!-- SCREEN_CONTENT_SCREEN_ID -->
</div>

CRITICAL RULES:
- Do NOT add CSS or JavaScript — they will be injected programmatically
- SCREEN_ID: ASCII only — a-z letters, 0-9 digits, hyphens (-); no accented/special characters (wrong: anket-yanıtla → correct: anket-yanitla)
- Every nav-item data-screen value must match a div.screen id exactly
- Screen divs must contain ONLY <!-- SCREEN_CONTENT_SCREEN_ID -->
- Max 10 nav items, group screens logically
- sidebar-footer: left=today's date (DD.MM.YYYY), right="KurgemX"

Return only HTML.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 10000,
    system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  console.log('[prototip-skeleton] stop_reason:', response.stop_reason, 'output_tokens:', response.usage?.output_tokens)
  if (response.stop_reason === 'max_tokens') {
    console.warn('[prototip-skeleton] UYARI: max_tokens sınırına ulaşıldı. output_tokens:', response.usage?.output_tokens)
  }

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  return raw.replace(/^```html\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeler?: HikayeItem[]
    positiveAcler?: Record<string, string[]>
    projeDili?: string
    arayuzDili?: string
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayeler = body.hikayeler ?? []
  const positiveAcler = body.positiveAcler ?? {}
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const isTR = projeDili === 'TR'

  if (!projeAdi || !detayliAciklama || hikayeler.length === 0) {
    return Response.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'api_key_missing' }, { status: 500 })
  }

  try {
    const hikayelerMetni = buildHikayelerMetni(hikayeler, positiveAcler, isTR)
    let skeleton = await generateSkeleton(projeAdi, detayliAciklama, hikayelerMetni, isTR)
    console.log('[skeleton-html]', skeleton.substring(0, 3000))

    // CSS programatik enjekte edilir; nav JS client tarafında deduplicateNavScript ile eklenir
    skeleton = injectBaseCSS(skeleton, PROTOTIP_BASE_CSS)

    const screenIds = extractScreenIds(skeleton)
    const screenNames: Record<string, string> = {}
    for (const id of screenIds) {
      screenNames[id] = extractScreenName(skeleton, id)
    }

    console.log('[prototip-skeleton] hazır — screenIds:', screenIds)

    return Response.json({
      skeleton,
      screenIds,
      screenNames,
      skeletonCSS: PROTOTIP_BASE_CSS,
      hikayelerMetni,
    })
  } catch (err) {
    console.error('[prototip-skeleton] HATA:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'generation_failed' }, { status: 500 })
  }
}
