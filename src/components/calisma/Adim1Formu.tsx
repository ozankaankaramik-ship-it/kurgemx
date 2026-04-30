'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { projeOlusturVeDon } from '@/lib/projects/create'

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1v3M8 12v3M1 8h3M12 8h3M3.22 3.22l2.12 2.12M10.66 10.66l2.12 2.12M10.66 5.34l2.12-2.12M3.22 12.78l2.12-2.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#1F3864]/30 border-t-[#1F3864] animate-spin"
      aria-hidden="true"
    />
  )
}

export default function Adim1Formu() {
  const t = useTranslations('calismaEkrani.adim1')
  const locale = useLocale()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(projeOlusturVeDon, null)
  const [aciklamaLen, setAciklamaLen] = useState(0)
  const [yzCikti, setYzCikti] = useState<string | null>(null)
  const [yzYukleniyor, setYzYukleniyor] = useState(false)
  const [yzHata, setYzHata] = useState(false)

  const adRef = useRef<HTMLInputElement>(null)
  const aciklamaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state?.id) {
      router.replace({ pathname: '/projeler/[id]', params: { id: state.id } })
    }
  }, [state, router])

  async function handleYz() {
    const projeAdi = adRef.current?.value.trim() ?? ''
    const aciklama = aciklamaRef.current?.value.trim() ?? ''

    setYzYukleniyor(true)
    setYzHata(false)
    setYzCikti(null)

    try {
      const res = await fetch('/api/ai/detaylandir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi, aciklama }),
      })
      const json = await res.json()
      if (!res.ok || !json.detay) throw new Error()
      setYzCikti(json.detay as string)
    } catch {
      setYzHata(true)
    } finally {
      setYzYukleniyor(false)
    }
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
          ref={adRef}
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
          ref={aciklamaRef}
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
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#1F3864] px-3 py-1.5 text-sm font-medium text-[#1F3864] hover:bg-[#EEF4FB] disabled:opacity-50 transition"
        >
          {yzYukleniyor ? (
            <>
              <Spinner />
              <span>{t('yzDetaylandir')}</span>
            </>
          ) : (
            <>
              <SparkleIcon />
              <span>{t('yzDetaylandir')}</span>
            </>
          )}
        </button>

        {(yzCikti || yzHata) && (
          <div className="mt-3 rounded-lg border border-[#2E75B6]/25 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-[#2E75B6] mb-1.5">{t('yzCikti')}</p>
            {yzHata ? (
              <p className="text-sm text-red-500">{t('hatalar.genel')}</p>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{yzCikti}</p>
            )}
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
