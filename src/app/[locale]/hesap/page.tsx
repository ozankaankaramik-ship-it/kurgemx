import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getKullaniciPlan } from '@/lib/abonelik'
import type { Metadata } from 'next'
import HesapIstemci from './HesapIstemci'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hesap')
  return { title: t('baslik') }
}

export default async function HesapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) redirect({ href: '/giris', locale })

  const planBilgisi = await getKullaniciPlan(supabase, user!.id)
  const t = await getTranslations('hesap')

  const ad    = (user!.user_metadata?.ad    as string | undefined) ?? ''
  const soyad = (user!.user_metadata?.soyad as string | undefined) ?? ''
  const email = user!.email ?? ''

  const displayName = [ad, soyad].filter(Boolean).join(' ') || email.split('@')[0]
  const initials    = displayName.slice(0, 2).toUpperCase()

  return (
    <main className="flex-1 bg-kx-bg">
      <div className="max-w-[900px] mx-auto px-6 py-10 pb-24 w-full">
        <HesapIstemci
          user={{ id: user!.id, email, ad, soyad, displayName, initials }}
          planBilgisi={planBilgisi}
          locale={locale}
          labels={{
            temelBilgiler:   t('temelBilgiler'),
            ad:              t('ad'),
            soyad:           t('soyad'),
            email:           t('email'),
            sifreDegistir:   t('sifreDegistir'),
            yeniSifre:       t('yeniSifre'),
            yeniSifreTekrar: t('yeniSifreTekrar'),
            kaydet:          t('kaydet'),
            kaydedildi:      t('kaydedildi'),
            abonelik:        t('abonelik'),
            mevcutPlan:      t('mevcutPlan'),
            aylikKullanim:   t('aylikKullanim'),
            planiYukselt:    t('planiYukselt'),
            hesapSilBtn:     t('hesapSilBtn'),
            hesapSilAciklama: t('hesapSilAciklama'),
            hesapSilOnay:    t('hesapSilOnay'),
            hatalar: {
              sifre_kisa:       t('hatalar.sifre_kisa'),
              sifre_eslesmiyor: t('hatalar.sifre_eslesmiyor'),
              genel:            t('hatalar.genel'),
            },
          }}
        />
      </div>
    </main>
  )
}
