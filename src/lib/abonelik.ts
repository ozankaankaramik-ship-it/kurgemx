import type { SupabaseClient } from '@supabase/supabase-js'

export interface PlanDetay {
  id: string
  kod: string
  ad: string
  fiyat_usd: number | null
  aylik_proje_limiti: number | null
  proje_basi_max_hikaye: number | null
  kucuk_proje: boolean
  orta_proje: boolean
  buyuk_proje: boolean
  max_buyuk_proje: number | null
  prototip: boolean
  test_senaryosu: boolean
  export: boolean
  kullanici_yonetimi: boolean
  sso: boolean
}

export interface AbonelikDetay {
  id: string
  aylik_proje_sayaci: number
  aylik_buyuk_proje_sayaci: number
  sayac_sifirlama_tarihi: string | null
  email_dogrulandi: boolean
  sonraki_odeme_tarihi: string | null
}

export interface PlanBilgisi {
  plan: PlanDetay
  abonelik: AbonelikDetay | null
}

export type PlanOzellik =
  | 'prototip'
  | 'test_senaryosu'
  | 'export'
  | 'orta_proje'
  | 'buyuk_proje'

export const FREEMIUM_PLAN: PlanDetay = {
  id: '',
  kod: 'freemium',
  ad: 'Freemium',
  fiyat_usd: 0,
  aylik_proje_limiti: 1,
  proje_basi_max_hikaye: 5,
  kucuk_proje: true,
  orta_proje: false,
  buyuk_proje: false,
  max_buyuk_proje: null,
  prototip: false,
  test_senaryosu: false,
  export: false,
  kullanici_yonetimi: false,
  sso: false,
}

export async function getKullaniciPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanBilgisi> {
  const { data, error } = await supabase
    .from('abonelikler')
    .select(`
      id,
      aylik_proje_sayaci,
      aylik_buyuk_proje_sayaci,
      sayac_sifirlama_tarihi,
      email_dogrulandi,
      sonraki_odeme_tarihi,
      plan:planlar!plan_id (
        id, kod, ad, fiyat_usd,
        aylik_proje_limiti, proje_basi_max_hikaye,
        kucuk_proje, orta_proje, buyuk_proje, max_buyuk_proje,
        prototip, test_senaryosu, export,
        kullanici_yonetimi, sso
      )
    `)
    .eq('kullanici_id', userId)
    .eq('durum', 'aktif')
    .order('baslangic', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data || !data.plan) {
    return { plan: FREEMIUM_PLAN, abonelik: null }
  }

  // Lazy reset: sayaç sıfırlama tarihi geçmişse sıfırla
  let sayaci = data.aylik_proje_sayaci ?? 0
  const sifirlama = data.sayac_sifirlama_tarihi
  if (sifirlama && new Date() >= new Date(sifirlama)) {
    const nextReset = new Date()
    nextReset.setDate(1)
    nextReset.setMonth(nextReset.getMonth() + 1)
    nextReset.setHours(0, 0, 0, 0)
    await supabase
      .from('abonelikler')
      .update({
        aylik_proje_sayaci: 0,
        aylik_buyuk_proje_sayaci: 0,
        sayac_sifirlama_tarihi: nextReset.toISOString(),
      })
      .eq('id', data.id)
    sayaci = 0
  }

  return {
    plan: data.plan as unknown as PlanDetay,
    abonelik: {
      id: data.id,
      aylik_proje_sayaci: sayaci,
      aylik_buyuk_proje_sayaci: data.aylik_buyuk_proje_sayaci ?? 0,
      sayac_sifirlama_tarihi: sifirlama ?? null,
      email_dogrulandi: data.email_dogrulandi ?? false,
      sonraki_odeme_tarihi: data.sonraki_odeme_tarihi ?? null,
    },
  }
}

export function planIzinVeriyor(plan: PlanDetay, ozellik: PlanOzellik): boolean {
  return (plan as unknown as Record<string, unknown>)[ozellik] === true
}

export function limiteDoldu(planBilgisi: PlanBilgisi): boolean {
  if (planBilgisi.plan.aylik_proje_limiti === null) return false
  if (!planBilgisi.abonelik) return false
  return planBilgisi.abonelik.aylik_proje_sayaci >= planBilgisi.plan.aylik_proje_limiti
}
