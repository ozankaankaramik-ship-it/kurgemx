'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { projeOlusturVeDon } from '@/lib/projects/create'
import { useProje, type ProjeBuyuklugu } from './ProjeContext'
import { planIzinVeriyor, type PlanOzellik } from '@/lib/abonelik'
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

const BUYUKLUK_SECENEKLER: ProjeBuyuklugu[] = ['Küçük', 'Orta', 'Büyük']

export default function Adim1Formu() {
  const t = useTranslations('calismaEkrani.adim1')
  const tc = useTranslations('calismaEkrani')
  const locale = useLocale()
  const ctx = useProje()
  const kullaniciPlan = ctx.kullaniciPlan
  const [state, formAction, isPending] = useActionState(projeOlusturVeDon, null)
  const [adValue, setAdValue] = useState('')
  const [aciklamaLen, setAciklamaLen] = useState(0)
  const [yzCikti, setYzCikti] = useState<string | null>(null)
  const [yzYukleniyor, setYzYukleniyor] = useState(false)
  const [yzHata, setYzHata] = useState(false)
  const [projeBuyuklugu, setProjeBuyuklugu] = useState<ProjeBuyuklugu | null>(null)

  const [algilananDil, setAlgilananDil] = useState<{ code: string; label: string } | null>(null)

  const adRef = useRef<HTMLInputElement>(null)
  const aciklamaRef = useRef<HTMLTextAreaElement>(null)
  const yzContainerRef = useRef<HTMLDivElement>(null)
  const yzScrollRef = useRef<HTMLDivElement>(null)
  const yzTextareaRef = useRef<HTMLTextAreaElement>(null)
  const createProjectRef = useRef<HTMLDivElement>(null)
  // Sayfa scroll'unu yalnızca içerik ilk kez belirdiğinde tetikle
  const didScrollIntoViewRef = useRef(false)

  // Textarea'yı içeriğe göre büyüt.
  // Streaming sırasında: yalnızca büyüt (height:auto sıfırı layout shift yaptığından).
  // Bittikten sonra: height:auto ile tam fit et.
  useEffect(() => {
    const ta = yzTextareaRef.current
    if (!ta) return
    if (yzYukleniyor) {
      const current = parseInt(ta.style.height) || 0
      if (ta.scrollHeight > current) ta.style.height = `${ta.scrollHeight}px`
    } else {
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [yzCikti, yzYukleniyor])

  // İç kapsayıcıyı aşağı kaydır — iş analizi dokümanıyla aynı davranış
  useEffect(() => {
    const el = yzScrollRef.current
    if (!el || !yzYukleniyor) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    if (isAtBottom) el.scrollTop = el.scrollHeight
  }, [yzCikti, yzYukleniyor])

  const limitDolmus: boolean = (() => {
    if (!kullaniciPlan) return false
    const { plan, abonelik } = kullaniciPlan
    if (plan.aylik_proje_limiti === null) return false
    if (!abonelik) return false
    return abonelik.aylik_proje_sayaci >= plan.aylik_proje_limiti
  })()

  const buyuklukIzinli = (secenek: ProjeBuyuklugu): boolean => {
    if (!kullaniciPlan) return true
    const ozellik: PlanOzellik | null =
      secenek === 'Orta' ? 'orta_proje' : secenek === 'Büyük' ? 'buyuk_proje' : null
    if (!ozellik) return true
    return planIzinVeriyor(kullaniciPlan.plan, ozellik)
  }

  const buyuklukHatasi = projeBuyuklugu !== null && !buyuklukIzinli(projeBuyuklugu)

  const buyuklukEtiketi = (b: ProjeBuyuklugu) => {
    if (locale === 'tr') return b === 'Büyük' ? 'Büyük' : b === 'Orta' ? 'Orta' : 'Küçük'
    return b === 'Büyük' ? 'Large' : b === 'Orta' ? 'Medium' : 'Small'
  }

  const maxIzinliStr = (() => {
    if (!kullaniciPlan) return locale === 'tr' ? 'Küçük' : 'Small'
    const p = kullaniciPlan.plan
    if (p.orta_proje) return locale === 'tr' ? 'Küçük veya Orta' : 'Small or Medium'
    return locale === 'tr' ? 'Küçük' : 'Small'
  })()

  const canSubmit = !isPending && !yzYukleniyor && adValue.trim().length > 0 && yzCikti !== null && !limitDolmus && !buyuklukHatasi

  useEffect(() => {
    if (state?.id && yzCikti) {
      const short = aciklamaRef.current?.value.trim() || null
      const dil = algilananDil?.code ?? (locale === 'tr' ? 'TR' : 'EN')
      ctx.setProje(state.id, adValue.trim(), short, yzCikti, dil)
      ctx.setProjeBuyuklugu(projeBuyuklugu ?? 'Orta')
      const route =
        locale === 'en'
          ? `/${locale}/projects/${state.id}`
          : `/${locale}/projeler/${state.id}`
      window.history.replaceState(null, '', route)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sayfa düzeyinde scrollIntoView — yalnızca içerik ilk kez belirdiğinde,
  // her chunk güncellemesinde değil
  useEffect(() => {
    if (!yzCikti) {
      didScrollIntoViewRef.current = false
      return
    }
    if (didScrollIntoViewRef.current) return
    didScrollIntoViewRef.current = true
    const el = yzContainerRef.current
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [yzCikti])

  async function handleYz() {
    const projeAdi = adRef.current?.value.trim() ?? ''
    const aciklama = aciklamaRef.current?.value.trim() ?? ''

    setYzYukleniyor(true)
    setYzHata(false)
    setYzCikti(null)
    setProjeBuyuklugu(null)

    const META_RE = /\n?<!--\s*META\s*\{[\s\S]*?\}\s*-->\n?/g

    try {
      const res = await fetch('/api/ai/detaylandir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projeAdi, aciklama, projeDili: algilananDil?.code }),
      })
      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setYzCikti(accumulated.replace(META_RE, ''))
      }
      accumulated += decoder.decode()

      // META'dan projeBuyuklugu ve hikayeSayisiTahmini'ni oku
      const metaMatch = accumulated.match(/<!--\s*META\s*(\{[\s\S]*?\})\s*-->/)
      let buyukluk: ProjeBuyuklugu = 'Orta'
      let hikayeSayisi = 5
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1]) as { projeBuyuklugu?: string; hikayeSayisiTahmini?: number }
          if (meta.projeBuyuklugu && BUYUKLUK_SECENEKLER.includes(meta.projeBuyuklugu as ProjeBuyuklugu)) {
            buyukluk = meta.projeBuyuklugu as ProjeBuyuklugu
          }
          if (Number.isFinite(meta.hikayeSayisiTahmini) && (meta.hikayeSayisiTahmini ?? 0) >= 1) {
            hikayeSayisi = meta.hikayeSayisiTahmini!
          }
        } catch { /* varsayılanları koru */ }
      }

      const finalText = stripMarkdown(accumulated.replace(META_RE, ''))
      setYzCikti(finalText)
      setProjeBuyuklugu(buyukluk)
      ctx.setProjeBuyuklugu(buyukluk)
      ctx.setHikayeSayisiTahmini(hikayeSayisi)
    } catch {
      setYzCikti(null)
      setYzHata(true)
    } finally {
      setYzYukleniyor(false)
      setTimeout(() => {
        createProjectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    }
  }

  function handleBuyuklukSec(secenek: ProjeBuyuklugu) {
    setProjeBuyuklugu(secenek)
    ctx.setProjeBuyuklugu(secenek)
  }

  const hataMesaji = (() => {
    if (!state?.error) return null
    const k = state.error
    if (k === 'ad_zorunlu') return t('hatalar.ad_zorunlu')
    if (k === 'ad_uzun') return t('hatalar.ad_uzun')
    if (k === 'yetkisiz') return t('hatalar.yetkisiz')
    if (k === 'limit_asildi') return null // aşağıda özel olarak render edilecek
    return t('hatalar.genel')
  })()

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="dil" value={algilananDil?.code ?? (locale === 'tr' ? 'TR' : 'EN')} />
      <input type="hidden" name="aciklama" value={yzCikti ?? ''} />
      <input type="hidden" name="proje_buyuklugu" value={projeBuyuklugu ?? ''} />

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
          <div ref={yzContainerRef} className="mt-3">
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
                {/* Tek scrollbar — iş analizi doküman penceresiyle aynı davranış.
                    Dış div scroll eder; içerideki textarea içeriğine göre büyür. */}
                <div
                  ref={yzScrollRef}
                  style={{ height: 400, resize: 'vertical', scrollBehavior: 'smooth' }}
                  className={`w-full rounded-lg border px-3 py-2.5 overflow-y-auto overflow-x-hidden ${
                    yzYukleniyor
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-[0.5px] border-[#2E75B6]'
                  }`}
                >
                  <textarea
                    ref={yzTextareaRef}
                    value={yzCikti ?? ''}
                    onChange={e => setYzCikti(e.target.value)}
                    readOnly={yzYukleniyor}
                    rows={1}
                    style={{ resize: 'none', overflow: 'hidden', display: 'block' }}
                    className="w-full text-sm text-gray-700 leading-relaxed outline-none bg-transparent border-0 p-0"
                  />
                </div>

                {!yzYukleniyor && projeBuyuklugu && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#2E75B6] mb-2">{t('projeBuyuklugu')}</p>

                    {buyuklukHatasi && projeBuyuklugu && (
                      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                        <p>
                          {locale === 'tr' ? (
                            <>
                              YZ tahmini: <strong>{buyuklukEtiketi(projeBuyuklugu)}</strong> proje &middot; Mevcut planınız (<strong>{kullaniciPlan?.plan.ad ?? 'Freemium'}</strong>) bu boyutu desteklemiyor.{' '}
                              <strong>{maxIzinliStr}</strong> proje olarak devam edebilir veya planınızı yükseltebilirsiniz.
                            </>
                          ) : (
                            <>
                              AI estimate: <strong>{buyuklukEtiketi(projeBuyuklugu)}</strong> project &middot; Your current plan (<strong>{kullaniciPlan?.plan.ad ?? 'Freemium'}</strong>) doesn&apos;t support this size.{' '}
                              You can continue with a <strong>{maxIzinliStr}</strong> project or upgrade your plan.
                            </>
                          )}
                        </p>
                        <a href={`/${locale}/pricing`} className="mt-1.5 inline-block font-medium text-amber-700 underline hover:no-underline">
                          {locale === 'tr' ? 'Planları Gör →' : 'View Plans →'}
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {BUYUKLUK_SECENEKLER.map((secenek) => {
                        const isActive = projeBuyuklugu === secenek
                        const izinli = buyuklukIzinli(secenek)
                        return (
                          <button
                            key={secenek}
                            type="button"
                            onClick={izinli ? () => handleBuyuklukSec(secenek) : undefined}
                            title={!izinli ? (locale === 'tr' ? 'Bu plan için mevcut değil → Planı Yükselt' : 'Not available on your plan → Upgrade') : undefined}
                            className={`relative flex flex-col items-center rounded-lg border px-2 py-2.5 text-center transition ${
                              !izinli
                                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                : isActive
                                ? 'bg-[#1F3864] border-[#1F3864] text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-[#2E75B6] hover:text-[#1F3864]'
                            }`}
                          >
                            {!izinli && (
                              <span className="absolute top-1 right-1">
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </span>
                            )}
                            <span className="text-xs font-semibold">
                              {secenek === 'Küçük' ? t('kucuk') : secenek === 'Orta' ? t('orta') : t('buyuk')}
                            </span>
                            <span className={`mt-1 text-[10px] leading-tight ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                              {secenek === 'Küçük' ? t('kucukAlt') : secenek === 'Orta' ? t('ortaAlt') : t('buyukAlt')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {(limitDolmus || state?.error === 'limit_asildi') && (
        <p className="text-sm text-amber-600">
          {locale === 'tr'
            ? `Bu ay ${kullaniciPlan?.abonelik?.aylik_proje_sayaci ?? '?'}/${kullaniciPlan?.plan.aylik_proje_limiti ?? '?'} proje limitine ulaştınız.`
            : `You've reached ${kullaniciPlan?.abonelik?.aylik_proje_sayaci ?? '?'}/${kullaniciPlan?.plan.aylik_proje_limiti ?? '?'} projects this month.`}
          {' '}
          <a href={`/${locale}/pricing`} className="font-medium underline hover:no-underline">
            {locale === 'tr' ? 'Planı Yükselt →' : 'Upgrade →'}
          </a>
        </p>
      )}
      {buyuklukHatasi && (
        <p className="text-sm text-red-600">
          {locale === 'tr'
            ? 'Bu proje büyüklüğü planınızda mevcut değil.'
            : 'This project size is not available in your plan.'}
        </p>
      )}
      {hataMesaji && (
        <p className="text-sm text-red-600">{hataMesaji}</p>
      )}

      <div ref={createProjectRef} className="group relative w-full">
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
