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

  // Pasif kullanıcı kontrolü — giriş başarılıysa kullanıcı durumunu kontrol et
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: kullanici } = await supabase
      .from('kullanicilar')
      .select('durum')
      .eq('id', user.id)
      .single()
    if (kullanici?.durum === 'pasif') {
      await supabase.auth.signOut()
      return { error: 'hesap_pasif' }
    }
  }

  return { success: 'ok' }
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
  const terms = formData.get('terms')
  const locale = (formData.get('locale') as string) || 'tr'

  if (!kvkk) return { error: 'kvkk_required' }
  if (!terms) return { error: 'terms_required' }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const now = new Date().toISOString()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ad,
        soyad,
        kvkk_onay: true,
        kvkk_tarih: now,
        terms_onay: true,
        terms_onay_tarih: now,
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
      kvkk_tarih: now,
      terms_onay: true,
      terms_onay_tarih: now,
    })
    redirect(`/${locale}`)
  }

  return { success: 'emailGonderildi' }
}

// Google ile giriş / kayıt
export async function googleIleGiris(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'tr'
  const kvkk  = formData.get('kvkk')  === 'on' ? 'true' : 'false'
  const terms = formData.get('terms') === 'on' ? 'true' : 'false'

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'kurgemx.com'
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const origin = headersList.get('origin') || `${proto}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=/${locale}&kvkk=${kvkk}&terms=${terms}`,
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

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://kurgemx.com/en/auth/callback',
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

// Hesap silme talebi
export async function hesapSilTalebi(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const locale = (formData.get('locale') as string) || 'tr'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'genel' }

  const { error } = await supabase
    .from('kullanicilar')
    .update({ durum: 'pasif', silme_talep_tarihi: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'genel' }

  // Destek mailı
  try {
    const { sendSupportMail, sendUserMail } = await import('@/lib/email')
    const ad = (user.user_metadata?.ad as string | undefined) || user.email || ''
    await sendSupportMail(
      `[Hesap Silme Talebi] ${user.email}`,
      `<p>Kullanıcı <strong>${ad}</strong> (${user.email}) hesabını silme talebinde bulundu.</p><p>Kullanıcı ID: ${user.id}</p><p>Talep zamanı: ${new Date().toISOString()}</p>`,
    )
    await sendUserMail(
      user.email!,
      locale === 'tr' ? 'KurgemX — Hesap Silme Talebiniz Alındı' : 'KurgemX — Account Deletion Request Received',
      locale === 'tr'
        ? `<p>Merhaba,</p><p>Hesabınızı silme talebiniz alındı. Hesabınız <strong>30 gün içinde</strong> kalıcı olarak silinecektir. Bu süre içinde giriş yapamayacaksınız.</p><p>Herhangi bir sorunuz için <a href="mailto:support@kurgemx.com">support@kurgemx.com</a> adresine yazabilirsiniz.</p><p>KurgemX Ekibi</p>`
        : `<p>Hello,</p><p>Your account deletion request has been received. Your account will be permanently deleted within <strong>30 days</strong>. During this period, you will not be able to log in.</p><p>For any questions, contact <a href="mailto:support@kurgemx.com">support@kurgemx.com</a>.</p><p>KurgemX Team</p>`,
    )
  } catch (emailErr) {
    console.error('[hesapSilTalebi] mail hatası:', emailErr)
  }

  await supabase.auth.signOut()
  redirect(`/${locale}`)
}

// Pazarlama onayını güncelle
export async function pazarlamaOnayGuncelle(onay: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const { error } = await supabase
    .from('kullanicilar')
    .update({
      pazarlama_onay:       onay,
      pazarlama_onay_tarih: onay ? new Date().toISOString() : null,
    })
    .eq('id', user.id)

  if (error) return { error: 'db' }
  return {}
}

// Yasal onayları kaydet (OAuth sonrası modal)
export async function onaylariKaydet(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('kullanicilar')
    .update({
      kvkk_onay:        true,
      kvkk_tarih:       now,
      terms_onay:       true,
      terms_onay_tarih: now,
    })
    .eq('id', user.id)

  if (error) return { error: 'db' }
  return {}
}

// Şifre değiştirme (oturum açıkken)
export async function sifreDegistir(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const yeniSifre = formData.get('yeniSifre') as string
  const yeniSifreTekrar = formData.get('yeniSifreTekrar') as string

  if (yeniSifre.length < 8) return { error: 'sifre_kisa' }
  if (yeniSifre !== yeniSifreTekrar) return { error: 'sifre_eslesmiyor' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: yeniSifre })
  if (error) return { error: 'genel' }
  return { success: 'ok' }
}

// Çıkış
export async function cikisYap(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'tr'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}`)
}
