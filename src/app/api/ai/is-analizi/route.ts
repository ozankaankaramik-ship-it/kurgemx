import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { genel, isAnalizi } from '@/lib/standartlar'

// Vercel plan sınırı içinde kalmak için 300s. Her bölüm ayrı request
// olduğundan bu budget yalnızca tek bir bölüm için geçerli.
export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 300_000 })
const SISTEM = `${genel}\n\n---\n\n${isAnalizi}`

const DIL_ETIKET: Record<string, string> = {
  TR: 'Türkçe', EN: 'English', AR: 'Arabic', RU: 'Russian', JA: 'Japanese/Chinese',
}

// 5 bölümlük üretim:
//   bolum1    → Header + Bölüm 1 (Doküman Genel Bilgileri)
//   R1/R2/R3  → Bölüm 2.1 / 2.2 / 2.3 (Hikaye Bazında Kabul Kriterleri)
//   bolum345  → Bölüm 3 + 4 + 5 + ekran tasarımı notu + kısaltmalar tablosu
type Bolum = 'bolum1' | 'R1' | 'R2' | 'R3' | 'bolum345'
const GECERLI_BOLUM: readonly Bolum[] = ['bolum1', 'R1', 'R2', 'R3', 'bolum345']
const RELEASES = new Set<Bolum>(['R1', 'R2', 'R3'])

interface HikayeItem {
  no: string; ad: string; destan: string; surum: string; sprint: string
}

interface HikayeHaritasiInput {
  destanlar: string[]
  hikayeler: HikayeItem[]
  sprintPlani?: Array<Record<string, string | number>>
}

function releaseLabel(bolum: 'R1' | 'R2' | 'R3', projeDili: string): string {
  const isTR = projeDili === 'TR'
  if (bolum === 'R1') return 'MVP'
  if (bolum === 'R2') return isTR ? 'İyileştirme' : 'Enhancement'
  return isTR ? 'Gelişmiş' : 'Advanced'
}

function formatTumHikayeler(hh: HikayeHaritasiInput, projeDili: string): string {
  const isTR = projeDili === 'TR'
  const lines: string[] = []
  lines.push(isTR ? `Destanlar: ${hh.destanlar.join(', ')}` : `Epics: ${hh.destanlar.join(', ')}`)
  lines.push('')
  for (const r of ['R1', 'R2', 'R3'] as const) {
    const hikayeler = hh.hikayeler.filter(h => h.surum === r)
    if (!hikayeler.length) continue
    const label = releaseLabel(r, projeDili)
    lines.push(`${r} — ${label} (${hikayeler.length} ${isTR ? 'hikaye' : 'stories'}):`)
    for (const h of hikayeler) {
      lines.push(`  ${h.no}: ${h.ad}  |  Destan/Epic: ${h.destan}  |  Sprint: ${h.sprint}`)
    }
    lines.push('')
  }
  if (hh.sprintPlani?.length) {
    lines.push(isTR ? 'Sprint Planı:' : 'Sprint Plan:')
    for (const row of hh.sprintPlani) {
      lines.push('  ' + Object.values(row).map(String).join(' | '))
    }
  }
  return lines.join('\n')
}

function formatReleaseHikayeleri(
  hh: HikayeHaritasiInput,
  release: 'R1' | 'R2' | 'R3',
  projeDili: string,
): string {
  const isTR = projeDili === 'TR'
  const hikayeler = hh.hikayeler.filter(h => h.surum === release)
  const lines: string[] = []
  lines.push(isTR ? `Destanlar: ${hh.destanlar.join(', ')}` : `Epics: ${hh.destanlar.join(', ')}`)
  lines.push('')
  const label = releaseLabel(release, projeDili)
  lines.push(`${release} — ${label} (${hikayeler.length} ${isTR ? 'hikaye' : 'stories'}):`)
  for (const h of hikayeler) {
    lines.push(`  ${h.no}: ${h.ad}  |  Destan/Epic: ${h.destan}  |  Sprint: ${h.sprint}`)
  }
  return lines.join('\n')
}

