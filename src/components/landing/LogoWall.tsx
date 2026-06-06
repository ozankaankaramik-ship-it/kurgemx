import { getTranslations } from 'next-intl/server'

export default async function LogoWall() {
  const t = await getTranslations('landing.logoStrip')

  return (
    <section className="bg-white py-10 px-8 border-y border-kx-border">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center text-[12px] font-semibold text-kx-muted tracking-[0.1em] uppercase">
          {t('kicker')}
        </div>
      </div>
    </section>
  )
}
