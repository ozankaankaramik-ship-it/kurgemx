import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// PayTR zorunlu kılar: response tam olarak "OK" olmalı
function ok() {
  return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

function verifyHash(
  merchant_oid: string,
  status: string,
  total_amount: string,
  salt: string,
  key: string,
  received: string
): boolean {
  const expected = crypto
    .createHmac('sha256', key)
    .update(merchant_oid + salt + status + total_amount)
    .digest('base64')
  return expected === received
}

export async function POST(request: NextRequest) {
  let merchant_oid = '(bilinmiyor)'
  try {
    const form = await request.formData()

    const get = (k: string) => form.get(k)?.toString() ?? ''
    merchant_oid         = get('merchant_oid')
    const status         = get('status')
    const total_amount   = get('total_amount')
    const hash           = get('hash')
    const payment_type   = get('payment_type')
    const failed_code    = get('failed_reason_code')
    const failed_msg     = get('failed_reason_msg')
    // Kart saklama özelliği aktifse PayTR utoken döner
    const utoken         = get('utoken') || null

    const merchantKey  = process.env.PAYTR_MERCHANT_KEY!
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!

    console.log(`[paytr/callback] merchant_oid=${merchant_oid} status=${status}`)

    // --- Hash doğrulama (güvenlik kritik) ---
    if (!verifyHash(merchant_oid, status, total_amount, merchantSalt, merchantKey, hash)) {
      console.error(`[paytr/callback] Hash doğrulama BAŞARISIZ merchant_oid=${merchant_oid}`)
      // PayTR tekrar dener; "OK" dönmeyerek bilerek reddediyoruz
      return new Response('HASH_ERROR', { status: 400 })
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Ödeme kaydını bul
    const { data: odeme, error: odemeErr } = await service
      .from('odemeler')
      .select('id, kullanici_id, abonelik_id, hedef_plan_id, durum')
      .eq('paytr_merchant_oid', merchant_oid)
      .maybeSingle()

    if (odemeErr || !odeme) {
      console.error(`[paytr/callback] Ödeme kaydı bulunamadı: ${merchant_oid}`)
      // Kayıt yoksa yine "OK" döner — PayTR'ın sonsuz döngüsünü engelle
      return ok()
    }

    // Daha önce işlenmiş bildirim (idempotency)
    if (odeme.durum !== 'bekliyor') {
      console.log(`[paytr/callback] Zaten işlendi merchant_oid=${merchant_oid} durum=${odeme.durum}`)
      return ok()
    }

    // --- Başarılı ödeme ---
    if (status === 'success') {
      const sonrakiOdemeTarihi = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // odemeler: başarılı yap
      await service.from('odemeler').update({
        durum:           'basarili',
        paytr_odeme_turu: payment_type || 'card',
        odeme_tarihi:    new Date().toISOString(),
      }).eq('id', odeme.id)

      console.log(`[paytr/callback] Ödeme başarılı merchant_oid=${merchant_oid}`)

      // abonelikler: plan güncelle
      const abonelikUpdate: Record<string, unknown> = {
        durum:                 'aktif',
        sonraki_odeme_tarihi:  sonrakiOdemeTarihi,
        odeme_platformu:       'paytr',
        odeme_referans_no:     merchant_oid,
      }
      if (odeme.hedef_plan_id) abonelikUpdate.plan_id = odeme.hedef_plan_id
      if (utoken)              abonelikUpdate.paytr_kart_token = utoken

      await service.from('abonelikler')
        .update(abonelikUpdate)
        .eq('id', odeme.abonelik_id)

      // abonelik_gecmisi: yenileme kaydı
      if (odeme.hedef_plan_id) {
        const { data: mevcutAb } = await service
          .from('abonelikler')
          .select('plan_id')
          .eq('id', odeme.abonelik_id)
          .single()

        await service.from('abonelik_gecmisi').insert({
          kullanici_id:     odeme.kullanici_id,
          eski_plan_id:     mevcutAb?.plan_id ?? null,
          yeni_plan_id:     odeme.hedef_plan_id,
          degisiklik_turu:  'yenileme',
          odeme_platformu:  'paytr',
        })
      }

      console.log(`[paytr/callback] Abonelik güncellendi kullanici=${odeme.kullanici_id}`)
    } else {
      // --- Başarısız ödeme ---
      const hataMesaji = [failed_code, failed_msg].filter(Boolean).join(' | ') || 'Ödeme reddedildi'

      await service.from('odemeler').update({
        durum:            'basarisiz',
        paytr_odeme_turu: payment_type || 'card',
        hata_mesaji:      hataMesaji,
      }).eq('id', odeme.id)

      console.log(`[paytr/callback] Ödeme başarısız merchant_oid=${merchant_oid} hata=${hataMesaji}`)
    }

    return ok()
  } catch (err) {
    console.error(`[paytr/callback] Beklenmedik hata merchant_oid=${merchant_oid}:`, err)
    // Hata durumunda "OK" döndür; tekrar bildirim gelirse kayıt zaten 'bekliyor' olmayacak
    return ok()
  }
}