// ──────────────────────────────────────────────────────────────
// Bölüm 1 prompt — Header + Doküman Genel Bilgileri
// ──────────────────────────────────────────────────────────────
function bolum1Prompt(
  projeAdi: string,
  detayliAciklama: string,
  hh: HikayeHaritasiInput,
  projeDili: string,
  dilAdi: string,
  bugun: string,
): string {
  const isTR = projeDili === 'TR'
  const baslik = isTR
    ? `${projeAdi} — Gereksinim Analizi Dokümanı`
    : `${projeAdi} — Requirements Analysis Document`
  const hikayeListesi = formatTumHikayeler(hh, projeDili)

  return isTR
    ? `Aşağıdaki proje için gereksinim analizi dokümanının SADECE BAŞLANGIÇ kısmını oluştur:
- Doküman başlığı (H1)
- Header bilgisi (KurgemX | Proje Adı | Doküman Adı formatında bir satır)
- BÖLÜM 1: Doküman Genel Bilgileri (standartta tanımlı tüm alanlar)

KAPSAM KURALI:
- Yalnızca yukarıdaki içerik üretilir. Bölüm 2, 3, 4, 5 YAZMA, kısaltmalar tablosu EKLEME, footer EKLEME.
- "Kapsanan hikayeler" listesi release bazında gruplandırılır; ST numarası, hikaye adı ve destan referansı verilir.
- Tarih: ${bugun}
- Sürüm: 1.0
- Onay durumu: Bekliyor
- Hazırlayan: KurgemX
- Sonraki güncelleme: belirtmiyorsan boş bırak

Proje Adı: ${projeAdi}
Çıktı Dili: ${dilAdi}
Doküman Başlığı: ${baslik}

PROJE AÇIKLAMASI:
${detayliAciklama}

HİKAYE HARİTASI (kapsanan hikayeler listesi için kullan):
${hikayeListesi}

Yanıt olarak SADECE markdown formatında bu başlangıç kısmını döndür. JSON, kod bloğu veya ek açıklama ekleme. Sonunda "## Bölüm 2" başlığı YAZMA — sonraki istekte gelecek.`
    : `Create ONLY the OPENING of the requirements analysis document for the project below:
- Document title (H1)
- Header line ("KurgemX | Project Name | Document Name" format)
- SECTION 1: Document General Information (all fields defined in the standard)

SCOPE RULE:
- Produce only the above. Do NOT write Sections 2, 3, 4, 5; do NOT add the abbreviations table; do NOT add a footer.
- "Stories covered" list is grouped by release; show ST number, story name and epic reference.
- Date: ${bugun}
- Version: 1.0
- Approval status: Pending
- Prepared by: KurgemX
- Next update: leave blank if unspecified

Project Name: ${projeAdi}
Output Language: ${dilAdi}
Document Title: ${baslik}

PROJECT DESCRIPTION:
${detayliAciklama}

STORY MAP (use for the covered-stories list):
${hikayeListesi}

Return ONLY the markdown for this opening section. No JSON wrapper, no code block, no preamble. Do NOT add a "## Section 2" heading — that comes in the next request.`
}

