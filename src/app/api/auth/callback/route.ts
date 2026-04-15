import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en'
  const kvkk = searchParams.get('kvkk') === 'true'

  if (!code) {
    return NextResponse.redirect(new URL('/en/login', request.url))
  }

  // Redirect response'u önceden oluştur; Supabase oturum cookie'leri buna yazılacak
  const response = NextResponse.redirect(new URL(next, request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/tr/giris?error=auth', request.url))
  }

  const user = data.user

  // kullanicilar kaydı yoksa oluştur
  const { data: existing } = await supabase
    .from('kullanicilar')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    const meta = user.user_metadata ?? {}
    const fullName: string = meta.full_name ?? ''
    const ad: string = meta.ad || meta.given_name || fullName.split(' ')[0] || 'Ad'
    const soyad: string =
      meta.soyad || meta.family_name || fullName.split(' ').slice(1).join(' ') || 'Soyad'
    const kvkk_onay: boolean = kvkk || meta.kvkk_onay === true

    await supabase.from('kullanicilar').insert({
      id: user.id,
      email: user.email!,
      ad,
      soyad,
      kvkk_onay,
      kvkk_tarih: kvkk_onay ? new Date().toISOString() : null,
    })
  }

  return response
}
