import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import ProjeListesi from '@/components/ProjeListesi'
import { projeleriGetir } from '@/lib/projects/actions'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projeler')
  return { title: t('baslik') }
}

export default async function ProjelerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const locale = await getLocale()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const t = await getTranslations('projeler')

  const ilkProjeler = await projeleriGetir(0)

  // K8-03: 10'dan fazla varsa "Daha Fazla Göster" butonu sunulur
  const { count } = await supabase
    .from('projeler')
    .select('id', { count: 'exact', head: true })

  const toplamSayiVar = (count ?? 0) > 10

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('baslik')}
        </h1>
        {ilkProjeler.length > 0 && (
          <Link
            href="/projeler/yeni"
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
          >
            {t('yeniProje')}
          </Link>
        )}
      </div>

      <ProjeListesi
        initialProjeler={ilkProjeler}
        toplamSayiVar={toplamSayiVar}
      />
    </main>
  )
}