// ──────────────────────────────────────────────────────────────
// Bölüm 2 alt-bölümleri (R1, R2, R3) — Hikaye Bazında Kabul Kriterleri
// ──────────────────────────────────────────────────────────────
function releasePrompt(
  projeAdi: string,
  detayliAciklama: string,
  hh: HikayeHaritasiInput,
  projeDili: string,
  dilAdi: string,
  release: 'R1' | 'R2' | 'R3',
  acBaslangic: number,
  brBaslangic: number,
): string {
  const isTR = projeDili === 'TR'
  const hikayeMetni = formatReleaseHikayeleri(hh, release, projeDili)
  const label = releaseLabel(release, projeDili)

  // Sadece R1, "## Bölüm 2" başlığını ve kısaltma legend'ını yazar; R2/R3
  // doğrudan alt bölüm başlığıyla (2.2, 2.3) başlar.
  const bolum2Acilis = release === 'R1'
    ? isTR
      ? `Bu yanıt Bölüm 2'nin başlangıcıdır:
- Önce "## Bölüm 2: Hikaye Bazında Kabul Kriterleri" başlığını yaz
- Hemen altına kısaltma legend'ını alıntı bloğu olarak yaz (ST, AC, BR, [P], [N], [B], [S])
- Sonra "### 2.1 R1 — MVP" alt başlığını yaz ve R1 hikayelerini standarda göre işle`
      : `This response begins Section 2:
- First write "## Section 2: Acceptance Criteria by Story" heading
- Right below, write the abbreviation legend as a blockquote (ST, AC, BR, [P], [N], [B], [S])
- Then write "### 2.1 R1 — MVP" sub-heading and process R1 stories per the standard`
    : isTR
      ? `Bu yanıt Bölüm 2'nin "${release === 'R2' ? '2.2' : '2.3'} ${release} — ${label}" alt bölümüdür. Sadece "### ${release === 'R2' ? '2.2' : '2.3'} ${release} — ${label}" başlığıyla başla; "## Bölüm 2" başlığını TEKRAR YAZMA, kısaltma legend'ını tekrar EKLEME.`
      : `This response is Section 2's "${release === 'R2' ? '2.2' : '2.3'} ${release} — ${label}" sub-section. Start ONLY with "### ${release === 'R2' ? '2.2' : '2.3'} ${release} — ${label}"; do NOT repeat the "## Section 2" heading or the legend.`

  const numerasyon = isTR
    ? `\n\nNUMARALANDIRMA KURALI:\n- Kabul kriterleri (AC) numaraları AC-${String(acBaslangic).padStart(3, '0')}'tan başla, sırayla artır.\n- İş kuralı (BR) numaraları BR-${String(brBaslangic).padStart(3, '0')}'tan başla, sırayla artır.\n- ST (hikaye) numaraları hikaye haritasındaki değerlerle aynı kalır, değiştirme.\n- AC formatı: "AC-001 P : Metin" — tip etiketi köşeli parantez olmadan, sadece harf (P, N, B, S).`
    : `\n\nNUMBERING RULE:\n- Acceptance criteria (AC) numbers start at AC-${String(acBaslangic).padStart(3, '0')} and increment sequentially.\n- Business rule (BR) numbers start at BR-${String(brBaslangic).padStart(3, '0')} and increment sequentially.\n- ST (story) numbers must match the story map exactly — do not change them.\n- AC format: "AC-001 P : Text" — type label without brackets, letter only (P, N, B, S).`

  const kapsamUyarisi = isTR
    ? `\n\nKAPSAM KURALI:\n- Diğer release'lere veya Bölüm 3/4/5'e referans verme.\n- Ekran tasarımı notu, kısaltmalar tablosu, footer YAZMA — bunlar son istekte gelecek.`
    : `\n\nSCOPE RULE:\n- Do not reference other releases or Sections 3/4/5.\n- Do NOT add the screen designs note, abbreviations table or footer — those come in the final request.`

  return isTR
    ? `Aşağıdaki proje için gereksinim analizi dokümanının ${release} — ${label} bölümünü oluştur.

${bolum2Acilis}

Her ${release} hikayesi için standarda göre şunları üret:
1. Kullanıcı hikayesi (AKTÖR / İHTİYAÇ / FAYDA formatında)
2. Kabul kriterleri (her hikaye için min 2, max 6; başlık yazma; max 15 kelime; en az 1 P ve 1 N)
3. İş kuralları (gerekliyse, ilgili AC'nin hemen altında)${numerasyon}${kapsamUyarisi}

Proje Adı: ${projeAdi}
Çıktı Dili: ${dilAdi}

PROJE AÇIKLAMASI:
${detayliAciklama}

${release} HİKAYELERİ:
${hikayeMetni}

Yanıt olarak SADECE markdown formatında bu bölümü döndür. JSON, kod bloğu veya ek açıklama ekleme.`
    : `Create the ${release} — ${label} section of the requirements analysis document for the project below.

${bolum2Acilis}

For each ${release} story produce (per the standard):
1. User story (ACTOR / NEED / BENEFIT format)
2. Acceptance criteria (min 2, max 6 per story; no headings; max 15 words; at least 1 P and 1 N)
3. Business rules (when necessary, immediately below the related AC)${numerasyon}${kapsamUyarisi}

Project Name: ${projeAdi}
Output Language: ${dilAdi}

PROJECT DESCRIPTION:
${detayliAciklama}

${release} STORIES:
${hikayeMetni}

Return ONLY the markdown for this section. No JSON wrapper, no code block, no preamble.`
}

