import Anthropic from '@anthropic-ai/sdk'
import { SISTEM } from '@/lib/prototip-helpers'
import { createClient } from '@/lib/supabase/server'
import { getKullaniciPlan, planIzinVeriyor } from '@/lib/abonelik'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0, timeout: 300_000 })

interface BatchScreen { id: string; name: string }

export async function POST(req: Request) {
  let body: {
    ekranlar?: BatchScreen[]
    skeletonCSS?: string
    projeAdi?: string
    detayliAciklama?: string
    hikayelerMetni?: string
    projeDili?: string
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  const pb = await getKullaniciPlan(supabase, user.id)
  if (!planIzinVeriyor(pb.plan, 'prototip')) {
    return Response.json({ error: 'PLAN_REQUIRED', requiredPlan: 'analyst' }, { status: 403 })
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 })
  }

  const ekranlar = body.ekranlar ?? []
  const skeletonCSS = (body.skeletonCSS ?? '').trim()
  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayelerMetni = (body.hikayelerMetni ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const isTR = projeDili === 'TR'

  if (!projeAdi || !detayliAciklama || ekranlar.length === 0) {
    return Response.json({ error: 'empty_input' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const screenList = ekranlar.map(e => `- ${e.id}: ${e.name}`).join('\n')

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
- Her ekran bağımsız çalışmalı
- Tablolarda maksimum 3 satır, liste ve bildirim ekranlarında maksimum 3 item üret

İÇERİK BAŞLIĞI KURALI (her ekran için zorunlu):
Her ekranın en üstüne şu formatı ekle:
<div class="content-header">
  <h1 class="page-title">Ekran Adı <span class="badge badge-release">R1</span> <span class="badge badge-user">U1</span></h1>
</div>
Badge'leri Hikayeler listesindeki surum (Rx) ve kullanici kodlarından (Ux) al. Birden fazla kullanıcı varsa tüm U badge'lerini sırayla göster.

NAVİGASYON VE BUTON KURALLARI (zorunlu):
- window.showScreen fonksiyonu globaldir — DOM yüklendiğinde otomatik hazır olur, tekrar tanımlama.
- Giriş/login butonu → onclick="window.showScreen('dashboard-screen-id')" — id'yi skeleton'daki gerçek ekran id'siyle değiştir
- "Kaydet" / "Gönder" butonu → onclick ile küçük inline toast göster:
  <button onclick="(function(btn){var t=document.createElement('div');t.textContent='Kaydedildi';t.style.cssText='position:fixed;bottom:24px;right:24px;background:#16a34a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.18)';document.body.appendChild(t);setTimeout(function(){t.remove()},2000)})(this)">Kaydet</button>
- "Sil" butonu → onclick ile onay sor:
  onclick="if(confirm('Bu kaydı silmek istediğinizden emin misiniz?')){var t=document.createElement('div');t.textContent='Silindi';t.style.cssText='position:fixed;bottom:24px;right:24px;background:#dc2626;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.18)';document.body.appendChild(t);setTimeout(function(){t.remove()},2000)}"
- "İptal" butonu → onclick="history.back()" veya window.showScreen() ile önceki ekrana dön
- Tablo satırlarındaki "Detay/Görüntüle" linkleri → onclick="window.showScreen('detay-screen-id')"
- href="#" kullanma — her tıklanabilir öğede ya window.showScreen ya da inline toast / dialog kullan`
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
- Each screen must work independently
- Use maximum 3 rows in tables, maximum 3 items in lists and notification screens

CONTENT HEADER RULE (required for every screen):
Add this at the top of every screen:
<div class="content-header">
  <h1 class="page-title">Screen Name <span class="badge badge-release">R1</span> <span class="badge badge-user">U1</span></h1>
</div>
Get badges from the Stories list: surum field (Rx) and user codes (Ux). If multiple users, show all U badges in order.

NAVIGATION AND BUTTON RULES (required):
- window.showScreen is a global function — automatically available after DOM load, do not redefine it.
- Login/submit button → onclick="window.showScreen('dashboard-screen-id')" — replace id with the actual screen id from the skeleton
- "Save" / "Submit" button → show small inline toast via onclick:
  <button onclick="(function(btn){var t=document.createElement('div');t.textContent='Saved';t.style.cssText='position:fixed;bottom:24px;right:24px;background:#16a34a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.18)';document.body.appendChild(t);setTimeout(function(){t.remove()},2000)})(this)">Save</button>
- "Delete" button → confirm dialog via onclick:
  onclick="if(confirm('Are you sure you want to delete this record?')){var t=document.createElement('div');t.textContent='Deleted';t.style.cssText='position:fixed;bottom:24px;right:24px;background:#dc2626;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.18)';document.body.appendChild(t);setTimeout(function(){t.remove()},2000)}"
- "Cancel" button → onclick="history.back()" or window.showScreen() to return to previous screen
- Table row "View/Detail" links → onclick="window.showScreen('detail-screen-id')"
- Do not use href="#" — every clickable element must use window.showScreen, inline toast, or dialog`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20000,
      system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })

    console.log(
      '[prototip-batch] stop_reason:', response.stop_reason,
      'output_tokens:', response.usage?.output_tokens,
      'screens:', ekranlar.map(e => e.id).join(','),
    )

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const screens: Record<string, string> = {}
    // \s* after : handles space after colon; [ \t]* handles trailing whitespace before newline
    const re = /SCREEN:\s*([A-Za-z0-9_-]+)[ \t]*\n([\s\S]*?)\/SCREEN/g
    let m
    while ((m = re.exec(raw)) !== null) {
      screens[m[1].trim()] = m[2].trim()
    }

    const failedScreens = ekranlar.map(e => e.id).filter(id => !(id in screens))
    if (failedScreens.length > 0) {
      console.warn('[prototip-batch] parse edilemeyen ekranlar:', failedScreens.join(','))
    }

    return Response.json({ screens, failedScreens })
  } catch (err) {
    console.error('[prototip-batch] HATA:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'generation_failed' }, { status: 500 })
  }
}
