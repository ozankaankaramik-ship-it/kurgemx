import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { projeGetir, type ProjeDetayRow } from '@/lib/projects/actions'
import SonProjeKaydet from '@/components/SonProjeKaydet'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

function formatTarih(tarihStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(tarihStr))
}

function dilEtiketiHesapla(dil: string, locale: string) {
  if (locale === 'tr') return dil === 'EN' ? 'İngilizce' : 'Türkçe'
  return dil === 'EN' ? 'English' : 'Turkish'
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

  // İK-004: Uygulama katmanı erişim kontrolü — RLS zaten Supabase seviyesinde korur,
  // burada da null kontrolü yaparak yetkisiz erişimi yakalarız.
  const projeRaw = await projeGetir(id)

  // K7-02: Proje bulunamadı (başka kullanıcıya ait veya mevcut değil) → listeye yönlendir
  if (!projeRaw) {
    redirect({ href: '/projeler', locale })
  }

  const proje = projeRaw as ProjeDetayRow
  const t = await getTranslations('projeDetay')

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 w-full">
      {/* İK-005: Son açılan projeyi localStorage'a kaydet */}
      <SonProjeKaydet id={proje.id} ad={proje.ad} />

      <div className="mb-6">
        <Link
          href="/projeler"
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← {t('geri')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {proje.ad}
          </h1>
          <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {dilEtiketiHesapla(proje.dil, locale)}
          </span>
        </div>

        {proje.aciklama && (
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {proje.aciklama}
          </p>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 dark:border-gray-800 pt-6 text-sm">
          <div>
            <dt className="text-gray-400 dark:text-gray-500 mb-0.5">
              {t('olusturmaTarihi')}
            </dt>
            <dd className="text-gray-700 dark:text-gray-300 font-medium">
              {formatTarih(proje.olusturma_tarihi, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 dark:text-gray-500 mb-0.5">
              {t('sonGuncelleme')}
            </dt>
            <dd className="text-gray-700 dark:text-gray-300 font-medium">
              {formatTarih(proje.guncelleme_tarihi, locale)}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
