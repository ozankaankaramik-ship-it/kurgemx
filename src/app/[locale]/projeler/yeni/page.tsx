import { redirect } from '@/i18n/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import CalismaEkrani from '@/components/calisma/CalismaEkrani'
import PipelinePreview, { YeniProjeHeader } from '@/components/calisma/PipelinePreview'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('yeniProje')
  return { title: t('baslik') }
}

/**
 * /projeler/yeni — refreshed.
 *
 * The actual Adim1Formu (with all AI streaming logic) is mounted via
 * CalismaEkrani in the existing repo. We wrap it in a refreshed page chrome:
 *   - Navbar (in-app)
 *   - Breadcrumb + "Adım 1 / 5" header
 *   - The form card (unchanged behavior, refreshed styling via Adim1Formu.tsx)
 *   - PipelinePreview showing the 5 steps below
 *
 * NOTE: CalismaEkrani in the repo controls the workflow state and renders
 * Adim1Formu when no projeId exists. Once the project is created, the URL
 * changes via history.replaceState and the same component renders the rest
 * of the steps. We don't fight that — we just provide a nicer container.
 */
export default async function YeniProjePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    redirect({ href: '/giris', locale })
  }

  const t = await getTranslations('yeniProje')

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-kx-bg">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 pt-8 pb-20 w-full">

          <YeniProjeHeader
            breadcrumb={{ label: 'Projelerim', href: '/projeler' }}
            pill={locale === 'tr' ? 'Adım 1 / 5' : 'Step 1 / 5'}
            title={t('baslik')}
            subtitle={
              locale === 'tr'
                ? "Projeni adlandır ve birkaç cümleyle anlat. KurgemX'in YZ'si dakikalar içinde detaylı bir taslağa dönüştürecek."
                : "Name your project and describe it in a few sentences. KurgemX's AI will turn it into a detailed draft in minutes."
            }
          />

          {/* Form card — CalismaEkrani renders Adim1Formu when projeId is null */}
          <div className="bg-white rounded-2xl border border-kx-border p-8 shadow-kx-card">
            <CalismaEkrani />
          </div>

          <PipelinePreview activeStep={1} />
        </div>
      </main>
    </>
  )
}
