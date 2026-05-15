import Anthropic from '@anthropic-ai/sdk'
import {
  SISTEM, SHARED_NAV_JS,
  buildHikayelerMetni, extractScreenIds, extractScreenName, extractSkeletonCSS,
  type HikayeItem,
} from '@/lib/prototip-helpers'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 })

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

Bu proje için HTML prototip iskeletini üret.

TOKEN LİMİTİ VAR — ŞU SIRAYA KESİNLİKLE UY:
1. <html><head> — sadece <meta charset> + <title>. CSS YOK.
2. <body> açılışı
3. Sol sidebar nav (maks 10 item, data-screen, footer: sol=bugünün tarihi, sağ="KurgemX")
4. Her ekran için BOŞ div — SCREEN_CONTENT placeholderı ile
5. Aşağıdaki script bloğunu AYNEN koy (değiştirme)
6. <style> bloğu — sidebar+screen+nav CSS, MAKSİMUM 40 SATIR
7. </body></html>

Nav item kalıbı:
<a class="nav-item" data-screen="SCREEN_ID" href="#">Ekran Adı</a>

Ekran div kalıbı:
<div id="SCREEN_ID" class="screen" style="display:none">
<!-- SCREEN_CONTENT_SCREEN_ID -->
</div>

Script bloğu (adım 5 — AYNEN koy):
${SHARED_NAV_JS}

KRİTİK KURALLAR:
- Nav itemlar VE screen placeholder'lar CSS'ten önce gelir — CSS sona kalır
- SCREEN_ID: küçük harf, tire ile ayrılmış (ör: kullanici-listesi, urun-detay)
- Her nav-item data-screen değeri tam eşleşen bir div.screen id'siyle eşleşmeli
- Ekran div'lerinde SADECE <!-- SCREEN_CONTENT_SCREEN_ID --> olsun
- Tüm ekranlar style="display:none"
- CSS maksimum 40 satır — temel layout yeterli, detay renk/gölge yok

Yalnızca HTML döndür.`
    : `Project: ${projeAdi}
Description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}

Generate the HTML skeleton for this prototype.

TOKEN LIMIT — FOLLOW THIS ORDER STRICTLY:
1. <html><head> — only <meta charset> + <title>. NO CSS.
2. <body> open
3. Left sidebar nav (max 10 items, data-screen, footer: left=today's date, right="KurgemX")
4. Empty screen div for each screen — with SCREEN_CONTENT placeholder
5. Include the script block below EXACTLY as shown (do not modify)
6. <style> block — sidebar+screen+nav CSS, MAXIMUM 40 LINES
7. </body></html>

Nav item pattern:
<a class="nav-item" data-screen="SCREEN_ID" href="#">Screen Name</a>

Screen div pattern:
<div id="SCREEN_ID" class="screen" style="display:none">
<!-- SCREEN_CONTENT_SCREEN_ID -->
</div>

Script block (step 5 — include EXACTLY):
${SHARED_NAV_JS}

CRITICAL RULES:
- Nav items AND screen placeholders come BEFORE CSS — CSS goes last
- SCREEN_ID: lowercase, hyphen-separated (e.g., user-list, product-detail)
- Every nav-item data-screen value must match a div.screen id exactly
- Screen divs must contain ONLY <!-- SCREEN_CONTENT_SCREEN_ID -->
- All screens start with style="display:none"
- CSS maximum 40 lines — basic layout only, no detail colors/shadows

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
    const skeleton = await generateSkeleton(projeAdi, detayliAciklama, hikayelerMetni, isTR)
    const screenIds = extractScreenIds(skeleton)
    const screenNames: Record<string, string> = {}
    for (const id of screenIds) {
      screenNames[id] = extractScreenName(skeleton, id)
    }
    const skeletonCSS = extractSkeletonCSS(skeleton)

    console.log('[prototip-skeleton] hazır — screenIds:', screenIds, 'CSS uzunluğu:', skeletonCSS.length)

    return Response.json({ skeleton, screenIds, screenNames, skeletonCSS, hikayelerMetni })
  } catch (err) {
    console.error('[prototip-skeleton] HATA:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'generation_failed' }, { status: 500 })
  }
}
