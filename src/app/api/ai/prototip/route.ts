import Anthropic from '@anthropic-ai/sdk'
import { genel, prototip as prototipStandart } from '@/lib/standartlar'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 })

const SISTEM_EK = `

Minimal ve sade HTML üret.
Gereksiz CSS animasyonu ekleme.
JavaScript sadece navigasyon ve form simülasyonu için kullan.`

const SISTEM = `${genel}\n\n${prototipStandart}${SISTEM_EK}`

interface HikayeItem {
  no: string; ad: string; destan: string; surum: string; sprint: string
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

function extractScreenIds(html: string): string[] {
  const ids: string[] = []
  const re = /<!--\s*SCREEN_CONTENT_([A-Za-z0-9_-]+)\s*-->/g
  let m
  while ((m = re.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1])
  }
  return ids
}

function extractScreenName(skeleton: string, screenId: string): string {
  const re = new RegExp(`data-screen=["']${screenId}["'][^>]*>\\s*([^<]+)`, 'i')
  const m = skeleton.match(re)
  return m ? m[1].trim() : screenId
}

function buildHikayelerMetni(
  hikayeler: HikayeItem[],
  positiveAcler: Record<string, string[]>,
  isTR: boolean,
): string {
  return hikayeler
    .map(h => {
      const aclar = positiveAcler[h.no]
      const acMetni = aclar?.length ? `\n  Positive ACs: ${aclar.join(' | ')}` : ''
      return `- ${h.no} | ${h.ad} | ${isTR ? 'Destan' : 'Epic'}: ${h.destan} | ${h.surum} | ${h.sprint}${acMetni}`
    })
    .join('\n')
}

// Garantili navigasyon JS — skeleton prompt'a gömülür ve patchPrototipNavigasyon tarafından da eklenir
const SHARED_NAV_JS = `<script>
(function(){
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(function(s){s.style.display='none';});
    var el=document.getElementById(id);if(el)el.style.display='block';
    document.querySelectorAll('[data-screen]').forEach(function(n){n.classList.remove('active');});
    var nav=document.querySelector('[data-screen="'+id+'"]');if(nav)nav.classList.add('active');
  }
  window.showScreen=showScreen;
  document.addEventListener('DOMContentLoaded',function(){
    var screens=document.querySelectorAll('.screen');
    screens.forEach(function(s){s.style.display='none';});
    if(screens.length>0){
      var first=screens[0];first.style.display='block';
      var n=document.querySelector('[data-screen="'+first.id+'"]');if(n)n.classList.add('active');
    }
    document.querySelectorAll('[data-screen]').forEach(function(nav){
      nav.addEventListener('click',function(e){
        e.preventDefault();var sid=nav.getAttribute('data-screen');if(sid)showScreen(sid);
      });
    });
  });
})();
</script>`

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
    max_tokens: 6000,
    system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  console.log('[prototip-skeleton] stop_reason:', response.stop_reason, 'output_tokens:', response.usage?.output_tokens)
  if (response.stop_reason === 'max_tokens') {
    console.warn('[prototip-skeleton] UYARI: max_tokens sınırına ulaşıldı — iskelet eksik olabilir! output_tokens:', response.usage?.output_tokens)
  }

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  return raw.replace(/^```html\s*/i, '').replace(/\s*```\s*$/, '').trim()
}

