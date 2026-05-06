'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { projeOlusturVeDon } from '@/lib/projects/create'
import { useProje } from './ProjeContext'
import { ProgressBar } from './GenerateButton'

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

function dilAlgila(text: string): { code: string; label: string } | null {
  if (text.length < 20) return null
  if (/[ğşıöüçĞŞİÖÜÇ]/.test(text)) return { code: 'TR', label: 'Algılanan dil: Türkçe' }
  if (/[؀-ۿ]/.test(text)) return { code: 'AR', label: 'اللغة المكتشفة: عربية' }
  if (/[Ѐ-ӿ]/.test(text)) return { code: 'RU', label: 'Обнаруженный язык: Русский' }
  if (/[一-鿿぀-ゟ゠-ヿ]/.test(text)) return { code: 'JA', label: '検出された言語: 日本語/中文' }
  return { code: 'EN', label: 'Detected language: English' }
}

function stripMarkdown(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
    .replace(/\*([\s\S]+?)\*/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n[-–—]\s*.{0,60}(?:Assistant|Asistan|KurgemX)[^\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function Adim1Formu() {
  const t = useTranslations('calismaEkrani.adim1')
  const tc = useTranslations('calismaEkrani')
  const locale = useLocale()
  const ctx = useProje()
  const [state, formAction, isPending] = useActionState(projeOlusturVeDon, null)
  const [adValue, setAdValue] = useState('')
  const [aciklamaLen, setAciklamaLen] = useState(0)
  const [yzCikti, setYzCikti] = useState<string | null>(null)
  const [yzYukleniyor, setYzYukleniyor] = useState(false)
  const [yzHata, setYzHata] = useState(false)

  const [algilananDil, setAlgilananDil] = useState<{ code: string; label: string } | null>(null)

  const adRef = useRef<HTMLInputElement>(null)
  const aciklamaRef = useRef<HTMLTextAreaElement>(null)

  // Streaming sırasında buton disabled — hem yzYukleniyor hem yzCikti kontrol edilir
  const canSubmit = !isPending && !yzYukleniyor && adValue.trim().length > 0 && yzCikti !== null

  useEffect(() => {
    if (state?.id && yzCikti) {
      const short = aciklamaRef.current?.value.trim() || null
      const dil = algilananDil?.code ?? (locale === 'tr' ? 'TR' : 'EN')
      ctx.setProje(state.id, adValue.trim(), short, yzCikti, dil)
      const route =
        locale === 'en'
          ? `/${locale}/projects/${state.id}`
          : `/${locale}/projeler/${state.id}`
      window.history.replaceState(null, '', route)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleYz() {
    const projeAdi = adRef.current?.value.trim() ?? ''
    const aciklama = aciklamaRef.current?.value.trim() ?? ''

    setYzYukleniyor(true)
    setYzHata(false)
    setYzCikti('')  // Kutuyu hemen aç (boş), chunks gelince dolacak

    let raw = ''
    try {
      const res = await fetch('/api/ai/detaylandir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi, aciklama, projeDili: algilananDil?.code }),
      })
      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
        setYzCikti(stripMarkdown(raw))
      }
    } catch {
      setYzCikti(null)
      setYzHata(true)
    } finally {
      setYzYukleniyor(false)
      if (raw) setYzCikti(stripMarkdown(raw))  // Son temizleme
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
      <input type="hidden" name="dil" value={algilananDil?.code ?? (locale === 'tr' ? 'TR' : 'EN')} />
      {/* Detailed Description (AI output) is what gets saved as aciklama */}
      <input type="hidden" name="aciklama" value={yzCikti ?? ''} />

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
          value={adValue}
          onChange={e => setAdValue(e.target.value)}
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
          rows={4}
          maxLength={500}
          placeholder={t('aciklamaPlaceholder')}
          onChange={e => {
            setAciklamaLen(e.target.value.length)
            setAlgilananDil(dilAlgila(e.target.value))
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E75B6] transition resize-none"
        />
        {algilananDil && (
          <p className="mt-1 text-[11px] text-gray-400">{algilananDil.label}</p>
        )}

        <div className="mt-2 space-y-2">
          <button
            type="button"
            onClick={handleYz}
            disabled={yzYukleniyor}
            className={`inline-flex items-center gap-1.5 rounded-md h-[34px] px-3.5 text-xs font-medium transition border-[0.5px] ${
              yzYukleniyor
                ? 'bg-[#1F3864] text-white border-transparent cursor-wait'
                : yzCikti !== null
                ? 'bg-white border-[#2E75B6]/50 text-[#1F3864] hover:bg-[#EEF4FB]'
                : 'border-[#1F3864] text-[#1F3864] hover:bg-[#EEF4FB]'
            }`}
          >
            {yzYukleniyor ? (
              <>
                <Spinner />
                <span>{t('yzOlusturuluyor')}</span>
              </>
            ) : (
              <>
                <SparkleIcon />
                <span>{yzCikti !== null ? tc('yenidenOlustur') : t('yzDetaylandir')}</span>
              </>
            )}
          </button>
          {yzYukleniyor && <ProgressBar />}
        </div>

        {(yzCikti !== null || yzHata) && (
          <div className="mt-3 rounded-lg border border-[#2E75B6]/25 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-[#2E75B6] mb-1.5">{t('yzCikti')}</p>
            {yzHata ? (
              <p className="text-sm text-red-500">{t('hatalar.genel')}</p>
            ) : (
              <>
                {!yzYukleniyor && (
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }} className="mb-1.5">
                    {t('yzDuzenleNot')}
                  </p>
                )}
                <textarea
                  value={yzCikti ?? ''}
                  onChange={e => setYzCikti(e.target.value)}
                  readOnly={yzYukleniyor}
                  rows={6}
                  className="w-full text-sm text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none"
                />
              </>
            )}
          </div>
        )}
      </div>

      {hataMesaji && (
        <p className="text-sm text-red-600">{hataMesaji}</p>
      )}

      {/* Create Project button + tooltip */}
      <div className="group relative w-full">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-[#1F3864] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#2E75B6] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isPending ? t('olusturuluyor') : t('olustur')}
        </button>
        {!canSubmit && !isPending && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-10 hidden group-hover:block">
            <span className="block whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white shadow">
              {t('olusturTooltip')}
            </span>
          </div>
        )}
      </div>
    </form>
  )
}
