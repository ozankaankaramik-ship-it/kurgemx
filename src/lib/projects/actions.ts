'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProjeListeRow = {
  id: string
  ad: string
  aciklama: string | null
  dil: string
  durum: string
  arsivlendi_tarih: string | null
  hikaye_sayisi: number
  olusturma_tarihi: string
  guncelleme_tarihi: string
  dokumanlar: { tip_id: string }[]
}

const SELECT =
  'id, ad, aciklama, dil, durum, arsivlendi_tarih, hikaye_sayisi, olusturma_tarihi, guncelleme_tarihi, dokumanlar(tip_id)'

export async function projeleriGetir(offset: number, limit = 10): Promise<ProjeListeRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('projeler')
    .select(SELECT)
    .eq('kullanici_id', user.id)
    .order('olusturma_tarihi', { ascending: false })
    .range(offset, offset + limit - 1)

  return (data ?? []) as unknown as ProjeListeRow[]
}

export type ProjeDetayRow = {
  id: string
  ad: string
  aciklama: string | null
  dil: string | null
  durum: string
  arsivlendi_tarih: string | null
  proje_buyuklugu: 'Küçük' | 'Orta' | 'Büyük' | null
  kaynak_dokuman_url: string | null
  olusturma_tarihi: string
  guncelleme_tarihi: string
}

export async function projeGetir(id: string): Promise<ProjeDetayRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projeler')
    .select('id, ad, aciklama, dil, durum, arsivlendi_tarih, proje_buyuklugu, kaynak_dokuman_url, olusturma_tarihi, guncelleme_tarihi')
    .eq('id', id)
    .single()

  return data as ProjeDetayRow | null
}

export async function projeAdiBaskasindaVarMi(ad: string): Promise<boolean> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('projeler')
    .select('id', { count: 'exact', head: true })
    .ilike('ad', ad)

  return (count ?? 0) > 0
}

export async function arsivleProje(projeId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('projeler')
    .update({ durum: 'arsivlendi', arsivlendi_tarih: new Date().toISOString() })
    .eq('id', projeId)
    .eq('kullanici_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/projeler')
  return {}
}
