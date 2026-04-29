'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

const LS_KEY = 'kurgemx_son_proje'

type SonProje = { id: string; ad: string }

export default function SonProjeKisayol() {
  const [sonProje, setSonProje] = useState<SonProje | null>(null)
  const locale = useLocale()
  const t = useTranslations('home')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setSonProje(JSON.parse(raw))
    } catch {}
  }, [])

  if (!sonProje) return null

  const href =
    locale === 'en'
      ? `/en/projects/${sonProje.id}`
      : `/tr/projeler/${sonProje.id}`

  return (
    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
      <span>{t('sonProje')}: </span>
      <Link
        href={href}
        className="font-medium text-gray-900 dark:text-gray-100 hover:underline"
      >
        {sonProje.ad}
      </Link>
    </div>
  )
}
