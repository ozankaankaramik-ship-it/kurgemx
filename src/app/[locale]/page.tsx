import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import type { Metadata } from 'next'

import Hero from '@/components/landing/Hero'
import LogoWall from '@/components/landing/LogoWall'
import BeforeAfter from '@/components/landing/BeforeAfter'
import Features from '@/components/landing/Features'
import VideoSection from '@/components/landing/VideoSection'
import UseCases from '@/components/landing/UseCases'
import Testimonial from '@/components/landing/Testimonial'
import PricingTeaser from '@/components/landing/PricingTeaser'
import FinalCTA from '@/components/landing/FinalCTA'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing.meta' })
  const title = t('title')
  const description = t('description')
  return {
    title: { absolute: title },
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: `https://kurgemx.com/${locale}`,
      languages: {
        tr: 'https://kurgemx.com/tr',
        en: 'https://kurgemx.com/en',
        'x-default': 'https://kurgemx.com',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://kurgemx.com/${locale}`,
      images: [{ url: 'https://kurgemx.com/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  // Authenticated → straight to project list (unchanged behavior)
  if (user) {
    redirect({ href: '/projeler', locale })
  }

  return (
    <main className="flex-1">
      <Hero />
      <LogoWall />
      <BeforeAfter />
      <Features />
      <VideoSection />
      <UseCases />
      <Testimonial />
      <PricingTeaser />
      <FinalCTA />
    </main>
  )
}