// ──────────────────────────────────────────────────────────────
// Bölüm 3 + 4 + 5 + ekran notu + kısaltmalar tablosu + footer
// ──────────────────────────────────────────────────────────────
function bolum345Prompt(
  projeAdi: string,
  detayliAciklama: string,
  hh: HikayeHaritasiInput,
  projeDili: string,
  dilAdi: string,
  bugun: string,
): string {
  const isTR = projeDili === 'TR'
  const hikayeListesi = formatTumHikayeler(hh, projeDili)

  return isTR
    ? `Aşağıdaki proje için gereksinim analizi dokümanının KAPANIŞ bölümlerini üret:

1. Önce "### Ekran Tasarımları Notu" başlığı ve standarttaki not (blockquote):
   > **Ekran Tasarımları:** Bu dokümanda ekran mockup'ı yer almamaktadır. Tüm ekran tasarımları için KurgemX'te üretilen prototipe bakınız.

2. "## Bölüm 3: Sistem Gereksinimleri"
   - 3.1 Fonksiyonel Olmayan Gereksinimler (tablo — ilgisizler atlanabilir)
   - 3.2 Geçiş Gereksinimleri (tablo — ilgisizler atlanabilir)

3. "## Bölüm 4: Etki Analizi"
   - Bloke olan hikayeler tablosu (hikaye haritasındaki bağımlılıklara göre)
   - Etkilenen iş süreçleri (madde listesi)
   - Riskler tablosu (Risk / Olasılık / Etki / Azaltım Stratejisi)

4. "## Bölüm 5: Teknik Detaylar"
   - Üst satıra şu uyarıyı blockquote olarak yaz: "> ⚠️ Bu bölüm yalnızca teknik ekip içindir. İş birimi bu bölümü atlayabilir."
   - 5.1 Temel API Uç Noktaları (sadece endpoint + HTTP metodu, özet)
   - 5.2 Güvenlik Notları (kimlik doğrulama yöntemi, yetkilendirme, KVKK)
   - 5.3 Entegrasyon Noktaları (varsa)

5. "## Kısaltmalar" başlığı altında standarttaki tablo:

| Kısaltma | Açılım | Örnek |
|----------|--------|-------|
| ST | Story (Hikaye) | ST1, ST2 |
| SP | Sprint | SP1, SP2 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria (Kabul Kriteri) | AC-001 |
| BR | Business Rule (İş Kuralı) | BR-001 |
| TC | Test Case | TC-ST1-01 |

6. Sayfa sonuna footer satırı (italic, küçük): "Gizli — Dahili Kullanım  |  Sürüm 1.0  |  ${bugun}"

KAPSAM KURALI: Bölüm 1 ve Bölüm 2 yazma — onlar zaten üretildi. Doğrudan yukarıdaki içerikle başla.

Proje Adı: ${projeAdi}
Çıktı Dili: ${dilAdi}

PROJE AÇIKLAMASI:
${detayliAciklama}

HİKAYE HARİTASI (etki analizi ve sistem gereksinimleri için referans):
${hikayeListesi}

Yanıt olarak SADECE markdown formatında bu kapanış bölümlerini döndür. JSON, kod bloğu veya ek açıklama ekleme.`
    : `Create the CLOSING sections of the requirements analysis document for the project below:

1. First "### Screen Designs Note" heading with the standard blockquote:
   > **Screen Designs:** This document does not include screen mockups. For all screen designs, refer to the prototype generated in KurgemX.

2. "## Section 3: System Requirements"
   - 3.1 Non-Functional Requirements (table — skip irrelevant rows)
   - 3.2 Transition Requirements (table — skip irrelevant rows)

3. "## Section 4: Impact Analysis"
   - Blocked stories table (based on dependencies from the story map)
   - Affected business processes (bullet list)
   - Risks table (Risk / Likelihood / Impact / Mitigation Strategy)

4. "## Section 5: Technical Details"
   - First line as a blockquote warning: "> ⚠️ This section is for the technical team only. Business team may skip it."
   - 5.1 Core API Endpoints (endpoint name + HTTP method only, summary)
   - 5.2 Security Notes (authentication method, authorization, KVKK/GDPR)
   - 5.3 Integration Points (if any)

5. "## Abbreviations" heading with the standard table:

| Abbreviation | Expansion | Example |
|--------------|-----------|---------|
| ST | Story | ST1, ST2 |
| SP | Sprint | SP1, SP2 |
| R | Release | R1, R2, R3 |
| AC | Acceptance Criteria | AC-001 |
| BR | Business Rule | BR-001 |
| TC | Test Case | TC-ST1-01 |

6. Footer line at the bottom (italic, small): "Confidential — Internal Use  |  Version 1.0  |  ${bugun}"

SCOPE RULE: Do NOT write Sections 1 or 2 — they have already been generated. Start directly with the content above.

Project Name: ${projeAdi}
Output Language: ${dilAdi}

PROJECT DESCRIPTION:
${detayliAciklama}

STORY MAP (reference for impact analysis and system requirements):
${hikayeListesi}

Return ONLY the markdown for these closing sections. No JSON wrapper, no code block, no preamble.`
}