async function generateScreenBatch(
  batchScreenIds: string[],
  skeleton: string,
  projeAdi: string,
  detayliAciklama: string,
  hikayelerMetni: string,
  isTR: boolean,
  batchIdx: number,
): Promise<Map<string, string>> {
  const screenList = batchScreenIds
    .map(id => `- ${id}: ${extractScreenName(skeleton, id)}`)
    .join('\n')

  const prompt = isTR
    ? `Proje: ${projeAdi}
Açıklama: ${detayliAciklama}
Çıktı dili: Türkçe

Hikayeler:
${hikayelerMetni}

Aşağıdaki ekranların iç HTML içeriğini üret. Hikayenin işlevine uygun UI kullan:
- Liste/tablo → veri tablosu (prototip.md tablo stili)
- Form → doldurulabilir form (prototip.md form stili)
- Detay → detay kartı
- Dashboard → özet kartlar

SADECE şu formatta döndür — başka açıklama ekleme:

SCREEN:[screen-id]
[ekranın iç HTML içeriği — wrapper div hariç, direkt içerik elementleri]
/SCREEN

Ekranlar:
${screenList}

Kurallar:
- Prototip.md tasarım standardına uy (renkler, butonlar, tablolar)
- Gerçekçi Türkçe örnek veriler kullan
- Her ekran bağımsız çalışmalı`
    : `Project: ${projeAdi}
Description: ${detayliAciklama}
Output language: English

Stories:
${hikayelerMetni}

Generate the inner HTML content for the following screens. Use appropriate UI for each screen's function:
- List/table → data table (prototip.md table style)
- Form → fillable form (prototip.md form style)
- Detail → detail card
- Dashboard → summary cards

Return ONLY in this exact format — no other text:

SCREEN:[screen-id]
[screen inner HTML content — no wrapper div, just the content elements]
/SCREEN

Screens:
${screenList}

Rules:
- Follow prototip.md design standards (colors, buttons, tables)
- Use realistic English example data
- Each screen must work independently`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 20000,
    system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  console.log(
    `[prototip-batch-${batchIdx}] stop_reason:`, response.stop_reason,
    'output_tokens:', response.usage?.output_tokens,
    'screens:', batchScreenIds.join(','),
  )

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const result = new Map<string, string>()
  const re = /SCREEN:([A-Za-z0-9_-]+)\n([\s\S]*?)\/SCREEN/g
  let m
  while ((m = re.exec(raw)) !== null) {
    result.set(m[1].trim(), m[2].trim())
  }
  return result
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeler?: HikayeItem[]
    positiveAcler?: Record<string, string[]>
    projeDili?: string
    projeBuyuklugu?: string
    arayuzDili?: string
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_body' }), { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayeler = body.hikayeler ?? []
  const positiveAcler = body.positiveAcler ?? {}
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const isTR = projeDili === 'TR'
  const arayuzDili = (body.arayuzDili ?? '').trim().toLowerCase()
  const isUITR = arayuzDili === 'tr' || (arayuzDili === '' && isTR)

  if (!projeAdi || !detayliAciklama || hikayeler.length === 0) {
    return new Response(JSON.stringify({ error: 'empty_input' }), { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'api_key_missing' }), { status: 500 })
  }

  const hikayelerMetni = buildHikayelerMetni(hikayeler, positiveAcler, isTR)
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const emit = (s: string) => controller.enqueue(encoder.encode(s))
      const progress = (msg: string) => emit(`<!-- PROTOTIP_PROGRESS: ${msg} -->\n`)

      try {
        // Aşama 1: İskelet
        progress(isUITR ? 'İskelet oluşturuluyor...' : 'Building skeleton...')
        console.log('[prototip-skeleton] başlıyor — projeDili:', projeDili, 'arayuzDili:', arayuzDili)
        const skeleton = await generateSkeleton(projeAdi, detayliAciklama, hikayelerMetni, isTR)

        const screenIds = extractScreenIds(skeleton)
        console.log('[prototip] iskelet hazır — screen ids:', screenIds, 'uzunluk:', skeleton.length)

        if (screenIds.length === 0) {
          // Placeholder bulunamadı — iskelet eksik veya placeholder yok
          console.warn('[prototip] UYARI: screen placeholder bulunamadı — iskelet doğrudan döndürülüyor. Skeleton başlangıcı:', skeleton.slice(0, 300))
          progress(isUITR ? 'Prototip tamamlanıyor...' : 'Finalizing prototype...')
          emit(skeleton)
          controller.close()
          return
        }

        const batches = chunkArray(screenIds, 5)
        console.log('[prototip] batch planı:', batches.length, 'batch,', screenIds.length, 'ekran')

        // Aşama 2: Sıralı batch ekran içerikleri (paralel yerine — rate limit aşımını önler)
        const contentMap = new Map<string, string>()

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          console.log(`[prototip-batch-${i + 1}] başlıyor — ekranlar:`, batch.join(','))
          const batchContents = await generateScreenBatch(
            batch, skeleton, projeAdi, detayliAciklama, hikayelerMetni, isTR, i + 1,
          )
          console.log(`[prototip-batch-${i + 1}] tamamlandı — ${batchContents.size}/${batch.length} ekran üretildi`)
          progress(isUITR
            ? `Ekranlar oluşturuluyor... (${i + 1}/${batches.length})`
            : `Generating screens... (${i + 1}/${batches.length})`)
          for (const [id, content] of batchContents) {
            contentMap.set(id, content)
          }
        }

        // Birleştirme
        progress(isUITR ? 'Prototip tamamlanıyor...' : 'Finalizing prototype...')
        let html = skeleton
        for (const [id, content] of contentMap) {
          html = html.replace(`<!-- SCREEN_CONTENT_${id} -->`, content)
        }

        const missingScreens = screenIds.filter(id => !contentMap.has(id))
        if (missingScreens.length > 0) {
          console.warn('[prototip] eksik ekranlar (içerik üretilemedi):', missingScreens.join(','))
        }
        console.log('[prototip] finish=assembled screens:', screenIds.length, 'batches:', batches.length, 'contentMap boyutu:', contentMap.size)
        emit(html)
        controller.close()
      } catch (err) {
        console.error('[prototip] KRİTİK HATA:', err instanceof Error ? err.message : String(err), err)
        controller.error(err)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
