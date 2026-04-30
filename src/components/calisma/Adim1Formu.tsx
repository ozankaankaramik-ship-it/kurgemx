'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { projeOlusturVeDon } from '@/lib/projects/create'

export default function Adim1Formu() {
  const t = useTranslations('calismaEkrani.adim1')
  const locale = useLocale()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(projeOlusturVeDon, null)
  const [aciklamaLen, setAciklamaLen] = useState(0)
  const [yzAcik, setYzAcik] = useState(false)
  const [yzYukleniyor, setYzYukleniyor] = useState(false)

  useEffect(() => {
    if (state?.id) {
      router.replace({ pathname: '/projeler/[id]', params: { id: state.id } })
    }
  }, [state, router])

  async function handleYz() {
    setYzYukleniyor(true)
    await new Promise(r => setTimeout(r, 800))
    setYzAcik(true)
    setYzYukleniyor(false)
  }

  const hataMesaji = (() => {
    if (!state?.error) return null
    const k = state.error
    if (k === 'ad_zorunlu') return t('hatalar.ad_zorunlu')
    if (k === 'ad_uzun') return t('hatalar.ad_uzun')
    if (k === 'yetkisiz') return t('hatalar.yetkisiz')
    return t('hatalar.genel')
  })()

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="dil" value={locale === 'tr' ? 'TR' : 'EN'} />

      <div>
        <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('projeAdi')} <span className="text-red-500">*</span>
        </label>
        <input
          id="ad"
          name="ad"
          type="text"
          required
          maxLength={100}
          placeholder={t('projeAdiPlaceholder')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E75B6] transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="aciklama" className="text-sm font-medium text-gray-700">
            {t('aciklama')}
          </label>
          <span className="text-xs text-gray-400">{aciklamaLen}/500</span>
        </div>
        <textarea
          id="aciklama"
          name="aciklama"
          rows={4}
          maxLength={500}
          placeholder={t('aciklamaPlaceholder')}
          onChange={e => setAciklamaLen(e.target.value.length)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E75B6] transition resize-none"
        />

        <button
          type="button"
          onClick={handleYz}
          disabled={yzYukleniyor}
          className="mt-2 text-sm font-medium text-[#2E75B6] hover:underline disabled:opacity-50 transition"
        >
          {yzYukleniyor ? '...' : t('yzDetaylandir')}
        </button>

        {yzAcik && (
          <div className="mt-3 rounded-lg border border-[#2E75B6]/25 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-[#2E75B6] mb-1.5">{t('yzCikti')}</p>
            <p className="text-sm text-gray-500 italic">{t('yzPlaceholder')}</p>
          </div>
        )}
      </div>

      {hataMesaji && (
        <p className="text-sm text-red-600">{hataMesaji}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#1F3864] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#2E75B6] disabled:opacity-50 transition"
      >
        {isPending ? t('olusturuluyor') : t('olustur')}
      </button>
    </form>
  )
}
