import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token'

function paytrHmac(parts: string[], salt: string, key: string): string {
  const msg = parts.join('') + salt
  return crypto.createHmac('sha256', key).update(msg).digest('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan_id } = body as { plan_id?: string }

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id zorunlu' }, { status: 400 })
    }

    const merchantId   = process.env.PAYTR_MERCHANT_ID!
    const merchantKey  = process.env.PAYTR_MERCHANT_KEY!
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!
    const testMode     = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'
    const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kurgemx.com'

    // Kullanıcı oturumu (cookie tabanlı)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Plan bilgisi
    const { data: plan, error: planErr } = await service
      .from('planlar')
      .select('id, ad, fiyat_usd')
      .eq('id', plan_id)
      .single()

    if (planErr || !plan || plan.fiyat_usd == null) {
      return NextResponse.json({ error: 'Plan bulunamadı' }, { status: 404 })
    }

    // Kullanıcı bilgisi
    const { data: kullanici, error: kullaniciErr } = await service
      .from('kullanicilar')
      .select('id, ad, soyad, email')
      .eq('id', user.id)
      .single()

    if (kullaniciErr || !kullanici) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Kullanıcının mevcut aboneliği (freemium dahil)
    const { data: abonelik } = await service
      .from('abonelikler')
      .select('id')
      .eq('kullanici_id', user.id)
      .order('baslangic', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!abonelik) {
      return NextResponse.json({ error: 'Abonelik kaydı bulunamadı' }, { status: 422 })
    }

    const merchant_oid     = `KX-${user.id.slice(0, 8)}-${Date.now()}`
    const payment_amount   = Math.round(plan.fiyat_usd * 100) // TRY kuruş
    const currency         = 'TL'
    const no_installment   = '1'
    const max_installment  = '0'

    // user_basket: [[ürün adı, birim fiyat, adet]]
    const user_basket = Buffer.from(
      JSON.stringify([[plan.ad, String(plan.fiyat_usd), 1]])
    ).toString('base64')

    const user_ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    const paytr_token = paytrHmac(
      [merchantId, user_ip, merchant_oid, kullanici.email,
       String(payment_amount), user_basket, no_installment, max_installment,
       currency, testMode],
      merchantSalt,
      merchantKey
    )

    console.log(`[paytr/token] merchant_oid=${merchant_oid} kullanici=${user.id} plan=${plan.ad} tutar=${payment_amount}`)

    const params = new URLSearchParams({
      merchant_id:       merchantId,
      user_ip,
      merchant_oid,
      email:             kullanici.email,
      payment_amount:    String(payment_amount),
      currency,
      user_basket,
      no_installment,
      max_installment,
      paytr_token,
      user_name:         `${kullanici.ad} ${kullanici.soyad}`,
      merchant_ok_url:   `${appUrl}/odeme/basarili`,
      merchant_fail_url: `${appUrl}/odeme/basarisiz`,
      test_mode:         testMode,
      debug_on:          testMode,
      lang:              'tr',
    })

    const paytrRes  = await fetch(PAYTR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const paytrData = await paytrRes.json() as { status: string; token?: string; reason?: string }

    if (paytrData.status !== 'success' || !paytrData.token) {
      console.error(`[paytr/token] PayTR hata: ${paytrData.reason}`)
      return NextResponse.json({ error: paytrData.reason ?? 'PayTR token alınamadı' }, { status: 502 })
    }

    console.log(`[paytr/token] Token alındı merchant_oid=${merchant_oid}`)

    const { error: insertErr } = await service.from('odemeler').insert({
      kullanici_id:      user.id,
      abonelik_id:       abonelik.id,
      hedef_plan_id:     plan.id,
      tutar:             plan.fiyat_usd,
      para_birimi:       'TRY',
      paytr_merchant_oid: merchant_oid,
      paytr_odeme_turu:  'card',
      durum:             'bekliyor',
    })

    if (insertErr) {
      console.error(`[paytr/token] odemeler insert hata:`, insertErr.message)
    }

    return NextResponse.json({ merchant_oid, token: paytrData.token })
  } catch (err) {
    console.error('[paytr/token] Beklenmedik hata:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
