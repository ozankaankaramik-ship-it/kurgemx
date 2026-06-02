import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token'

function paytrHmac(parts: string[], salt: string, key: string): string {
  const msg = parts.join('') + salt
  return createHmac('sha256', key).update(msg).digest('base64')
}

export async function POST(request: NextRequest) {
  // ── Ortam değişkeni kontrolü ──────────────────────────────────
  const merchantId      = process.env.PAYTR_MERCHANT_ID
  const merchantKey     = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt    = process.env.PAYTR_MERCHANT_SALT
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!merchantId || !merchantKey || !merchantSalt) {
    console.error('[paytr/token] Eksik env: PAYTR_MERCHANT_ID / PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT')
    return NextResponse.json({ error: 'Ödeme servisi yapılandırılmamış' }, { status: 503 })
  }

  if (!serviceRoleKey) {
    console.error('[paytr/token] Eksik env: SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Veritabanı servisi yapılandırılmamış' }, { status: 503 })
  }

  const testMode = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kurgemx.com'

  try {
    // ── Request body ──────────────────────────────────────────────
    const body = await request.json()
    const { plan_id, locale = 'tr' } = body as { plan_id?: string; locale?: string }

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id zorunlu' }, { status: 400 })
    }

    // ── Kullanıcı oturumu (cookie tabanlı) ────────────────────────
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

    console.log(`[paytr/token] Kullanıcı doğrulandı: ${user.id}`)

    // ── Service role client ───────────────────────────────────────
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // ── Plan bilgisi ──────────────────────────────────────────────
    const { data: plan, error: planErr } = await service
      .from('planlar')
      .select('id, ad, fiyat_usd, fiyat_tl')
      .eq('id', plan_id)
      .single()

    if (planErr || !plan || plan.fiyat_tl == null) {
      console.error('[paytr/token] Plan bulunamadı:', planErr?.message)
      return NextResponse.json({ error: 'Plan bulunamadı' }, { status: 404 })
    }

    console.log(`[paytr/token] Plan: ${plan.ad} (${plan.fiyat_tl} TRY)`)

    // ── Kullanıcı bilgisi ─────────────────────────────────────────
    const { data: kullanici, error: kullaniciErr } = await service
      .from('kullanicilar')
      .select('id, ad, soyad, email')
      .eq('id', user.id)
      .single()

    if (kullaniciErr || !kullanici) {
      console.error('[paytr/token] Kullanıcı kaydı bulunamadı:', kullaniciErr?.message)
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // ── Kullanıcının mevcut aboneliği ─────────────────────────────
    const { data: abonelik, error: abonelikErr } = await service
      .from('abonelikler')
      .select('id')
      .eq('kullanici_id', user.id)
      .in('durum', ['aktif', 'pasif'])
      .order('baslangic', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (abonelikErr) {
      console.error('[paytr/token] Abonelik sorgu hatası:', abonelikErr.message)
      return NextResponse.json({ error: 'Abonelik bilgisi alınamadı' }, { status: 500 })
    }

    if (!abonelik) {
      console.error(`[paytr/token] Abonelik bulunamadı: kullanici=${user.id}`)
      return NextResponse.json({ error: 'Abonelik kaydı bulunamadı' }, { status: 422 })
    }

    // ── PayTR parametreleri ───────────────────────────────────────
    const merchant_oid    = `KX${user.id.replace(/-/g, '').slice(0, 8)}${Date.now()}`
    const payment_amount  = Math.round(plan.fiyat_tl * 100)
    const currency        = 'TL'
    const no_installment  = '1'
    const max_installment = '0'

    const user_basket = Buffer.from(
      JSON.stringify([[plan.ad, String(plan.fiyat_tl), 1]])
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

    console.log(`[paytr/token] İstek hazırlandı: merchant_oid=${merchant_oid} user_ip=${user_ip} tutar=${payment_amount}`)

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
      user_address:      'Türkiye',
      user_phone:        '05000000000',
      merchant_ok_url:   `${appUrl}/${locale}/odeme/basarili`,
      merchant_fail_url: `${appUrl}/${locale}/odeme/basarisiz`,
      test_mode:         testMode,
      debug_on:          testMode,
      lang:              'tr',
    })

    // ── PayTR API çağrısı (kendi try/catch bloğu) ─────────────────
    let paytrData: { status: string; token?: string; reason?: string }
    try {
      const paytrRes = await fetch(PAYTR_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString(),
        cache:   'no-store',
      })

      const rawText = await paytrRes.text()
      console.log(`[paytr/token] PayTR yanıt (${paytrRes.status}): ${rawText.slice(0, 300)}`)

      try {
        paytrData = JSON.parse(rawText)
      } catch {
        console.error(`[paytr/token] PayTR JSON parse hatası. Ham yanıt: ${rawText.slice(0, 500)}`)
        return NextResponse.json(
          { error: `PayTR geçersiz yanıt döndürdü (HTTP ${paytrRes.status})` },
          { status: 502 }
        )
      }
    } catch (fetchErr) {
      console.error('[paytr/token] PayTR bağlantı hatası:', fetchErr)
      return NextResponse.json({ error: 'Ödeme servisiyle bağlantı kurulamadı' }, { status: 502 })
    }

    if (paytrData.status !== 'success' || !paytrData.token) {
      console.error(`[paytr/token] PayTR hata: ${paytrData.reason}`)
      return NextResponse.json(
        { error: paytrData.reason ?? 'PayTR token alınamadı' },
        { status: 502 }
      )
    }

    console.log(`[paytr/token] Token alındı: merchant_oid=${merchant_oid}`)

    // ── Ödeme kaydı aç ────────────────────────────────────────────
    const { error: insertErr } = await service.from('odemeler').insert({
      kullanici_id:       user.id,
      abonelik_id:        abonelik.id,
      hedef_plan_id:      plan.id,
      tutar:              plan.fiyat_tl,
      para_birimi:        'TRY',
      paytr_merchant_oid: merchant_oid,
      paytr_odeme_turu:   'card',
      durum:              'bekliyor',
    })

    if (insertErr) {
      // Token zaten alındı; kaydı oluşturamadık ama ödeme devam edebilir
      console.error('[paytr/token] odemeler insert hatası:', insertErr.message)
    }

    return NextResponse.json({ merchant_oid, token: paytrData.token })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[paytr/token] Beklenmedik hata:', msg)
    return NextResponse.json({ error: `Sunucu hatası: ${msg}` }, { status: 500 })
  }
}
