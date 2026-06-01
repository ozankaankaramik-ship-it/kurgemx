import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumu doğrula
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

    // Kullanıcının aktif aboneliğini bul
    const { data: abonelik, error: abErr } = await service
      .from('abonelikler')
      .select('id, plan_id')
      .eq('kullanici_id', user.id)
      .eq('durum', 'aktif')
      .order('baslangic', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (abErr || !abonelik) {
      return NextResponse.json({ error: 'Aktif abonelik bulunamadı' }, { status: 404 })
    }

    console.log(`[paytr/cancel] Abonelik iptal ediliyor kullanici=${user.id} abonelik=${abonelik.id}`)

    const { error: updateErr } = await service
      .from('abonelikler')
      .update({
        durum:        'iptal',
        iptal_tarihi: new Date().toISOString(),
      })
      .eq('id', abonelik.id)

    if (updateErr) {
      console.error(`[paytr/cancel] Update hata:`, updateErr.message)
      return NextResponse.json({ error: 'İptal işlemi başarısız' }, { status: 500 })
    }

    // abonelik_gecmisi kaydı
    await service.from('abonelik_gecmisi').insert({
      kullanici_id:    user.id,
      eski_plan_id:    abonelik.plan_id,
      yeni_plan_id:    abonelik.plan_id,
      degisiklik_turu: 'iptal',
      notlar:          'Kullanıcı tarafından iptal edildi',
    })

    console.log(`[paytr/cancel] İptal tamamlandı kullanici=${user.id}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[paytr/cancel] Beklenmedik hata:', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
