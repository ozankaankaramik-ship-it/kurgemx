'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import ProjeKarti from './ProjeKarti'
import { projeleriGetir, type ProjeListeRow } from '@/lib/projects/actions'

type Props = {
  initialProjeler: ProjeListeRow[]
  toplamSayiVar: boolean
}

const SAYFA_BOYUTU = 10

export default function ProjeListesi({ initialProjeler, toplamSayiVar }: Props) {
  const t = useTranslations('projeler')
  const locale = useLocale()
  const [projeler, setProjeler] = useState(initialProjeler)
  const [offset, setOffset] = useState(SAYFA_BOYUTU)
  const [bitti, setBitti] = useState(!toplamSayiVar)
  const [isPending, startTransition] = useTransition()

  function projeHref(id: string) {
    return locale === 'en' ? `/en/projects/${id}` : `/tr/projeler/${id}`
  }

  function formatTarih(tarihStr: string) {
    return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(tarihStr))
  }

  function dilEtiketi(dil: string) {
    if (locale === 'tr') return dil === 'EN' ? 'İngilizce' : 'Türkçe'
    return dil === 'EN' ? 'English' : 'Turkish'
  }

  function dahaFazlaYukle() {
    startTransition(async () => {
      const yeni = await projeleriGetir(offset)
      setProjeler((prev) => [...prev, ...yeni])
      setOffset((prev) => prev + SAYFA_BOYUTU)
      if (yeni.length < SAYFA_BOYUTU) setBitti(true)
    })
  }

  if (projeler.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('bosHal.baslik')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('bosHal.aciklama')}
        </p>
        <Link
          href="/projeler/yeni"
          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {t('bosHal.btn')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projeler.map((proje) => (
          <ProjeKarti
            key={proje.id}
            proje={proje}
            href={projeHref(proje.id)}
            sonGuncellemeMesaj={formatTarih(proje.guncelleme_tarihi)}
            hikayeEtiketi={t('kart.hikayeSayisi')}
            dokumanEtiketi={t('kart.dokumanSayisi')}
            dilEtiketi={dilEtiketi(proje.dil)}
          />
        ))}
      </div>

      {!bitti && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={dahaFazlaYukle}
            disabled={isPending}
            className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? '...' : t('daha')}
          </button>
        </div>
      )}
    </div>
  )
}
