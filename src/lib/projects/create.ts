'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export type ProjeOlusturState = {
  error?: string
  warning?: 'duplicate'
} | null

const IZIN_VERILEN_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])
const MAX_DOSYA = 10 * 1024 * 1024
const MAX_ACIKLAMA = 500

export async function projeOlustur(
  prevState: ProjeOlusturState,
  formData: FormData
): Promise<ProjeOlusturState> {
  const ad = ((formData.get('ad') as string) ?? '').trim()
  const aciklama = ((formData.get('aciklama') as string) ?? '').trim().slice(0, MAX_ACIKLAMA)
  const dil = (formData.get('dil') as string) || 'TR'
  const force = formData.get('force') === 'true'
  const dosya = formData.get('kaynak_dokuman') as File | null
  const gercekDosya = dosya && dosya.size > 0 ? dosya : null

  // İK-001
  if (!ad) return { error: 'ad_zorunlu' }
  if (ad.length > 100) return { error: 'ad_uzun' }

  // İK-009
  if (gercekDosya) {
    if (gercekDosya.size > MAX_DOSYA) return { error: 'dosya_buyuk' }
    if (!IZIN_VERILEN_MIME.has(gercekDosya.type)) return { error: 'dosya_format' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'yetkisiz' }

  // K6-05: mükerrer ad kontrolü (soft — force ile geçilebilir)
  if (!force) {
    const { count } = await supabase
      .from('projeler')
      .select('id', { count: 'exact', head: true })
      .eq('kullanici_id', user.id)
      .ilike('ad', ad)
    if ((count ?? 0) > 0) return { warning: 'duplicate' }
  }

  const projeId = crypto.randomUUID()
  let kaynakDokumanUrl: string | null = null
  let pdfBuffer: ArrayBuffer | null = null

  if (gercekDosya) {
    if (gercekDosya.type === 'application/pdf') {
      pdfBuffer = await gercekDosya.arrayBuffer()
    }

    const dosyaYolu = `${user.id}/${projeId}/${gercekDosya.name}`
    const { error: uploadError } = await supabase.storage
      .from('kaynak-dokumanlar')
      .upload(dosyaYolu, gercekDosya, { contentType: gercekDosya.type, upsert: false })

    if (uploadError) return { error: 'dosya_yuklenemedi' }

    const { data: urlData } = supabase.storage
      .from('kaynak-dokumanlar')
      .getPublicUrl(dosyaYolu)
    kaynakDokumanUrl = urlData.publicUrl
  }

  // İK-010: AI özet üretimi
  const aiOzet = await aiOzetUret(
    aciklama,
    pdfBuffer,
    gercekDosya?.name ?? null,
    dil
  )

  const { error: insertError } = await supabase
    .from('projeler')
    .insert({
      id: projeId,
      kullanici_id: user.id,
      ad,
      aciklama: aiOzet,
      dil,
      kaynak_dokuman_url: kaynakDokumanUrl,
      durum: 'aktif',
    })

  if (insertError) return { error: 'genel' }

  const locale = await getLocale()
  redirect(`/${locale}/projeler/${projeId}`)
}

export type ProjeOlusturVeDonState = {
  error?: string
  id?: string
} | null

export async function projeOlusturVeDon(
  _prev: ProjeOlusturVeDonState,
  formData: FormData
): Promise<ProjeOlusturVeDonState> {
  const ad = ((formData.get('ad') as string) ?? '').trim()
  const aciklama = ((formData.get('aciklama') as string) ?? '').trim().slice(0, 5000)
  const dil = (formData.get('dil') as string) || 'EN'

  if (!ad) return { error: 'ad_zorunlu' }
  if (ad.length > 100) return { error: 'ad_uzun' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'yetkisiz' }

  const projeId = crypto.randomUUID()

  const { error: insertError } = await supabase
    .from('projeler')
    .insert({
      id: projeId,
      kullanici_id: user.id,
      ad,
      aciklama: aciklama || null,
      dil,
      durum: 'aktif',
    })

  if (insertError) return { error: 'genel' }

  return { id: projeId }
}

async function aiOzetUret(
  aciklama: string,
  pdfBuffer: ArrayBuffer | null,
  dosyaAdi: string | null,
  dil: string
): Promise<string | null> {
  if (!aciklama && !pdfBuffer && !dosyaAdi) return null

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return aciklama || null

  try {
    const anthropic = new Anthropic({ apiKey })

    const dilTalimati =
      dil === 'EN'
        ? 'Write the summary in English.'
        : 'Özeti Türkçe yaz.'

    const sistem =
      `KurgemX iş analizi platformu için kısa, profesyonel bir proje özeti oluştur (3–5 cümle). ` +
      `Projenin amacını, kapsamını ve temel hedeflerini özetle. ${dilTalimati}`

    type ContentBlock =
      | Anthropic.TextBlockParam
      | Anthropic.DocumentBlockParam

    const icerik: ContentBlock[] = []

    if (pdfBuffer) {
      const base64 = Buffer.from(pdfBuffer).toString('base64')
      icerik.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      } as Anthropic.DocumentBlockParam)
    }

    const metinParcalari: string[] = []
    if (aciklama) metinParcalari.push(`Proje açıklaması: ${aciklama}`)
    if (dosyaAdi && !pdfBuffer)
      metinParcalari.push(`Kaynak doküman yüklendi: ${dosyaAdi}`)
    if (metinParcalari.length > 0) {
      icerik.push({ type: 'text', text: metinParcalari.join('\n') })
    }

    if (icerik.length === 0) return aciklama || null

    const yanit = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: [{ type: 'text', text: sistem, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: icerik }],
    })

    const ilkBlok = yanit.content[0]
    return ilkBlok.type === 'text' ? ilkBlok.text : (aciklama || null)
  } catch {
    return aciklama || null
  }
}
