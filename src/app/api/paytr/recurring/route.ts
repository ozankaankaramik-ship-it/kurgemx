import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// PayTR tekrarlayan ödeme — Direct API (Kayıtlı Kart)
// Belgeleme: https://dev.paytr.com/direct-api/kart-saklama
// Merchant panelinizde "Kart Saklama" özelliğinin aktif olması gerekir.
const PAYTR_RECURRING_URL = 'https://www.paytr.com/odeme/api/get-token'

function paytrHmac(parts: string[], salt: string, key: string): string {
  const msg = parts.join('') + salt
  return crypto.createHmac('sha256', key).update(msg).digest('base64')
}

interface AbonelikRow {
  id: string
  kullanici_id: string
  plan_id: string
  paytr_kart_token: string
  sonraki_odeme_tarihi: string
  planlar: {
    id: string
    ad: string
    fiyat_usd: number
  }
  kullanicilar: {
    email: string
    ad: string
    soyad: string
  }
}

export async function POST(request: NextRequest) {
  // Internal-only: Authorization header doğrulama
  const authHeader = request.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET ?? ''

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[paytr/recurring] Yetkisiz erişim denemesi')
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const merchantId   = process.env.PAYTR_MERCHANT_ID!
  const merchantKey  = process.env.PAYTR_MERCHANT_KEY!
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!
  const testMode     = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // sonraki_odeme_tarihi geçmiş, aktif, kart tokenı olan abonelikler
  const { data: abonelikler, error: fetchErr } = await service
    .from('abonelikler')
    .select(`
      id, kullanici_id, plan_id, paytr_kart_token, sonraki_odeme_tarihi,
      planlar!plan_id ( id, ad, fiyat_usd ),
      kullanicilar!kullanici_id ( email, ad, soyad )
    `)
    .eq('durum', 'aktif')
    .not('paytr_kart_token', 'is', null)
    .lte('sonraki_odeme_tarihi', new Date().toISOString())

  if (fetchErr) {
    console.error('[paytr/recurring] Abonelik sorgu hatası:', fetchErr.message)
    return NextResponse.json({ error: 'DB sorgu hatası' }, { status: 500 })
  }

  const rows = (abonelikler ?? []) as unknown as AbonelikRow[]
  console.log(`[paytr/recurring] ${rows.length} abonelik işlenecek`)

  const sonuclar: { abonelik_id: string; durum: string; hata?: string }[] = []

  for (const ab of rows) {
    const plan      = ab.planlar
    const kullanici = ab.kullanicilar

    if (!plan?.fiyat_usd || !kullanici?.email) {
      console.warn(`[paytr/recurring] Eksik veri abonelik=${ab.id}`)
      sonuclar.push({ abonelik_id: ab.id, durum: 'atlandı', hata: 'Eksik plan/kullanıcı verisi' })
      continue
    }

    const merchant_oid   = `KX-${ab.kullanici_id.slice(0, 8)}-${Date.now()}`
    const payment_amount = Math.round(plan.fiyat_usd * 100)
    const currency       = 'TL'
    const no_installment = '1'
    const max_installment = '0'
    const user_ip        = '127.0.0.1' // Tekrarlayan ödeme sunucu tarafından tetiklenir
    const user_basket    = Buffer.from(
      JSON.stringify([[plan.ad, String(plan.fiyat_usd), 1]])
    ).toString('base64')

    const paytr_token = paytrHmac(
      [merchantId, user_ip, merchant_oid, kullanici.email,
       String(payment_amount), user_basket, no_installment, max_installment,
       currency, testMode],
      merchantSalt,
      merchantKey
    )

    console.log(`[paytr/recurring] Ödeme başlatılıyor abonelik=${ab.id} merchant_oid=${merchant_oid}`)

    try {
      const params = new URLSearchParams({
        merchant_id:      merchantId,
        user_ip,
        merchant_oid,
        email:            kullanici.email,
        payment_amount:   String(payment_amount),
        currency,
        user_basket,
        no_installment,
        max_installment,
        paytr_token,
        user_name:        `${kullanici.ad} ${kullanici.soyad}`,
        test_mode:        testMode,
        debug_on:         testMode,
        // Kayıtlı kart token — merchant panelinizde bu özelliğin aktif olması gerekir
        utoken:           ab.paytr_kart_token,
        card_type:        'saved_card',
      })

      const paytrRes  = await fetch(PAYTR_RECURRING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const paytrData = await paytrRes.json() as { status: string; token?: string; reason?: string }

      if (paytrData.status !== 'success') {
        throw new Error(paytrData.reason ?? 'PayTR token alınamadı')
      }

      // odemeler: bekliyor kaydı aç (sonuç callback'ten gelecek)
      await service.from('odemeler').insert({
        kullanici_id:       ab.kullanici_id,
        abonelik_id:        ab.id,
        hedef_plan_id:      plan.id,
        tutar:              plan.fiyat_usd,
        para_birimi:        'TRY',
        paytr_merchant_oid: merchant_oid,
        paytr_odeme_turu:   'card',
        durum:              'bekliyor',
      })

      console.log(`[paytr/recurring] Tetiklendi merchant_oid=${merchant_oid}`)
      sonuclar.push({ abonelik_id: ab.id, durum: 'tetiklendi' })
    } catch (err) {
      const hata = err instanceof Error ? err.message : String(err)
      console.error(`[paytr/recurring] Hata abonelik=${ab.id}:`, hata)

      // Ödeme başarısız — aboneliği pasife al
      await service.from('abonelikler')
        .update({ durum: 'pasif' })
        .eq('id', ab.id)

      console.log(`[paytr/recurring] Abonelik pasife alındı: ${ab.id}`)
      sonuclar.push({ abonelik_id: ab.id, durum: 'basarisiz', hata })
    }
  }

  return NextResponse.json({ islenen: rows.length, sonuclar })
}
