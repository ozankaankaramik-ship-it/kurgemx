import Anthropic from '@anthropic-ai/sdk'
import { genel, testSenaryosu as testStandart } from '@/lib/standartlar'
import { createClient } from '@/lib/supabase/server'
import { getKullaniciPlan, planIzinVeriyor } from '@/lib/abonelik'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0, timeout: 300_000 })
const SISTEM = `${genel}\n\n---\n\n${testStandart}`

interface HikayeInput { no: string; ad: string; destan: string; sprint: string }
interface AcInput { hikayeNo: string; no: string; tip: string; metin: string }

const RELEASES = new Set(['R1', 'R2', 'R3'])
const MAX_TOKENS: Record<string, number> = { Küçük: 18000, Orta: 24000, Büyük: 32000 }

function releaseLabel(r: string, isTR: boolean) {
  if (r === 'R1') return 'MVP'
  if (r === 'R2') return isTR ? 'İyileştirme' : 'Enhancement'
  return isTR ? 'Gelişmiş' : 'Advanced'
}

function buildPrompt(
  projeAdi: string,
  detayliAciklama: string,
  release: string,
  hikayeler: HikayeInput[],
  acler: AcInput[],
  isTR: boolean,
): string {
  const label = releaseLabel(release, isTR)
  const hikayeListesi = hikayeler
    .map(h => `- ${h.no}: ${h.ad} | ${isTR ? 'Destan' : 'Epic'}: ${h.destan} | Sprint: ${h.sprint}`)
    .join('\n')

  const acByStory: Record<string, AcInput[]> = {}
  for (const ac of acler) {
    if (!acByStory[ac.hikayeNo]) acByStory[ac.hikayeNo] = []
    acByStory[ac.hikayeNo].push(ac)
  }
  const acListesi = hikayeler
    .map(h => {
      const list = acByStory[h.no] ?? []
      if (!list.length) return `${h.no} — ${h.ad}: (${isTR ? 'AC yok' : 'no ACs'})`
      const tipChar: Record<string, string> = { positive: 'P', negative: 'N', security: 'S', boundary: 'B' }
      return `${h.no} — ${h.ad}:\n` + list.map(ac => `  ${ac.no} ${tipChar[ac.tip] ?? 'P'}: ${ac.metin}`).join('\n')
    })
    .join('\n\n')

  const jsonSchema = `{
  "testCases": [
    {
      "no": "TC-ST1-01",
      "ac_no": "AC-001",
      "ac_metni": "[AC-001'in tam metni buraya]",
      "ac_tip": "positive",
      "release": "${release}",
      "test_on_kosul": "...",
      "test_adimlar": ["1. ...", "2. ...", "3. ..."],
      "beklenen_sonuc": "...",
      "durum": "pending"
    }
  ]
}`

  if (isTR) {
    return `Proje: ${projeAdi}
Açıklama: ${detayliAciklama}
Release: ${release} — ${label}
Çıktı Dili: Türkçe

${release} HİKAYELERİ:
${hikayeListesi}

KABUL KRİTERLERİ (hikaye bazlı):
${acListesi}

Yukarıdaki her AC için test case üret.

KURALLAR:
- Her AC için minimum 1, maksimum 2 TC üret
- ac_tip: positive / negative / security / boundary
- TC numaralama: TC-ST1-01, TC-ST1-02 (hikaye numarası değişince sıfırla)
- Her TC mutlaka yukarıdaki KABUL KRİTERLERİ listesindeki bir AC'den türetilmeli
- ac_no: o TC'nin türetildiği AC'nin numarasını birebir kopyala (örn: "AC-001") — yeni numara üretme, format değiştirme
- ac_metni: o TC'nin türetildiği AC'nin tam metnini birebir kopyala — özetleme veya değiştirme
- test_adimlar dizisi: her adım "1. ...", "2. ..." formatında
- durum her zaman "pending"
- Tüm metin alanları Türkçe

SADECE aşağıdaki JSON formatında yanıt ver, başka açıklama ekleme:
${jsonSchema}`
  } else {
    return `Project: ${projeAdi}
Description: ${detayliAciklama}
Release: ${release} — ${label}
Output Language: English

${release} STORIES:
${hikayeListesi}

ACCEPTANCE CRITERIA (per story):
${acListesi}

Generate test cases for each AC above.

RULES:
- Generate minimum 1, maximum 2 TCs per AC
- ac_tip: positive / negative / security / boundary
- TC numbering: TC-ST1-01, TC-ST1-02 (reset when story number changes)
- Every TC must be derived from one of the ACs in the ACCEPTANCE CRITERIA list above
- ac_no: copy the AC number of that AC exactly as listed (e.g. "AC-001") — do not generate a new number or change the format
- ac_metni: copy the exact full text of that AC — do not summarize or modify it
- test_adimlar array: each step in "1. ...", "2. ..." format
- durum always "pending"
- All text fields in English

Return ONLY the following JSON format, no other explanation:
${jsonSchema}`
  }
}

