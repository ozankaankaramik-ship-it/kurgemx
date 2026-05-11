import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { projeGetir, type ProjeDetayRow } from '@/lib/projects/actions'
import SonProjeKaydet from '@/components/SonProjeKaydet'
import CalismaEkrani from '@/components/calisma/CalismaEkrani'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const proje = await projeGetir(id)
  const t = await getTranslations('projeDetay')
  return { title: proje?.ad ?? t('baslik') }
}

export default async function ProjeDetayPage({ params }: Props) {
  const { id } = await params
  const locale = await getLocale()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const projeRaw = await projeGetir(id)

  if (!projeRaw) {
    redirect({ href: '/projeler', locale })
  }

  const proje = projeRaw as ProjeDetayRow
  const t = await getTranslations('projeDetay')

  const { data: dokumanlar, error: dokError } = await supabase
    .from('dokumanlar')
    .select('*')
    .eq('proje_id', proje.id)

  if (dokError) console.error('Doküman hatası:', dokError)

  const backHref = `/${locale}/projeler`
  const backLabel = `← ${t('geri')}`

  return (
    <>
      <SonProjeKaydet id={proje.id} ad={proje.ad} />
      <CalismaEkrani
        initialProje={{
          id: proje.id,
          ad: proje.ad,
          aciklama: proje.aciklama ?? null,
          dil: proje.dil ?? 'TR',
          projeBuyuklugu: proje.proje_buyuklugu ?? null,
        }}
        mevcutDokumanlar={dokumanlar ?? []}
        backHref={backHref}
        backLabel={backLabel}
      />
    </>
  )
}
