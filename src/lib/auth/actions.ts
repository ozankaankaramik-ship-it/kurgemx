'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; success?: string } | null

// E-posta / şifre ile giriş
export async function girisYap(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const locale = (formData.get('locale') as string) || 'tr'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'invalid_credentials' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'email_not_confirmed' }
    }
    return { error: 'genel' }
  }

  redirect(`/${locale}`)
}

// E-posta / şifre ile kayıt
export async function kayitOl(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const ad = formData.get('ad') as string
  const soyad = formData.get('soyad') as string
  const kvkk = formData.get('kvkk')
  const locale = (formData.get('locale') as string) || 'tr'

  if (!kvkk) {
    return { error: 'kvkk_required' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ad,
        soyad,
        kvkk_onay: true,
        kvkk_tarih: new Date().toISOString(),
      },
      emailRedirectTo: `${siteUrl}/api/auth/callback?next=/${locale}`,
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: 'user_exists' }
    }
    return { error: 'genel' }
  }

  // E-posta doğrulama devre dışıysa oturum hemen açılır
  if (data.session && data.user) {
    await supabase.from('kullanicilar').upsert({
      id: data.user.id,
      email: data.user.email!,
      ad,
      soyad,
      kvkk_onay: true,
      kvkk_tarih: new Date().toISOString(),
    })
    redirect(`/${locale}`)
  }

  return { success: 'emailGonderildi' }
}

// Google ile giriş / kayıt
export async function googleIleGiris(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'tr'
  const kvkk = formData.get('kvkk') === 'on' ? 'true' : 'false'

  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/${locale}&kvkk=${kvkk}`,
    },
  })

  if (error || !data.url) {
    const loginPath = locale === 'en' ? 'login' : 'giris'
    redirect(`/${locale}/${loginPath}?error=oauth`)
  }

  redirect(data.url)
}

// Şifre sıfırlama e-postası gönder
export async function sifreSifirla(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const locale = (formData.get('locale') as string) || 'tr'

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/${locale}/sifre-guncelle&type=recovery`,
  })

  if (error) {
    return { error: 'genel' }
  }

  return { success: 'basariMesaji' }
}

// Yeni şifre belirleme (reset e-postasından gelindikten sonra)
export async function sifreGuncelle(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  if (password.length < 8) {
    return { error: 'sifre_kisa' }
  }
  if (password !== passwordConfirm) {
    return { error: 'sifre_eslesmiyor' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    if (error.message.includes('session')) {
      return { error: 'oturum_yok' }
    }
    return { error: 'genel' }
  }

  return { success: 'basariMesaji' }
}

// Çıkış
export async function cikisYap(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'tr'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}`)
}
