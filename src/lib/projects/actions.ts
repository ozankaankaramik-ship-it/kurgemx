'use server'

import { createClient } from '@/lib/supabase/server'

export type ProjeListeRow = {
  id: string
  ad: string
  aciklama: string | null
  dil: string
  durum: string
  guncelleme_tarihi: string
  hikayeler: { count: number }[]
  analiz_dokumanlari: { count: number }[]
}

const SAYFA_BOYUTU = 10

const SELECT =
  'id, ad, aciklama, dil, durum, guncelleme_tarihi, hikayeler(count), analiz_dokumanlari(count)'

export async function projeleriGetir(offset: number): Promise<ProjeListeRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projeler')
    .select(SELECT)
    .order('guncelleme_tarihi', { ascending: false })
    .range(offset, offset + SAYFA_BOYUTU - 1)

  return (data ?? []) as unknown as ProjeListeRow[]
}

export type ProjeDetayRow = {
  id: string
  ad: string
  aciklama: string | null
  dil: string
  durum: string
  kaynak_dokuman_url: string | null
  olusturma_tarihi: string
  guncelleme_tarihi: string
}

export async function projeGetir(id: string): Promise<ProjeDetayRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projeler')
    .select('id, ad, aciklama, dil, durum, kaynak_dokuman_url, olusturma_tarihi, guncelleme_tarihi')
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
