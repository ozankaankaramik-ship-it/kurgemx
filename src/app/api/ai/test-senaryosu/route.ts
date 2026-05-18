import Anthropic from '@anthropic-ai/sdk'
import { genel, testSenaryosu as testStandart } from '@/lib/standartlar'

export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })
const SISTEM = `${genel}\n\n---\n\n${testStandart}`

interface HikayeInput { no: string; ad: string; destan: string; sprint: string }
interface AcInput { hikayeNo: string; no: string; tip: string; metin: string }

const RELEASES = new Set(['R1', 'R2', 'R3'])
const MAX_TOKENS: Record<string, number> = { Küçük: 6000, Orta: 12000, Büyük: 20000 }

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
      return `${h.no} — ${h.ad}:\n` + list.map(ac => `  ${ac.no} [${tipChar[ac.tip] ?? 'P'}]: ${ac.metin}`).join('\n')
    })
    .join('\n\n')

  const jsonSchema = `{
  "testCases": [
    {
      "no": "TC-ST1-01",
      "hikaye": "ST1",
      "acNo": "AC-001",
      "acMetni": "...",
      "release": "${release}",
      "tip": "positive",
      "baslik": "...",
      "onKosul": "...",
      "adimlar": ["1. ...", "2. ...", "3. ..."],
      "beklenenSonuc": "...",
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
- tip alanı: AC tipi [P]→positive, [N]→negative, [S]→security, [B]→boundary
- TC numaralama: TC-ST1-01, TC-ST1-02 (hikaye numarası değişince sıfırla)
- adimlar dizisi: her adım "1. ...", "2. ..." formatında
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
- tip field: AC type [P]→positive, [N]→negative, [S]→security, [B]→boundary
- TC numbering: TC-ST1-01, TC-ST1-02 (reset when story number changes)
- adimlar array: each step in "1. ...", "2. ..." format
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
  const prompt = buildPrompt(projeAdi, detayliAciklama, release, hikayeler, acler, isTR)

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: [{ type: 'text', text: SISTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })

    console.log(`[test-senaryosu] release=${release} stop=${response.stop_reason} tokens=${response.usage?.output_tokens}`)

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: { testCases: any[] }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('[test-senaryosu] JSON parse hatası, raw:', cleaned.substring(0, 300))
      return Response.json({ error: 'parse_failed' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testCases = (parsed.testCases ?? []).map((tc: any) => ({ ...tc, durum: 'pending' }))
    return Response.json({ testCases, release })
  } catch (err) {
    console.error('[test-senaryosu] HATA:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'generation_failed' }, { status: 500 })
  }
}