export async function POST(req: Request) {
  let body: {
    projeAdi?: string
    detayliAciklama?: string
    projeDili?: string
    release?: string
    projeBuyuklugu?: string
    hikayeler?: HikayeInput[]
    acler?: AcInput[]
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  const pb = await getKullaniciPlan(supabase, user.id)
  if (!planIzinVeriyor(pb.plan, 'test_senaryosu')) {
    return Response.json({ error: 'PLAN_REQUIRED', requiredPlan: 'analyst' }, { status: 403 })
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 })
  }

  const projeAdi = (body.projeAdi ?? '').trim()
  const detayliAciklama = (body.detayliAciklama ?? '').trim()
  const projeDili = (body.projeDili ?? 'TR').trim().toUpperCase()
  const release = (body.release ?? '').trim().toUpperCase()
  const projeBuyuklugu = (body.projeBuyuklugu ?? 'Orta').trim()
  const hikayeler = body.hikayeler ?? []
  const acler = body.acler ?? []
  const isTR = projeDili === 'TR'

  if (!projeAdi || !detayliAciklama || !RELEASES.has(release)) {
    return Response.json({ error: 'invalid_input' }, { status: 400 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'api_key_missing' }, { status: 500 })
  }
  if (hikayeler.length === 0) {
    return Response.json({ testCases: [], release })
  }

  const maxTokens = MAX_TOKENS[projeBuyuklugu] ?? 12000

  console.log(`[test-senaryosu] başlıyor: release=${release} hikaye=${hikayeler.length} ac=${acler.length} maxTokens=${maxTokens} sistem_uzunluk=${SISTEM.length}`)

  let prompt: string
  try {
    prompt = buildPrompt(projeAdi, detayliAciklama, release, hikayeler, acler, isTR)
    console.log(`[test-senaryosu] prompt hazır: uzunluk=${prompt.length}`)
  } catch (promptErr) {
    console.error('[test-senaryosu] prompt oluşturma hatası:', promptErr)
    return Response.json({ error: 'prompt_build_failed' }, { status: 500 })
  }

  try {
    console.log('[test-senaryosu] Claude API çağrısı başlıyor...')
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })
    console.log(`[test-senaryosu] Claude yanıtı geldi: stop_reason=${response.stop_reason} usage=${JSON.stringify(response.usage)}`)

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    console.log(`[test-senaryosu] ham yanıt uzunluğu=${raw.length}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: { testCases: any[] }
    try {
      parsed = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('[test-senaryosu] JSON parse hatası:', parseErr, '\nHam yanıt (ilk 500):', cleaned.slice(0, 500))
      return Response.json({ error: 'parse_failed' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testCases = (parsed.testCases ?? []).map((tc: any) => ({ ...tc, durum: 'pending' }))
    console.log(`[test-senaryosu] tamamlandı: ${testCases.length} test case`)
    return Response.json({ testCases, release })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack : undefined
    const errName = err instanceof Error ? err.name : typeof err
    console.error('[test-senaryosu] Claude API hatası:', {
      name: errName,
      message: errMsg,
      stack: errStack,
      raw: err,
    })
    return Response.json({ error: 'generation_failed', detail: errMsg }, { status: 500 })
  }
}