// ──────────────────────────────────────────────────────────────
// POST handler
// ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    hikayeHaritasi?: HikayeHaritasiInput
    projeDili?: string
    bolum?: Bolum
    acBaslangic?: number
    brBaslangic?: number
    projeBuyuklugu?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const hikayeHaritasi = body.hikayeHaritasi
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const bolum = body.bolum
  const acBaslangic = Math.max(1, Math.floor(body.acBaslangic ?? 1))
  const brBaslangic = Math.max(1, Math.floor(body.brBaslangic ?? 1))
  const projeBuyuklugu = (body.projeBuyuklugu ?? 'Orta').trim()
  const dilAdi = DIL_ETIKET[projeDili] ?? 'English'

  const MAX_TOKENS_MAP: Record<string, number> = { Küçük: 8000, Orta: 16000, Büyük: 24000 }
  const maxTokens = MAX_TOKENS_MAP[projeBuyuklugu] ?? 16000

  if (!projeAdi || !detayliAciklama || !hikayeHaritasi || !bolum) {
    return NextResponse.json({ error: 'empty_input', detail: 'projeAdi, detayliAciklama, hikayeHaritasi, bolum required' }, { status: 400 })
  }
  if (!GECERLI_BOLUM.includes(bolum)) {
    return NextResponse.json({ error: 'invalid_bolum', detail: `bolum '${bolum}' must be one of ${GECERLI_BOLUM.join('|')}` }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'api_key_missing' }, { status: 500 })
  }

  const bugun = new Date().toISOString().split('T')[0]
  const baslik = projeDili === 'TR'
    ? `${projeAdi} — Gereksinim Analizi Dokümanı`
    : `${projeAdi} — Requirements Analysis Document`

  // Bölüme göre prompt seç
  let userPromptText: string
  if (bolum === 'bolum1') {
    userPromptText = bolum1Prompt(projeAdi, detayliAciklama, hikayeHaritasi, projeDili, dilAdi, bugun)
  } else if (bolum === 'bolum345') {
    userPromptText = bolum345Prompt(projeAdi, detayliAciklama, hikayeHaritasi, projeDili, dilAdi, bugun)
  } else {
    userPromptText = releasePrompt(
      projeAdi, detayliAciklama, hikayeHaritasi, projeDili, dilAdi,
      bolum, acBaslangic, brBaslangic,
    )
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let accumulated = ''
      let finishReason: string | null = null
      try {
        const stream = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          stream: true,
          system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userPromptText }],
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            accumulated += chunk
            controller.enqueue(encoder.encode(chunk))
          }
          if (event.type === 'message_delta') {
            finishReason = event.delta.stop_reason ?? null
          }
        }

        // AC/BR numaralarını sadece release bölümleri etkiler. Diğerlerinde
        // başlangıç değerleri korunur, böylece client zincirleme kırılmaz.
        const isRelease = RELEASES.has(bolum)
        let sonAC = acBaslangic - 1
        let sonBR = brBaslangic - 1
        if (isRelease) {
          const acMatches = [...accumulated.matchAll(/\bAC-(\d+)\b/g)].map(m => Number(m[1]))
          const brMatches = [...accumulated.matchAll(/\bBR-(\d+)\b/g)].map(m => Number(m[1]))
          if (acMatches.length) sonAC = Math.max(...acMatches)
          if (brMatches.length) sonBR = Math.max(...brMatches)
        }

        // Stream sonuna metadata marker (header alternatifi — bkz. önceki commit notu)
        const meta = JSON.stringify({ sonAC, sonBR, finishReason, bolum })
        controller.enqueue(encoder.encode(`\n<!-- META ${meta} -->\n`))

        if (finishReason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n<!-- TRUNCATED -->\n'))
        }

        console.log(
          `[is-analizi] bolum=${bolum} finish=${finishReason} sonAC=${sonAC} sonBR=${sonBR} len=${accumulated.length}`,
        )
      } catch (err) {
        console.error('[is-analizi] stream hatası:', err)
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Baslik': encodeURIComponent(baslik),
      'X-Tarih': bugun,
      'X-Versiyon': '1.0',
      'X-Bolum': bolum,
    },
  })
}
