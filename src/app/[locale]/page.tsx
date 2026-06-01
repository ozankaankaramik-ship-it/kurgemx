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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.meta')
  const title = t('title')
  const description = t('description')
  return {
    title,
    description,
    keywords: t('keywords'),
    openGraph: { title, description, type: 'website' },
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
